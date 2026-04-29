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

// GET: Get single event
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authCheck = await checkAdminAuth()
  if (!authCheck.authorized) {
    return NextResponse.json({ error: authCheck.error }, { status: 401 })
  }

  try {
    const id = parseInt(params.id)
    const event = await prisma.event.findUnique({
      where: { id },
    })

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    return NextResponse.json({ event })
  } catch (error) {
    console.error("Error fetching event:", error)
    return NextResponse.json({ error: "Failed to fetch event" }, { status: 500 })
  }
}

// PUT: Update event
export async function PUT(
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

    const event = await prisma.event.update({
      where: { id },
      data: {
        titleVi: body.titleVi,
        titleEn: body.titleEn,
        descriptionVi: body.descriptionVi,
        descriptionEn: body.descriptionEn,
        slug: body.slug,
        image: body.image || null,
        eventDate: new Date(body.eventDate),
        eventTime: body.eventTime || null,
        locationVi: body.locationVi || null,
        locationEn: body.locationEn || null,
        addressVi: body.addressVi || null,
        addressEn: body.addressEn || null,
        maxAttendees: body.maxAttendees ? parseInt(body.maxAttendees) : null,
        currentAttendees: body.currentAttendees
          ? parseInt(body.currentAttendees)
          : 0,
        price: body.price ? parseFloat(body.price) : null,
        category: body.category || null,
        featured: body.featured || false,
        published: body.published || false,
        registrationUrl: body.registrationUrl || null,
      },
    })

    return NextResponse.json({ event })
  } catch (error: any) {
    console.error("Error updating event:", error)
    return NextResponse.json(
      { error: error.message || "Failed to update event" },
      { status: 500 }
    )
  }
}

// DELETE: Delete event
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

    await prisma.event.update({
      where: { id },
      data: { deletedAt: new Date() },
    })

    return NextResponse.json({ message: "Event deleted successfully" })
  } catch (error: any) {
    console.error("Error deleting event:", error)
    return NextResponse.json(
      { error: error.message || "Failed to delete event" },
      { status: 500 }
    )
  }
}
