import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkCliAuth, unauthorizedCliResponse } from '@/lib/cli-auth';

export const dynamic = 'force-dynamic';

/**
 * GET /api/cli/orders
 * List orders with optional filters
 * Query params: status, from (date), to (date), limit (default 20)
 */
export async function GET(request: NextRequest) {
  if (!checkCliAuth(request)) return unauthorizedCliResponse();

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const from = searchParams.get('from');
  const to = searchParams.get('to');
  const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);

  const where: any = {};
  if (status) where.status = status;
  if (from || to) {
    where.createdAt = {};
    if (from) where.createdAt.gte = new Date(from);
    if (to) where.createdAt.lte = new Date(to);
  }

  const orders = await prisma.order.findMany({
    where,
    take: limit,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      orderNumber: true,
      status: true,
      totalAmount: true,
      currency: true,
      createdAt: true,
      customer: { select: { firstName: true, lastName: true, email: true } },
      orderItems: {
        select: {
          quantity: true,
          unitPrice: true,
          product: { select: { nameEn: true, nameVi: true } },
        },
      },
    },
  });

  return NextResponse.json({ orders, count: orders.length });
}
