import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { WORKSHOP_NAME_REGISTRATION } from '@/lib/registration-types';

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'Bếp Bà Bo <noreply@chartedconsultants.com>';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'info@bonucakes.com';

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  age: z.string().min(1),
  location: z.string().min(1),
  phone: z.string().min(6),
  stage: z.string().min(1),
  model: z.string().min(1),
  motivation: z.string().min(1),
  barriers: z.array(z.string()).min(1),
  dreamed: z.string().min(1),
  willingOvertime: z.string().optional(),
  wantToHear: z.string().min(1),
  questions: z.string().optional(),
  referral: z.string().min(1),
});

type WorkshopData = z.infer<typeof schema>;

function row(label: string, value: string) {
  return `<div style="margin-bottom:12px;"><strong style="color:#4a5c52;">${label}</strong><br><span style="color:#083121;white-space:pre-wrap;">${value}</span></div>`;
}

function adminEmail(data: WorkshopData, date: string) {
  const rows = [
    row('1. Tên', data.name),
    row('2. Email', data.email),
    row('3. Độ tuổi / năm sinh', data.age),
    row('4. Đang sống ở', data.location),
    row('5. WhatsApp / Zalo', data.phone),
    row('6. Giai đoạn F&B', data.stage),
    row('7. Mô hình quan tâm', data.model),
    row('8. Động lực kinh doanh', data.motivation),
    row('9. Điều đang ngăn cản', data.barriers.join(', ')),
    row('10. Từng nghĩ có quán nhỏ', data.dreamed),
    data.willingOvertime ? row('11. Sẵn sàng làm thêm giờ', data.willingOvertime) : '',
    row('12. Điều muốn nghe nhất', data.wantToHear),
    data.questions ? row('13. Câu hỏi / chia sẻ', data.questions) : '',
    row('14. Biết đến WS qua', data.referral),
  ].join('');

  return `
<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="font-family:Arial,sans-serif;background:#f8faf9;margin:0;padding:0;">
<div style="max-width:600px;margin:40px auto;background:#fff;border:2px solid #fcc56c;border-radius:8px;overflow:hidden;">
  <div style="background:#083121;padding:28px 30px;text-align:center;">
    <h1 style="margin:0;font-size:22px;font-family:Georgia,serif;color:#fcc56c;">Đăng ký Workshop mới</h1>
    <p style="margin:8px 0 0;color:#f8faf9;font-size:13px;">Bếp Bà Bo — ${date}</p>
  </div>
  <div style="padding:32px 30px;">
    <div style="background:#f8faf9;border-left:4px solid #fcc56c;padding:20px;border-radius:4px;margin-bottom:20px;">
      ${rows}
    </div>
    <div style="text-align:center;">
      <a href="mailto:${data.email}?subject=Workshop Bếp Bà Bo — Phản hồi"
         style="display:inline-block;background:#fcc56c;color:#083121;padding:12px 28px;text-decoration:none;border-radius:4px;font-weight:bold;">
        Trả lời ${data.name}
      </a>
    </div>
  </div>
  <div style="background:#f8faf9;padding:16px 30px;text-align:center;border-top:1px solid #fcc56c;">
    <p style="margin:0;color:#4a5c52;font-size:12px;">Gửi từ form đăng ký workshop — bonucakes.com/workshop</p>
  </div>
</div>
</body></html>`.trim();
}

function guestEmail(name: string) {
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
      Cảm ơn bạn đã đăng ký tham gia workshop của <strong>Bếp Bà Bo</strong>!
    </p>
    <p style="color:#4a5c52;line-height:1.7;margin:0 0 24px;">
      Bonu đã nhận được thông tin và sẽ liên hệ với bạn để gửi <strong>link tham gia</strong>
      cùng các thông tin cần thiết trước buổi workshop nhé.
    </p>
    <div style="text-align:center;margin-bottom:32px;">
      <a href="https://bonucakes.com/products"
         style="display:inline-block;background:#fcc56c;color:#083121;padding:12px 28px;text-decoration:none;border-radius:4px;font-weight:bold;">
        Xem sản phẩm của Bonu
      </a>
    </div>
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
          consentSource: 'workshop',
          tags: ['workshop_interest'],
        },
      });
    }

    // Lưu đăng ký workshop (các câu chưa có cột riêng → gộp vào otherNotes)
    await prisma.workshopRegistration.create({
      data: {
        customerId: customer.id,
        workshopName: WORKSHOP_NAME_REGISTRATION,
        age: data.age,
        location: data.location,
        phone: data.phone,
        fbExperience: data.stage,
        goals: data.motivation,
        barriers: data.barriers,
        specificQuestions: data.questions || null,
        referralSource: data.referral,
        otherNotes: [
          `Mô hình quan tâm: ${data.model}`,
          `Từng nghĩ có quán nhỏ: ${data.dreamed}`,
          data.willingOvertime ? `Sẵn sàng làm thêm giờ: ${data.willingOvertime}` : null,
          `Điều muốn nghe nhất: ${data.wantToHear}`,
        ].filter(Boolean).join('\n'),
        registrationDate: now,
      },
    });

    // Gửi email — KHÔNG để email lỗi kéo cả request thành 500.
    // DB đã ghi xong → khách phải thấy thành công; lỗi email chỉ log lại.
    try {
      await Promise.all([
        resend.emails.send({
          from: FROM_EMAIL,
          to: ADMIN_EMAIL,
          replyTo: data.email,
          subject: `[Workshop] Đăng ký mới — ${data.name}`,
          html: adminEmail(data, dateStr),
        }),
        resend.emails.send({
          from: FROM_EMAIL,
          to: data.email,
          subject: 'Bonu đã nhận được thông tin của bạn rồi 🌿',
          html: guestEmail(data.name),
        }),
      ]);
    } catch (mailErr) {
      console.error('[workshop] email send failed (DB row was saved):', mailErr);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[workshop] error:', err);
    return NextResponse.json({ error: 'Có lỗi xảy ra, vui lòng thử lại.' }, { status: 500 });
  }
}
