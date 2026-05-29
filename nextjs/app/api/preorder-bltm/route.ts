import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { WORKSHOP_NAME_PREORDER_BLTM } from '@/lib/registration-types';

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'Bếp Bà Bo <noreply@chartedconsultants.com>';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'info@bonucakes.com';

const schema = z.object({
  name: z.string().min(2),
  location: z.string().min(2),
  phone: z.string().min(6),
  email: z.string().email(),
  quantity: z.number().int().min(1),
  note: z.string().optional(),
});

function adminEmail(
  data: z.infer<typeof schema>,
  date: string,
  stats: { totalOrders: number; totalCakes: number; totalRevenue: number; todayOrders: number; todayCakes: number }
) {
  return `
<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="font-family:Arial,sans-serif;background:#f8faf9;margin:0;padding:0;">
<div style="max-width:600px;margin:40px auto;background:#fff;border:2px solid #fcc56c;border-radius:8px;overflow:hidden;">
  <div style="background:#083121;padding:28px 30px;text-align:center;">
    <h1 style="margin:0;font-size:22px;font-family:Georgia,serif;color:#fcc56c;">Pre-Order mới — Bánh Bông Lan Trứng Muối</h1>
    <p style="margin:8px 0 0;color:#f8faf9;font-size:13px;">${date}</p>
  </div>
  <div style="padding:32px 30px;">

    <div style="background:#f8faf9;border-left:4px solid #fcc56c;padding:20px;border-radius:4px;margin-bottom:20px;">
      <div style="margin-bottom:10px;"><strong style="color:#4a5c52;">Họ tên:</strong> <span style="color:#083121;">${data.name}</span></div>
      <div style="margin-bottom:10px;"><strong style="color:#4a5c52;">Địa chỉ:</strong> <span style="color:#083121;">${data.location}</span></div>
      <div style="margin-bottom:10px;"><strong style="color:#4a5c52;">Điện thoại:</strong> <a href="tel:${data.phone}" style="color:#083121;">${data.phone}</a></div>
      <div style="margin-bottom:10px;"><strong style="color:#4a5c52;">Email:</strong> <a href="mailto:${data.email}" style="color:#083121;">${data.email}</a></div>
      <div style="margin-bottom:0;font-size:18px;">
        <strong style="color:#4a5c52;">Số lượng:</strong>
        <span style="color:#083121;font-weight:bold;"> ${data.quantity} cái</span>
        <span style="color:#4a5c52;font-size:14px;"> (£${data.quantity * 40} tổng)</span>
      </div>
    </div>

    ${data.note ? `
    <div style="border:1px solid #fcc56c;border-radius:4px;padding:20px;margin-bottom:24px;">
      <p style="margin:0 0 8px;font-size:14px;font-weight:bold;color:#083121;">Ghi chú:</p>
      <p style="margin:0;color:#4a5c52;white-space:pre-wrap;">${data.note}</p>
    </div>` : ''}

    <div style="background:#083121;border-radius:6px;padding:20px 24px;margin-bottom:24px;">
      <p style="margin:0 0 14px;font-size:13px;font-weight:bold;color:#fcc56c;text-transform:uppercase;letter-spacing:0.05em;">📊 Tổng cộng đến nay</p>
      <table style="width:100%;font-size:14px;color:#f8faf9;border-collapse:collapse;">
        <tr>
          <td style="padding:4px 0;color:#a3b8a8;">Tổng đơn:</td>
          <td style="padding:4px 0;font-weight:bold;text-align:right;">${stats.totalOrders} đơn</td>
        </tr>
        <tr>
          <td style="padding:4px 0;color:#a3b8a8;">Tổng số bánh:</td>
          <td style="padding:4px 0;font-weight:bold;text-align:right;">${stats.totalCakes} cái</td>
        </tr>
        <tr>
          <td style="padding:4px 0;color:#a3b8a8;">Doanh thu dự kiến:</td>
          <td style="padding:4px 0;font-weight:bold;color:#fcc56c;text-align:right;">£${stats.totalRevenue}</td>
        </tr>
        <tr><td colspan="2" style="padding:10px 0 6px;"><hr style="border:none;border-top:1px solid #4a5c52;margin:0;"></td></tr>
        <tr>
          <td style="padding:4px 0;color:#a3b8a8;">Hôm nay:</td>
          <td style="padding:4px 0;font-weight:bold;text-align:right;">${stats.todayOrders} đơn — ${stats.todayCakes} cái</td>
        </tr>
      </table>
    </div>

    <div style="text-align:center;">
      <a href="mailto:${data.email}?subject=Pre-Order Bánh Bông Lan Trứng Muối"
         style="display:inline-block;background:#fcc56c;color:#083121;padding:12px 28px;text-decoration:none;border-radius:4px;font-weight:bold;">
        Liên hệ ${data.name}
      </a>
    </div>
  </div>
  <div style="background:#f8faf9;padding:16px 30px;text-align:center;border-top:1px solid #fcc56c;">
    <p style="margin:0;color:#4a5c52;font-size:12px;">Gửi từ form pre-order — bonucakes.com</p>
  </div>
</div>
</body></html>`.trim();
}

