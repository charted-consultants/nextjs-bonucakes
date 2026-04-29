import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkCliAuth, unauthorizedCliResponse } from '@/lib/cli-auth';

export const dynamic = 'force-dynamic';

/**
 * GET /api/cli/products
 * List all products with stock and availability
 * Query params: available (true/false), search
 */
export async function GET(request: NextRequest) {
  if (!checkCliAuth(request)) return unauthorizedCliResponse();

  const { searchParams } = new URL(request.url);
  const available = searchParams.get('available');
  const search = searchParams.get('search');

  const where: any = {};
  if (available !== null) where.available = available === 'true';
  if (search) {
    where.OR = [
      { nameVi: { contains: search, mode: 'insensitive' } },
      { nameEn: { contains: search, mode: 'insensitive' } },
    ];
  }

  const products = await prisma.product.findMany({
    where,
    select: {
      id: true,
      nameVi: true,
      nameEn: true,
      slug: true,
      price: true,
      compareAtPrice: true,
      category: true,
      available: true,
      featured: true,
      stock: true,
      stockStatus: true,
    },
    orderBy: [{ featured: 'desc' }, { createdAt: 'desc' }],
  });

  return NextResponse.json({ products });
}
