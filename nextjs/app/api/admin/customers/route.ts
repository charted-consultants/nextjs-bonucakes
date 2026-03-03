import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get all customers from the Customer table
    const customers = await prisma.customer.findMany({
      orderBy: {
        totalSpent: 'desc'
      }
    })

    const formattedCustomers = customers.map((customer) => ({
      id: customer.id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      marketingConsent: customer.marketingConsent,
      consentedAt: customer.consentedAt?.toISOString() || null,
      consentSource: customer.consentSource,
      tags: customer.tags,
      segment: customer.segment,
      notes: customer.notes,
      orderCount: customer.totalOrders,
      totalSpent: parseFloat(customer.totalSpent.toString()),
      lastOrderDate: customer.lastOrderDate?.toISOString() || null,
      createdAt: customer.createdAt.toISOString(),
    }))

    return NextResponse.json({ customers: formattedCustomers })
  } catch (error) {
    console.error("Error fetching customers:", error)
    return NextResponse.json(
      { error: "Failed to fetch customers" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { name, email, phone, marketingConsent, consentSource, tags, segment, notes } = body

    if (!name || !email) {
      return NextResponse.json(
        { error: "Name and email are required" },
        { status: 400 }
      )
    }

    // Check if customer with this email already exists
    const existingCustomer = await prisma.customer.findUnique({
      where: { email }
    })

    if (existingCustomer) {
      return NextResponse.json(
        { error: "Customer with this email already exists" },
        { status: 400 }
      )
    }

    const customer = await prisma.customer.create({
      data: {
        name,
        email,
        phone: phone || null,
        marketingConsent: marketingConsent || false,
        consentedAt: marketingConsent ? new Date() : null,
        consentSource: consentSource || "admin",
        tags: tags || [],
        segment: segment || null,
        notes: notes || null,
      }
    })

    return NextResponse.json({ customer }, { status: 201 })
  } catch (error) {
    console.error("Error creating customer:", error)
    return NextResponse.json(
      { error: "Failed to create customer" },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { id, name, email, phone, marketingConsent, tags, segment, notes } = body

    if (!id) {
      return NextResponse.json(
        { error: "Customer ID is required" },
        { status: 400 }
      )
    }

    // Check if customer exists
    const existingCustomer = await prisma.customer.findUnique({
      where: { id }
    })

    if (!existingCustomer) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 }
      )
    }

    // If email is being changed, check it's not taken by another customer
    if (email && email !== existingCustomer.email) {
      const emailTaken = await prisma.customer.findUnique({
        where: { email }
      })
      if (emailTaken) {
        return NextResponse.json(
          { error: "Email already in use by another customer" },
          { status: 400 }
        )
      }
    }

    const updateData: any = {}
    if (name !== undefined) updateData.name = name
    if (email !== undefined) updateData.email = email
    if (phone !== undefined) updateData.phone = phone
    if (tags !== undefined) updateData.tags = tags
    if (segment !== undefined) updateData.segment = segment
    if (notes !== undefined) updateData.notes = notes

    // Handle marketing consent changes
    if (marketingConsent !== undefined && marketingConsent !== existingCustomer.marketingConsent) {
      updateData.marketingConsent = marketingConsent
      if (marketingConsent && !existingCustomer.consentedAt) {
        updateData.consentedAt = new Date()
        updateData.consentSource = "admin"
      }
    }

    const customer = await prisma.customer.update({
      where: { id },
      data: updateData
    })

    return NextResponse.json({ customer })
  } catch (error) {
    console.error("Error updating customer:", error)
    return NextResponse.json(
      { error: "Failed to update customer" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json(
        { error: "Customer ID is required" },
        { status: 400 }
      )
    }

    await prisma.customer.delete({
      where: { id: parseInt(id) }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting customer:", error)
    return NextResponse.json(
      { error: "Failed to delete customer" },
      { status: 500 }
    )
  }
}
