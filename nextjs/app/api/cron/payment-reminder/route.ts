import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Resend } from 'resend';

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'Bonu F&B <noreply@chartedconsultants.com>';
const CRON_SECRET = process.env.CRON_SECRET || '';

const BANK_DETAILS = {
  bankName: 'Tide (Business Account)',
  accountName: 'Bonu Cakes Ltd',
  sortCode: '04-06-05',
  accountNumber: '18828806',
};

export async function GET(request: NextRequest) {
  // Protect with secret key
  const authHeader = request.headers.get('authorization');
  const secret = request.nextUrl.searchParams.get('secret');

  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}` && secret !== CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000);

    // Find unpaid bank_transfer orders older than 12h with no reminder sent yet
    const orders = await prisma.order.findMany({
      where: {
        paymentStatus: 'pending',
        paymentMethod: null, // bank transfer orders don't have paymentMethod set until confirmed
        reminderSentAt: null,
        paymentProofUrl: null, // skip if customer already uploaded proof
        createdAt: { lte: twelveHoursAgo },
        status: { in: ['pending'] },
        deletedAt: null,
      },
      include: { items: true },
    });

    if (orders.length === 0) {
      return NextResponse.json({ message: 'No orders to remind', count: 0 });
    }

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'RESEND_API_KEY not configured' }, { status: 500 });
    }

    const resend = new Resend(apiKey);
    let sent = 0;
    let failed = 0;

    for (const order of orders) {
      try {
        const itemsHtml = order.items
          .map(i => `<li>${i.quantity}x ${i.productName}</li>`)
          .join('');

        const html = `
          <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px;background:#f8faf9;">
            <div style="background:linear-gradient(135deg,#083121,#4a5c52);color:#f8faf9;padding:20px;text-align:center;border-radius:8px 8px 0 0;">
              <h1 style="margin:0;font-size:1.8em;color:#fcc56c;">Bonu F&B</h1>
              <p style="margin:8px 0 0 0;">Nhắc nhở thanh toán đơn hàng</p>
            </div>
            <div style="background:#fff;padding:20px;border:1px solid #fcc56c;border-top:none;border-radius:0 0 8px 8px;">
              <p style="font-size:1.1em;">Xin chào <strong>${order.customerName}</strong>,</p>
              <p>Bếp nhà Bo nhận thấy đơn hàng <strong>#${order.orderNumber}</strong> của bạn vẫn chưa được thanh toán.</p>

              <div style="background:#f8faf9;padding:12px;border-left:4px solid #fcc56c;margin:16px 0;border-radius:4px;">
                <p style="margin:0;font-weight:bold;color:#083121;">Đơn hàng của bạn:</p>
                <ul style="margin:8px 0 0 0;padding-left:20px;color:#4a5c52;">${itemsHtml}</ul>
                <p style="margin:8px 0 0 0;font-size:1.1em;"><strong>Tổng: £${Number(order.total).toFixed(2)}</strong></p>
              </div>

              <h3 style="color:#083121;">Thông tin chuyển khoản:</h3>
              <div style="background:#f8faf9;padding:12px;border:2px solid #fcc56c;border-radius:4px;margin:16px 0;">
                <p style="margin:0 0 8px 0;"><strong>Ngân hàng:</strong> ${BANK_DETAILS.bankName}</p>
                <p style="margin:0 0 8px 0;"><strong>Tên tài khoản:</strong> ${BANK_DETAILS.accountName}</p>
                <p style="margin:0 0 8px 0;"><strong>Sort Code:</strong> ${BANK_DETAILS.sortCode}</p>
                <p style="margin:0 0 8px 0;"><strong>Số tài khoản:</strong> ${BANK_DETAILS.accountNumber}</p>
                <p style="margin:0;padding-top:10px;border-top:1px solid #fcc56c;"><strong>Nội dung chuyển khoản:</strong> <span style="color:#083121;font-size:1.2em;font-weight:bold;">#${order.orderNumber}</span></p>
              </div>

              <div style="background:#FFF3E0;padding:12px;border-left:4px solid #F57C00;margin:16px 0;border-radius:4px;">
                <p style="margin:0;color:#F57C00;font-weight:bold;">Vui lòng hoàn tất thanh toán để Bếp xác nhận đơn hàng.</p>
              </div>

              <p style="color:#4a5c52;margin-top:20px;">Nếu bạn đã chuyển khoản, vui lòng bỏ qua email này. Bếp sẽ xác nhận sớm nhất có thể.</p>
              <p style="color:#4a5c52;">Nếu cần hỗ trợ, vui lòng liên hệ qua Facebook.</p>

              <div style="margin-top:24px;padding-top:16px;border-top:1px solid #fcc56c;">
                <p style="color:#4a5c52;margin:0;font-style:italic;">Trân trọng,</p>
                <p style="color:#083121;margin:4px 0 0 0;font-weight:bold;">Uyen Nguyen — Bonu F&B</p>
              </div>
            </div>
          </div>
        `;

        await resend.emails.send({
          from: FROM_EMAIL,
          to: [order.customerEmail],
          subject: `Nhắc nhở: Đơn hàng #${order.orderNumber} chưa được thanh toán`,
          html,
        });

        await prisma.order.update({
          where: { id: order.id },
          data: { reminderSentAt: new Date() },
        });

        await prisma.orderHistory.create({
          data: {
            orderId: order.id,
            status: order.status,
            note: 'Email nhắc nhở thanh toán đã được gửi (12h)',
          },
        });

        sent++;
      } catch (err) {
        console.error(`[cron] Failed to send reminder for order ${order.orderNumber}:`, err);
        failed++;
      }
    }

    console.log(`[cron/payment-reminder] Sent ${sent} reminders, ${failed} failed`);
    return NextResponse.json({ message: 'Done', sent, failed });
  } catch (error) {
    console.error('[cron/payment-reminder] Error:', error);
    return NextResponse.json({ error: 'Cron job failed' }, { status: 500 });
  }
}
