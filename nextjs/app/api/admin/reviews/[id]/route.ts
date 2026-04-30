import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

async function checkAdminAuth() {
  const session = await getServerSession(authOptions)

  if (!session || !session.user) {
    return { authorized: false, error: "Not authenticated" }
  }

  if (session.user.role !== "admin") {
    return { authorized: false, error: "Not authorized" }
  }

  return { authorized: true }
}

// PATCH: Update review approval status
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authCheck = await checkAdminAuth()
  if (!authCheck.authorized) {
    return NextResponse.json({ error: authCheck.error }, { status: 401 })
  }

  try {
    const id = parseInt(params.id)
    const body = await request.json()

    const review = await prisma.review.update({
      where: { id },
      data: {
        approved: body.approved,
      },
    })

    return NextResponse.json({ review })
  } catch (error: any) {
    console.error("Error updating review:", error)
    return NextResponse.json(
      { error: error.message || "Failed to update review" },
      { status: 500 }
    )
  }
}

// DELETE: Delete review
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authCheck = await checkAdminAuth()
  if (!authCheck.authorized) {
    return NextResponse.json({ error: authCheck.error }, { status: 401 })
  }

  try {
    const id = parseInt(params.id)

    await prisma.review.update({
      where: { id },
      data: { deletedAt: new Date() },
    })

    return NextResponse.json({ message: "Review deleted successfully" })
  } catch (error: any) {
    console.error("Error deleting review:", error)
    return NextResponse.json(
      { error: error.message || "Failed to delete review" },
      { status: 500 }
    )
  }
}
