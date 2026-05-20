import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  errorResponse,
  handleApiError,
  sanitizeProductForPublic,
  parsePaginationParams,
  paginatedResponse,
  withCacheHeaders
} from '@/lib/api-helpers';
import { HARDCODED_PRODUCTS } from '@/lib/hardcoded-products';

export const dynamic = 'force-dynamic';

/**
 * GET /api/products
 * Public endpoint to fetch available products
 * Query params:
 * - category: filter by category (e.g., 'food', 'beverage')
 * - featured: 'true' to get only featured products
 * - page: page number (default: 1)
 * - limit: items per page (default: 10, max: 100)
 * - search: search in product names
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const featured = searchParams.get('featured');
  const search = searchParams.get('search');
  const usePagination = searchParams.has('page') || searchParams.has('limit');
  const hardcodedSlugs = new Set(HARDCODED_PRODUCTS.map((p) => p.slug));

  // Query DB — if it fails, fall back to empty array so hardcoded always show
  let dbProducts: any[] = [];
  try {
    const where: any = {
      OR: [
        { available: true },
        { available: false, featured: true },
      ],
    };

    if (category) where.category = category;
    if (featured === 'true') where.featured = true;
    if (search) {
      where.OR = [
        { nameVi: { contains: search, mode: 'insensitive' } },
        { nameEn: { contains: search, mode: 'insensitive' } },
        { descriptionVi: { contains: search, mode: 'insensitive' } },
        { descriptionEn: { contains: search, mode: 'insensitive' } },
      ];
    }

    const products = await prisma.product.findMany({
      where,
      orderBy: [{ featured: 'desc' }, { createdAt: 'desc' }],
      include: {
        productVariants: {
          where: { available: true },
          select: { id: true, nameVi: true, nameEn: true, price: true, stock: true, options: true }
        },
        nutritionInfo: true,
      }
    });

    dbProducts = products
      .map(sanitizeProductForPublic)
      .filter((p: any) => !hardcodedSlugs.has(p.slug));
  } catch (err) {
    console.error('[products] DB query failed, serving hardcoded only:', err);
  }

  // Hardcoded products always appear first, regardless of DB state
  const allProducts = [...HARDCODED_PRODUCTS, ...dbProducts];

  if (usePagination) {
    const { page, limit, skip } = parsePaginationParams(searchParams);
    const paginated = allProducts.slice(skip, skip + limit);
    return paginatedResponse(paginated, allProducts.length, page, limit);
  }

  return withCacheHeaders(
    NextResponse.json({ products: allProducts }),
    60
  );
}
