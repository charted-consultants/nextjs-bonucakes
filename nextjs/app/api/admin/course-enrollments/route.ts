import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

async function checkAdminAuth() {
  const session = await getServerSession(authOptions)
  if (!session || !session.user) return { authorized: false, error: "Not authenticated" }
  if (session.user.role !== "admin") return { authorized: false, error: "Not authorized" }
  return { authorized: true }
}

// GET: danh sách lead đăng ký khoá học (bảng riêng course_enrollments).
// ?slug=... để lọc theo 1 khoá. Mặc định bỏ bản ghi đã xoá mềm.
export async function GET(request: NextRequest) {
  const auth = await checkAdminAuth()
  if (!auth.authorized) return NextResponse.json({ error: auth.error }, { status: 401 })

  try {
    const slug = request.nextUrl.searchParams.get("slug")
    const enrollments = await prisma.courseEnrollment.findMany({
      where: { deletedAt: null, ...(slug ? { courseSlug: slug } : {}) },
      orderBy: { registrationDate: "desc" },
      include: {
        customer: {
          select: { id: true, name: true, email: true, phone: true, tags: true, marketingConsent: true },
        },
      },
    })
    return NextResponse.json({ enrollments })
  } catch (error) {
    console.error("Error fetching course enrollments:", error)
    return NextResponse.json({ error: "Failed to fetch enrollments" }, { status: 500 })
  }
}
