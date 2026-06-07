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

const VALID_STATUS = ["new", "contacted", "enrolled", "declined"]

// PATCH: cập nhật trạng thái liên hệ / ghi chú admin cho 1 lead.
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const auth = await checkAdminAuth()
  if (!auth.authorized) return NextResponse.json({ error: auth.error }, { status: 401 })

  try {
    const id = parseInt(params.id, 10)
    if (Number.isNaN(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 })

    const body = await request.json()
    const data: { status?: string; notes?: string | null } = {}
    if (typeof body.status === "string") {
      if (!VALID_STATUS.includes(body.status)) {
        return NextResponse.json({ error: "Invalid status" }, { status: 400 })
      }
      data.status = body.status
    }
    if (body.notes !== undefined) data.notes = body.notes || null

    const updated = await prisma.courseEnrollment.update({ where: { id }, data })
    return NextResponse.json({ enrollment: updated })
  } catch (error) {
    console.error("Error updating course enrollment:", error)
    return NextResponse.json({ error: "Failed to update" }, { status: 500 })
  }
}

// DELETE: xoá mềm 1 lead (giữ trong DB, set deletedAt).
export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  const auth = await checkAdminAuth()
  if (!auth.authorized) return NextResponse.json({ error: auth.error }, { status: 401 })

  try {
    const id = parseInt(params.id, 10)
    if (Number.isNaN(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 })

    await prisma.courseEnrollment.update({ where: { id }, data: { deletedAt: new Date() } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting course enrollment:", error)
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 })
  }
}
