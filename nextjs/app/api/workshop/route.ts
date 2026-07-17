import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { WORKSHOP_NAME_REGISTRATION } from '@/lib/registration-types';

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'Bếp Bà Bo <noreply@chartedconsultants.com>';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'info@bonucakes.com';
const SITE_URL = process.env.NEXTAUTH_URL || 'https://bonucakes.com';
const WHATSAPP_GROUP_URL = 'https://chat.whatsapp.com/DdjyY3ZPExaKPLFXFP6ZoG';

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(6),
  location: z.string().min(1),
  stage: z.string().min(1),
  model: z.array(z.string()).min(1),
  painPoints: z.array(z.string()).optional(),
  timeSpent: z.string().min(1),
  singleProblem: z.string().min(1),
  thoughtAboutIt: z.string().optional(),
  failureReason: z.string().min(1),
  wantAfterWorkshop: z.string().min(1),
  questionForBo: z.string().min(1),
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
    row('3. WhatsApp / Zalo', data.phone),
    row('4. Đang sống ở', data.location),
    row('5. Giai đoạn', data.stage),
    row('6. Mô hình kinh doanh', data.model.join(', ')),
    data.painPoints && data.painPoints.length > 0 ? row('7. "Càng bán càng mệt" vì', data.painPoints.join(', ')) : '',
    row('8. Thời gian vận hành/ngày', data.timeSpent),
    row('9. Vấn đề muốn giải quyết nhất', data.singleProblem),
    data.thoughtAboutIt ? row('10. Nuôi quán hay quán nuôi mình', data.thoughtAboutIt) : '',
    row('11. Nguyên nhân F&B thất bại (theo họ)', data.failureReason),
    row('12. Mong muốn sau Workshop', data.wantAfterWorkshop),
    row('13. Câu hỏi cho Ms. Bo', data.questionForBo),
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

    <!-- ===== WHATSAPP INVITE BLOCK ===== -->
    <div style="background:#f8faf9;border:2px solid #25D366;border-radius:8px;padding:26px 24px;margin:0 0 28px;text-align:center;">
      <p style="margin:0 0 6px;font-size:18px;color:#083121;font-weight:bold;">📲 Tham gia nhóm WhatsApp của Workshop</p>
      <p style="margin:0 0 20px;color:#4a5c52;line-height:1.6;font-size:14px;">
        Đây là nơi Bonu gửi <strong>link buổi học, tài liệu và thông báo quan trọng</strong>.
        Bạn nhớ vào nhóm sớm để không bỏ lỡ thông tin nào nhé!
      </p>
      <img src="${SITE_URL}/whatsapp-qr.png"
           alt="Quét mã QR để vào nhóm WhatsApp"
           width="200" height="200"
           style="display:block;margin:0 auto 18px;border:8px solid #fff;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,0.08);" />
      <p style="margin:0 0 18px;color:#4a5c52;font-size:13px;">Quét mã QR bằng camera điện thoại — hoặc bấm nút bên dưới:</p>
      <a href="${WHATSAPP_GROUP_URL}"
         style="display:inline-block;background:#25D366;color:#fff;padding:14px 32px;text-decoration:none;border-radius:6px;font-weight:bold;font-size:15px;">
        Vào nhóm WhatsApp ngay
      </a>
    </div>
    <!-- ===== /WHATSAPP INVITE BLOCK ===== -->

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
        location: data.location,
        phone: data.phone,
        fbExperience: data.stage,
        goals: data.singleProblem,
        barriers: data.painPoints || [],
        specificQuestions: data.questionForBo,
        referralSource: data.referral,
        otherNotes: [
          `Mô hình kinh doanh: ${data.model.join(', ')}`,
          `Thời gian vận hành/ngày: ${data.timeSpent}`,
          data.thoughtAboutIt ? `Nuôi quán hay quán nuôi mình: ${data.thoughtAboutIt}` : null,
          `Nguyên nhân F&B thất bại (theo họ): ${data.failureReason}`,
          `Mong muốn sau Workshop: ${data.wantAfterWorkshop}`,
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
