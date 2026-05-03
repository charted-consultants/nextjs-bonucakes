import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Resend } from 'resend';
import { getOrderTemplate, renderTemplate } from '@/lib/email-templates/render-template';

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'Bonu F&B <noreply@chartedconsultants.com>';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const orderId = params.id;
    const body = await request.json().catch(() => ({}));
    const adminNote = body.note || '';

    const order = await prisma.order.findFirst({
      where: { id: orderId, deletedAt: null },
      include: { items: true },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (order.status === 'confirmed' && order.paymentStatus === 'paid') {
      return NextResponse.json({ error: 'Order already confirmed' }, { status: 400 });
    }

    // Update order
    await prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'confirmed',
        paymentStatus: 'paid',
        paymentMethod: 'bank_transfer',
        paidAt: new Date(),
        adminNote: adminNote || order.adminNote,
        updatedAt: new Date(),
      },
    });

    await prisma.orderHistory.create({
      data: {
        orderId,
        status: 'confirmed',
        note: `Đã duyệt thanh toán chuyển khoản${adminNote ? ` - ${adminNote}` : ''}`,
      },
    });

    // Send confirmation email to customer
    try {
      const apiKey = process.env.RESEND_API_KEY;
      if (apiKey) {
        const resend = new Resend(apiKey);

        const fmt = (n: number) => `£${n.toFixed(2)}`;
        const orderItemsHtml = order.items.map(item => {
          const price = Number(item.price);
          return `<div style="background:#f8faf9;padding:12px;border:2px solid #fcc56c;border-radius:4px;margin:16px 0;">
            <p style="margin:0 0 6px 0;font-size:1.1em;"><strong>${item.quantity}x ${item.productName}</strong></p>
            ${price > 0 ? `<p style="margin:0;color:#4a5c52;">${fmt(price / item.quantity)} × ${item.quantity} = <strong>${fmt(price)}</strong></p>` : ''}
          </div>`;
        }).join('');

        const confirmedPaymentHtml = `
          <div style="background:#E8F5E9;padding:15px;border-left:4px solid #4CAF50;margin:20px 0;border-radius:4px;">
            <p style="margin:0 0 5px 0;color:#2E7D32;font-weight:bold;font-size:1.1em;">THANH TOÁN ĐÃ ĐƯỢC XÁC NHẬN</p>
            <p style="margin:0;color:#4a5c52;">Bếp nhà Bo đã nhận được thanh toán của bạn. Chúng tôi sẽ sớm liên hệ để sắp xếp giao hàng.</p>
          </div>`;

        const commonVars = {
          orderCode: order.orderNumber,
          customerName: order.customerName,
          orderItemsHtml,
          subtotal: fmt(Number(order.subtotal)),
          shippingFee: fmt(Number(order.shippingCost)),
          shippingLabel: order.shippingMethod || 'UK Mainland',
          total: fmt(Number(order.total)),
          deliveryDate: '',
        };

        // Try DB template first
        const confirmedTemplate = await getOrderTemplate('order-confirmed' as any);
        let html: string;
        let subject = `Đơn hàng #${order.orderNumber} đã được xác nhận - Bonu F&B`;

        if (confirmedTemplate) {
          html = renderTemplate(confirmedTemplate.html, {
            ...commonVars,
            emailTitle: 'Đơn hàng đã xác nhận',
            emailIntro: 'Bếp nhà Bo đã xác nhận thanh toán của bạn! Đơn hàng đang được chuẩn bị.',
            paymentSectionHtml: confirmedPaymentHtml,
            customerEmail: '',
            customerPhone: '',
            deliveryAddress: '',
            submissionDate: '',
            specialNotes: '',
          });
          if (confirmedTemplate.subject) {
            subject = renderTemplate(confirmedTemplate.subject, { orderCode: order.orderNumber });
          }
        } else {
          // Fallback inline template
          html = `
            <div style="font-family:sans-serif;max-width:650px;margin:0 auto;padding:8px;background:#f8faf9;">
              <div style="background:linear-gradient(135deg,#083121,#4a5c52);color:#f8faf9;padding:20px;text-align:center;border-radius:8px 8px 0 0;">
                <h1 style="margin:0;font-size:2em;color:#fcc56c;">Bonu F&B</h1>
                <p style="margin:10px 0 0 0;">Đơn hàng đã xác nhận</p>
              </div>
              <div style="background:#fff;padding:20px;border:1px solid #fcc56c;border-top:none;border-radius:0 0 8px 8px;">
                <p style="font-size:1.1em;">Xin chào <strong>${order.customerName}</strong>,</p>
                <p>Bếp nhà Bo đã xác nhận thanh toán và đơn hàng của bạn!</p>

                <div style="background:#f8faf9;padding:15px;border-left:4px solid #fcc56c;margin:20px 0;border-radius:4px;">
                  <p style="margin:0 0 5px 0;color:#083121;font-weight:bold;">MÃ ĐƠN HÀNG</p>
                  <p style="margin:0;font-size:1.3em;font-weight:bold;color:#083121;">#${order.orderNumber}</p>
                </div>

                ${confirmedPaymentHtml}

                <h2 style="color:#083121;">CHI TIẾT ĐƠN HÀNG</h2>
                ${orderItemsHtml}

                <div style="background:#f8faf9;padding:12px;border:2px solid #fcc56c;border-radius:4px;margin:16px 0;">
                  <p style="margin:0 0 8px 0;">Tạm tính: <strong>${fmt(Number(order.subtotal))}</strong></p>
                  <p style="margin:0 0 8px 0;">Phí giao hàng: <strong>${fmt(Number(order.shippingCost))}</strong></p>
                  <p style="margin:8px 0 0 0;font-size:1.1em;">Tổng cộng: <strong>${fmt(Number(order.total))}</strong></p>
                </div>

                <div style="background:#E3F2FD;padding:15px;border-left:4px solid #2196F3;margin:20px 0;border-radius:4px;">
                  <p style="margin:0;color:#1565C0;font-weight:bold;">BƯỚC TIẾP THEO</p>
                  <p style="margin:8px 0 0 0;color:#4a5c52;">Bếp nhà Bo sẽ liên hệ với bạn qua điện thoại để sắp xếp thời gian giao hàng. Vui lòng để ý điện thoại nhé!</p>
                </div>

                <div style="margin-top:24px;padding-top:16px;border-top:1px solid #fcc56c;">
                  <p style="color:#4a5c52;margin:0;font-style:italic;">Trân trọng,</p>
                  <p style="color:#083121;margin:4px 0 0 0;font-weight:bold;">Uyen Nguyen — Bonu F&B</p>
                </div>
              </div>
            </div>
          `;
        }

        await resend.emails.send({
          from: FROM_EMAIL,
          to: [order.customerEmail],
          subject,
          html,
        });

        console.log(`[confirm-payment] Confirmation email sent to ${order.customerEmail} for order ${order.orderNumber}`);
      }
    } catch (emailErr) {
      console.error('[confirm-payment] Failed to send email:', emailErr);
    }

    return NextResponse.json({ success: true, message: 'Order confirmed and customer notified' });
  } catch (error) {
    console.error('[confirm-payment] Error:', error);
    return NextResponse.json({ error: 'Failed to confirm order' }, { status: 500 });
  }
}
