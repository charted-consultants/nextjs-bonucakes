import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

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

function adminEmail(data: z.infer<typeof schema>, date: string) {
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
<body style="font-family:Arial,sans-serif;background:#f8faf9;margin:0;padding:0;">
<div style="max-width:600px;margin:40px auto;background:#fff;border:2px solid #fcc56c;border-radius:8px;overflow:hidden;">
  <div style="background:#083121;padding:28px 30px;text-align:center;">
    <h1 style="margin:0;font-size:22px;font-family:Georgia,serif;color:#fcc56c;">Bếp Bà Bo 🌿</h1>
    <p style="margin:8px 0 0;color:#f8faf9;font-size:13px;">Bánh Bông Lan Trứng Muối — Pre-Order</p>
  </div>
  <div style="padding:36px 30px;">
    <p style="font-size:17px;color:#083121;margin:0 0 16px;">Xin chào <strong>${name}</strong>,</p>
    <p style="color:#4a5c52;line-height:1.7;margin:0 0 16px;">
      Bonu đã nhận được yêu cầu pre-order <strong>${quantity} cái Bánh Bông Lan Trứng Muối</strong> của bạn rồi!
    </p>
    <p style="color:#4a5c52;line-height:1.7;margin:0 0 24px;">
      Bonu sẽ liên hệ với bạn trong vòng <strong>1–2 ngày</strong> để xác nhận ngày giao và thanh toán nhé.
    </p>
    <div style="background:#f8faf9;border-left:4px solid #fcc56c;padding:16px 20px;border-radius:4px;margin-bottom:24px;">
      <p style="margin:0;color:#083121;font-size:14px;">
        Bánh Bông Lan Trứng Muối — £40/cái<br>
        Cốt bánh mềm mịn, trứng muối nướng bùi thơm, chà bông chuẩn, 4 loại sốt đặc biệt.
      </p>
    </div>
    <p style="color:#4a5c52;margin:0;">Hẹn gặp bạn sớm,<br><strong>Bà Bo</strong> 🌿</p>
  </div>
  <div style="background:#f8faf9;padding:16px 30px;text-align:center;border-top:1px solid #fcc56c;">
    <p style="margin:0;color:#4a5c52;font-size:12px;">Bếp Bà Bo — Đồ ăn Việt Nam tự làm từ công thức truyền thống</p>
  </div>
</div>
</body></html>`.trim();
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

    // Save as workshop registration reusing existing table
    await prisma.workshopRegistration.create({
      data: {
        customerId: customer.id,
        workshopName: 'Pre-Order BLTM',
        location: data.location,
        phone: data.phone,
        specificQuestions: data.note || null,
        otherNotes: `Số lượng: ${data.quantity} cái`,
        registrationDate: now,
      },
    });

    // Send emails
    await Promise.all([
      resend.emails.send({
        from: FROM_EMAIL,
        to: ADMIN_EMAIL,
        replyTo: data.email,
        subject: `[Pre-Order BLTM] ${data.name} — ${data.quantity} cái`,
        html: adminEmail(data, dateStr),
      }),
      resend.emails.send({
        from: FROM_EMAIL,
        to: data.email,
        subject: 'Bonu đã nhận pre-order của bạn rồi! 🌿',
        html: guestEmail(data.name, data.quantity),
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[preorder-bltm] error:', err);
    return NextResponse.json({ error: 'Có lỗi xảy ra, vui lòng thử lại.' }, { status: 500 });
  }
}
