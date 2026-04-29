import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkCliAuth, unauthorizedCliResponse } from '@/lib/cli-auth';

export const dynamic = 'force-dynamic';

/**
 * GET /api/cli/orders/summary
 * Returns order counts and revenue grouped by period
 * Query params: period (today|week|month|all, default: all)
 */
export async function GET(request: NextRequest) {
  if (!checkCliAuth(request)) return unauthorizedCliResponse();

  const { searchParams } = new URL(request.url);
  const period = searchParams.get('period') || 'all';

  const now = new Date();
  let from: Date | undefined;
  if (period === 'today') {
    from = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  } else if (period === 'week') {
    from = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  } else if (period === 'month') {
    from = new Date(now.getFullYear(), now.getMonth(), 1);
  }

  const where: any = {};
  if (from) where.createdAt = { gte: from };

  const [total, byStatus, revenue] = await Promise.all([
    prisma.order.count({ where }),
    prisma.order.groupBy({
      by: ['status'],
      where,
      _count: { id: true },
    }),
    prisma.order.aggregate({
      where,
      _sum: { totalAmount: true },
    }),
  ]);

  return NextResponse.json({
    period,
    totalOrders: total,
    totalRevenue: revenue._sum.totalAmount ?? 0,
    byStatus: Object.fromEntries(byStatus.map((s) => [s.status, s._count.id])),
  });
}
