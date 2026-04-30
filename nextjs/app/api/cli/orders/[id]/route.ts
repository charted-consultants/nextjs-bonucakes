import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkCliAuth, unauthorizedCliResponse } from '@/lib/cli-auth';

export const dynamic = 'force-dynamic';

/**
 * GET /api/cli/orders/[id]
 * Get full order details including address, items, notes
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!checkCliAuth(request)) return unauthorizedCliResponse();

  const order = await prisma.order.findFirst({
    where: {
      OR: [
        { id: params.id },
        { orderNumber: params.id },
      ],
    },
    include: {
      items: {
        select: {
          productName: true,
          quantity: true,
          price: true,
          productSku: true,
        },
      },
      orderHistory: {
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          status: true,
          note: true,
          createdAt: true,
        },
      },
    },
  });

  if (!order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }

  return NextResponse.json({ order });
}
