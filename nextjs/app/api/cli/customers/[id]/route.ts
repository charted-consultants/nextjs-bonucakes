import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkCliAuth, unauthorizedCliResponse } from '@/lib/cli-auth';

export const dynamic = 'force-dynamic';

/**
 * GET /api/cli/customers/[id]
 * Get a single customer with their recent orders
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!checkCliAuth(request)) return unauthorizedCliResponse();

  const id = parseInt(params.id);
  if (isNaN(id)) {
    return NextResponse.json({ error: 'Invalid customer ID' }, { status: 400 });
  }

  const customer = await prisma.customer.findUnique({
    where: { id },
  });

  if (!customer || customer.deletedAt) {
    return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
  }

  // Get their recent orders (orders store customer info inline, match by email)
  const recentOrders = await prisma.order.findMany({
    where: {
      customerEmail: customer.email,
      deletedAt: null,
    },
    take: 10,
    orderBy: { createdAt: 'desc' },
    select: {
      orderNumber: true,
      status: true,
      total: true,
      createdAt: true,
      shippingAddress: true,
      items: {
        select: { productName: true, quantity: true, price: true },
      },
    },
  });

  return NextResponse.json({ customer, recentOrders });
}
