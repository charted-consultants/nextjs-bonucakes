import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/courses/[slug]
// Trả về các field "động" (giá, lịch, sĩ số, trạng thái nhận đăng ký) cho
// landing public đọc — Bo chỉnh trong /admin/courses là website tự cập nhật.
export async function GET(
  _req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    const course = await prisma.course.findFirst({
      where: { slug, deletedAt: null, published: true },
      select: {
        slug: true,
        titleVi: true,
        titleEn: true,
        price: true,
        compareAtPrice: true,
        duration: true,
        durationUnit: true,
        location: true,
        instructor: true,
        startDate: true,
        endDate: true,
        maxStudents: true,
        currentEnrollment: true,
        enrollmentOpen: true,
        onlineAvailable: true,
      },
    });

    if (!course) {
      return NextResponse.json({ error: 'Không tìm thấy khoá học.' }, { status: 404 });
    }

    return NextResponse.json({
      course: {
        ...course,
        price: Number(course.price),
        compareAtPrice: course.compareAtPrice != null ? Number(course.compareAtPrice) : null,
      },
    });
  } catch (err) {
    console.error('[GET /api/courses/[slug]] error:', err);
    return NextResponse.json({ error: 'Có lỗi xảy ra.' }, { status: 500 });
  }
}
