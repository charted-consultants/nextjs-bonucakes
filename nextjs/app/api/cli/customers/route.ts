import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkCliAuth, unauthorizedCliResponse } from '@/lib/cli-auth';

export const dynamic = 'force-dynamic';

/**
 * GET /api/cli/customers
 * List customers, optionally search by name or email
 */
export async function GET(request: NextRequest) {
  if (!checkCliAuth(request)) return unauthorizedCliResponse();

  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search');
  const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);

  const where: any = { deletedAt: null };
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
      { phone: { contains: search } },
    ];
  }

  const customers = await prisma.customer.findMany({
    where,
    take: limit,
    orderBy: { totalSpent: 'desc' },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      totalOrders: true,
      totalSpent: true,
      lastOrderDate: true,
      tags: true,
      segment: true,
      notes: true,
    },
  });

  return NextResponse.json({ customers, count: customers.length });
}