function guestEmail(name: string, quantity: number) {
  return `
<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="font-family:Arial,sans-serif;background:#f0f4f1;margin:0;padding:0;">
<div style="max-width:560px;margin:40px auto;background:#fff;border-radius:10px;overflow:hidden;box-shadow:0 2px 12px rgba(8,49,33,0.08);">

  <div style="background:#083121;padding:32px 36px;text-align:center;">
    <p style="margin:0 0 4px;font-size:12px;letter-spacing:0.12em;color:#a3b8a8;text-transform:uppercase;">Bếp Bà Bo</p>
    <h1 style="margin:0;font-size:24px;font-family:Georgia,serif;color:#fcc56c;font-weight:normal;">Xác nhận Waiting List</h1>
  </div>

  <div style="padding:36px 36px 28px;">
    <p style="font-size:16px;color:#083121;margin:0 0 20px;">Xin chào <strong>${name}</strong>,</p>

    <p style="color:#4a5c52;line-height:1.75;margin:0 0 28px;">
      Thông tin đăng ký của bạn đã được Bonu ghi nhận. Khi bánh được mở bán chính thức, Bonu sẽ chủ động liên hệ để xác nhận ngày giao và hướng dẫn thanh toán.
    </p>

    <div style="border:1px solid #e2ebe4;border-radius:8px;overflow:hidden;margin-bottom:28px;">
      <div style="background:#f8faf9;padding:12px 20px;border-bottom:1px solid #e2ebe4;">
        <p style="margin:0;font-size:11px;color:#4a5c52;letter-spacing:0.08em;text-transform:uppercase;font-weight:bold;">Chi tiết đăng ký</p>
      </div>
      <div style="padding:20px;">
        <table style="width:100%;border-collapse:collapse;font-size:14px;">
          <tr>
            <td style="padding:6px 0;color:#4a5c52;width:50%;">Sản phẩm</td>
            <td style="padding:6px 0;color:#083121;font-weight:bold;">Bánh Bông Lan Trứng Muối</td>
          </tr>
          <tr>
            <td style="padding:6px 0;color:#4a5c52;">Số lượng</td>
            <td style="padding:6px 0;color:#083121;font-weight:bold;">${quantity} cái</td>
          </tr>
          <tr>
            <td style="padding:6px 0;color:#4a5c52;">Giá dự kiến</td>
            <td style="padding:6px 0;color:#083121;font-weight:bold;">£${quantity * 40}</td>
          </tr>
          <tr>
            <td style="padding:6px 0;color:#4a5c52;">Trạng thái</td>
            <td style="padding:6px 0;"><span style="display:inline-block;background:#e8f5ec;color:#1a6635;font-size:12px;font-weight:bold;padding:3px 10px;border-radius:20px;">Đã vào waiting list</span></td>
          </tr>
        </table>
      </div>
    </div>

    <p style="color:#4a5c52;font-size:13px;line-height:1.7;margin:0 0 28px;padding:14px 16px;background:#fffbf0;border-left:3px solid #fcc56c;border-radius:4px;">
      Nếu có thắc mắc, bạn có thể liên hệ Bonu qua Facebook hoặc reply thẳng email này nhé.
    </p>

    <p style="color:#4a5c52;margin:0;font-size:14px;">Trân trọng,<br><strong style="color:#083121;">Bếp Bà Bo</strong></p>
  </div>

  <div style="background:#f8faf9;padding:16px 36px;text-align:center;border-top:1px solid #e2ebe4;">
    <p style="margin:0;color:#4a5c52;font-size:11px;letter-spacing:0.04em;">Bếp Bà Bo · Đồ ăn Việt Nam tự làm · bonucakes.com</p>
  </div>

</div>
</body></html>`.trim();
}

