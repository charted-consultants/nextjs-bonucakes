import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { CONSULTATION_SLOT_OPTIONS } from '@/lib/consultation-slots';
import { WORKSHOP_NAME_BOOKING_1ON1 } from '@/lib/registration-types';

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'Bếp Bà Bo <noreply@chartedconsultants.com>';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'info@bonucakes.com';

const WORKSHOP_NAME = WORKSHOP_NAME_BOOKING_1ON1;

const schema = z.object({
  name: z.string().min(2),
  phone: z.string().min(6),
  email: z.string().email(),
  slot: z.string().refine((s) => CONSULTATION_SLOT_OPTIONS.includes(s), {
    message: 'Khung giờ không hợp lệ.',
  }),
  businessInfo: z.string().optional(),
  message: z.string().optional(),
});

type BookingData = z.infer<typeof schema>;

function adminEmail(data: BookingData, date: string) {
  return `
<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="font-family:Arial,sans-serif;background:#f8faf9;margin:0;padding:0;">
<div style="max-width:600px;margin:40px auto;background:#fff;border:2px solid #fcc56c;border-radius:8px;overflow:hidden;">
  <div style="background:#083121;padding:28px 30px;text-align:center;">
    <h1 style="margin:0;font-size:22px;font-family:Georgia,serif;color:#fcc56c;">Đặt lịch tư vấn 1-1 mới</h1>
    <p style="margin:8px 0 0;color:#f8faf9;font-size:13px;">Bếp Bà Bo — ${date}</p>
  </div>
  <div style="padding:32px 30px;">
    <div style="background:#083121;border-radius:6px;padding:18px 20px;margin-bottom:20px;text-align:center;">
      <p style="margin:0 0 4px;color:#f8faf9;font-size:13px;">Khung giờ khách chọn</p>
      <p style="margin:0;color:#fcc56c;font-size:20px;font-weight:bold;">${data.slot}</p>
    </div>
    <div style="background:#f8faf9;border-left:4px solid #fcc56c;padding:20px;border-radius:4px;margin-bottom:20px;">
      <div style="margin-bottom:10px;"><strong style="color:#4a5c52;">Họ tên:</strong> <span style="color:#083121;">${data.name}</span></div>
      <div style="margin-bottom:10px;"><strong style="color:#4a5c52;">Điện thoại:</strong> <a href="tel:${data.phone}" style="color:#083121;">${data.phone}</a></div>
      <div style="margin-bottom:0;"><strong style="color:#4a5c52;">Email:</strong> <a href="mailto:${data.email}" style="color:#083121;">${data.email}</a></div>
    </div>
    ${data.businessInfo ? `
    <div style="border:1px solid #fcc56c;border-radius:4px;padding:20px;margin-bottom:16px;">
      <p style="margin:0 0 8px;font-size:14px;font-weight:bold;color:#083121;">Thông tin kinh doanh:</p>
      <p style="margin:0;color:#4a5c52;white-space:pre-wrap;">${data.businessInfo}</p>
    </div>` : ''}
    ${data.message ? `
    <div style="border:1px solid #fcc56c;border-radius:4px;padding:20px;margin-bottom:24px;">
      <p style="margin:0 0 8px;font-size:14px;font-weight:bold;color:#083121;">Nhu cầu / câu hỏi:</p>
      <p style="margin:0;color:#4a5c52;white-space:pre-wrap;">${data.message}</p>
    </div>` : ''}
    <div style="text-align:center;">
      <a href="tel:${data.phone}"
         style="display:inline-block;background:#fcc56c;color:#083121;padding:12px 28px;text-decoration:none;border-radius:4px;font-weight:bold;">
        Gọi xác nhận lịch cho ${data.name}
      </a>
    </div>
  </div>
  <div style="background:#f8faf9;padding:16px 30px;text-align:center;border-top:1px solid #fcc56c;">
    <p style="margin:0;color:#4a5c52;font-size:12px;">Gửi từ form đặt lịch tư vấn 1-1 — bonucakes.com/workshop_booking1-1</p>
  </div>
</div>
</body></html>`.trim();
}

function guestEmail(name: string, slot: string) {
  return `
<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="font-family:Arial,sans-serif;background:#f8faf9;margin:0;padding:0;">
<div style="max-width:600px;margin:40px auto;background:#fff;border:2px solid #fcc56c;border-radius:8px;overflow:hidden;">
  <div style="background:#083121;padding:28px 30px;text-align:center;">
    <h1 style="margin:0;font-size:22px;font-family:Georgia,serif;color:#fcc56c;">Bếp Bà Bo 🌿</h1>
  </div>
  <div style="padding:36px 30px;">
    <p style="font-size:17px;color:#083121;margin:0 0 16px;">Xin chào <strong>${name}</strong>,</p>
    <p style="color:#4a5c52;line-height:1.7;margin:0 0 16px;">
      Cảm ơn bạn đã đặt lịch <strong>tư vấn 1-1</strong> cùng Bonu!
    </p>
    <div style="background:#083121;border-radius:6px;padding:18px 20px;margin:0 0 20px;text-align:center;">
      <p style="margin:0 0 4px;color:#f8faf9;font-size:13px;">Khung giờ bạn chọn</p>
      <p style="margin:0;color:#fcc56c;font-size:20px;font-weight:bold;">${slot}</p>
    </div>
    <p style="color:#4a5c52;line-height:1.7;margin:0 0 24px;">
      Bonu sẽ liên hệ với bạn để <strong>xác nhận ngày cụ thể</strong> và trao đổi
      trực tiếp về định hướng kinh doanh của bạn nhé.
    </p>
    <p style="color:#4a5c52;margin:0;">Hẹn gặp bạn sớm,<br><strong>Bonu</strong> 🌿</p>
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
          consentSource: 'consultation_1on1',
          tags: ['consultation_1on1'],
        },
      });
    }

    // Lưu lịch tư vấn vào workshop_registrations để admin theo dõi "đã đặt lịch tư vấn"
    await prisma.workshopRegistration.create({
      data: {
        customerId: customer.id,
        workshopName: WORKSHOP_NAME,
        phone: data.phone,
        availability: data.slot,
        otherNotes: data.businessInfo || null,
        specificQuestions: data.message || null,
        registrationDate: now,
      },
    });

    // Gửi email — không để email lỗi kéo request thành 500.
    try {
      await Promise.all([
        resend.emails.send({
          from: FROM_EMAIL,
          to: ADMIN_EMAIL,
          replyTo: data.email,
          subject: `[Tư vấn 1-1] ${data.name} — ${data.slot}`,
          html: adminEmail(data, dateStr),
        }),
        resend.emails.send({
          from: FROM_EMAIL,
          to: data.email,
          subject: 'Bonu đã nhận lịch tư vấn 1-1 của bạn 🌿',
          html: guestEmail(data.name, data.slot),
        }),
      ]);
    } catch (mailErr) {
      console.error('[booking-1-1] email send failed (DB row was saved):', mailErr);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[booking-1-1] error:', err);
    return NextResponse.json({ error: 'Có lỗi xảy ra, vui lòng thử lại.' }, { status: 500 });
  }
}
