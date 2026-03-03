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

    // Get all unique customers from orders
    const customers = await prisma.order.groupBy({
      by: ['customerName', 'customerEmail', 'customerPhone'],
      _count: {
        id: true,
      },
      _sum: {
        total: true,
      },
      _max: {
        createdAt: true,
      },
      _min: {
        createdAt: true,
      },
    })

    const formattedCustomers = customers.map((customer, index) => ({
      id: index + 1,
      name: customer.customerName,
      email: customer.customerEmail,
      phone: customer.customerPhone,
      orderCount: customer._count.id,
      totalSpent: parseFloat(customer._sum.total?.toString() || "0"),
      lastOrderDate: customer._max.createdAt?.toISOString() || null,
      createdAt: customer._min.createdAt?.toISOString() || new Date().toISOString(),
    }))

    // Sort by total spent descending
    formattedCustomers.sort((a, b) => b.totalSpent - a.totalSpent)

    return NextResponse.json({ customers: formattedCustomers })
  } catch (error) {
    console.error("Error fetching customers:", error)
    return NextResponse.json(
      { error: "Failed to fetch customers" },
      { status: 500 }
    )
  }
}
