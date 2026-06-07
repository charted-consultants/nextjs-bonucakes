import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import {
  courseEnrollmentAdminEmail,
  courseEnrollmentGuestEmail,
} from '@/lib/email-templates/course-enrollment';

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'Bonu Cakes <noreply@chartedconsultants.com>';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'info@bonucakes.com';

const schema = z.object({
  name: z.string().min(2, 'Vui lòng nhập họ tên.'),
  email: z.string().email('Email không hợp lệ.'),
  phone: z.string().optional(),
  location: z.string().optional(),
  format: z.string().optional(),
  goal: z.string().optional(),
});

// POST /api/courses/[slug]/enroll
// Ghi lead vào bảng RIÊNG `course_enrollments` (không đụng workshop_registrations),
// upsert customer, gửi email admin + khách. Email lỗi không làm hỏng việc lưu DB.
export async function POST(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;

    // Khoá học phải tồn tại & đang publish thì mới nhận đăng ký.
    const course = await prisma.course.findFirst({
      where: { slug, deletedAt: null, published: true },
      select: { titleVi: true, enrollmentOpen: true },
    });
    if (!course) {
      return NextResponse.json({ error: 'Không tìm thấy khoá học.' }, { status: 404 });
    }
    if (!course.enrollmentOpen) {
      return NextResponse.json({ error: 'Khoá học hiện tạm ngừng nhận đăng ký.' }, { status: 409 });
    }

    const body = await req.json();
    const result = schema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0]?.message || 'Thông tin không hợp lệ.' },
        { status: 400 }
      );
    }

    const data = result.data;
    const courseName = course.titleVi;
    const now = new Date();
    const dateStr = now.toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });

    // Upsert customer (theo email). Cùng quy ước consent như các form khác.
    let customer = await prisma.customer.findUnique({ where: { email: data.email } });
    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          name: data.name,
          email: data.email,
          phone: data.phone || null,
          marketingConsent: true,
          consentedAt: now,
          consentSource: 'course_enrollment',
          tags: ['course_enrollment', slug],
        },
      });
    }

    // Lưu lead vào bảng riêng course_enrollments.
    await prisma.courseEnrollment.create({
      data: {
        courseSlug: slug,
        courseName,
        customerId: customer.id,
        name: data.name,
        email: data.email,
        phone: data.phone || null,
        location: data.location || null,
        format: data.format || null,
        goal: data.goal || null,
        registrationDate: now,
      },
    });

    // Gửi email — bọc try/catch để email lỗi không kéo request thành 500.
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      await Promise.all([
        resend.emails.send({
          from: FROM_EMAIL,
          to: ADMIN_EMAIL,
          replyTo: data.email,
          subject: `[Khoá học] ${data.name} — ${courseName}`,
          html: courseEnrollmentAdminEmail(courseName, data, dateStr),
        }),
        resend.emails.send({
          from: FROM_EMAIL,
          to: data.email,
          subject: `Bonu đã nhận đăng ký ${courseName} của bạn 🌿`,
          html: courseEnrollmentGuestEmail(data.name, courseName),
        }),
      ]);
    } catch (mailErr) {
      console.error('[course enroll] email send failed (DB row was saved):', mailErr);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[course enroll] error:', err);
    return NextResponse.json({ error: 'Có lỗi xảy ra, vui lòng thử lại.' }, { status: 500 });
  }
}