async function getBltmStats() {
  const allOrders = await prisma.workshopRegistration.findMany({
    where: { workshopName: WORKSHOP_NAME_PREORDER_BLTM, deletedAt: null },
    select: { preorderQuantity: true, createdAt: true },
  });

  const todayVN = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' }));
  todayVN.setHours(0, 0, 0, 0);

  let totalCakes = 0;
  let todayOrders = 0;
  let todayCakes = 0;

  for (const o of allOrders) {
    const qty = o.preorderQuantity ?? 1;
    totalCakes += qty;
    const orderDateVN = new Date(o.createdAt.toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' }));
    if (orderDateVN >= todayVN) {
      todayOrders++;
      todayCakes += qty;
    }
  }

  return {
    totalOrders: allOrders.length,
    totalCakes,
    totalRevenue: totalCakes * 40,
    todayOrders,
    todayCakes,
  };
}

export async function POST(req: NextRequest) {
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const body = await req.json();
    const result = schema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: 'Thông tin không hợp lệ.' }, { status: 400 });
    }

    const data = result.data;
    const now = new Date();
    const dateStr = now.toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });

    // Upsert customer
    let customer = await prisma.customer.findUnique({ where: { email: data.email } });
    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          name: data.name,
          email: data.email,
          phone: data.phone,
          marketingConsent: true,
          consentedAt: now,
          consentSource: 'preorder',
          tags: ['preorder_bltm'],
        },
      });
    }

    // Save preorder
    await prisma.workshopRegistration.create({
      data: {
        customerId: customer.id,
        workshopName: WORKSHOP_NAME_PREORDER_BLTM,
        location: data.location,
        phone: data.phone,
        specificQuestions: data.note || null,
        otherNotes: `Số lượng: ${data.quantity} cái`,
        preorderQuantity: data.quantity,
        registrationDate: now,
      },
    });

    // Query cumulative stats (includes the order just saved)
    const stats = await getBltmStats();

    // Send emails — không để email lỗi kéo request thành 500.
    try {
      await Promise.all([
        resend.emails.send({
          from: FROM_EMAIL,
          to: ADMIN_EMAIL,
          replyTo: data.email,
          subject: `[Pre-Order BLTM] ${data.name} — ${data.quantity} cái | Tổng: ${stats.totalOrders} đơn / ${stats.totalCakes} cái`,
          html: adminEmail(data, dateStr, stats),
        }),
        resend.emails.send({
          from: FROM_EMAIL,
          to: data.email,
          subject: 'Bonu đã nhận pre-order của bạn rồi! 🌿',
          html: guestEmail(data.name, data.quantity),
        }),
      ]);
    } catch (mailErr) {
      console.error('[preorder-bltm] email send failed (DB row was saved):', mailErr);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[preorder-bltm] error:', err);
    return NextResponse.json({ error: 'Có lỗi xảy ra, vui lòng thử lại.' }, { status: 500 });
  }
}
