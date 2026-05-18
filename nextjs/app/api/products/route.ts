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
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const featured = searchParams.get('featured');
    const search = searchParams.get('search');
    const usePagination = searchParams.has('page') || searchParams.has('limit');

    // Build where clause — show available products + coming-soon (featured but unavailable)
    const where: any = {
      OR: [
        { available: true },
        { available: false, featured: true },
      ],
    };

    if (category) {
      where.category = category;
    }

    if (featured === 'true') {
      where.featured = true;
    }

    if (search) {
      where.OR = [
        { nameVi: { contains: search, mode: 'insensitive' } },
        { nameEn: { contains: search, mode: 'insensitive' } },
        { descriptionVi: { contains: search, mode: 'insensitive' } },
        { descriptionEn: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Handle pagination if requested
    if (usePagination) {
      const { page, limit, skip } = parsePaginationParams(searchParams);

      const [products, total] = await Promise.all([
        prisma.product.findMany({
          where,
          skip,
          take: limit,
          orderBy: [
            { featured: 'desc' },
            { createdAt: 'desc' }
          ],
          include: {
            productVariants: {
              where: { available: true },
              select: {
                id: true,
                nameVi: true,
                nameEn: true,
                price: true,
                stock: true,
                options: true,
              }
            },
            nutritionInfo: true,
          }
        }),
        prisma.product.count({ where })
      ]);

      // Sanitize products for public API
      const sanitizedProducts = products.map(sanitizeProductForPublic);

      return paginatedResponse(sanitizedProducts, total, page, limit);
    }

    // Return all products without pagination
    const products = await prisma.product.findMany({
      where,
      orderBy: [
        { featured: 'desc' },
        { createdAt: 'desc' }
      ],
      include: {
        productVariants: {
          where: { available: true },
          select: {
            id: true,
            nameVi: true,
            nameEn: true,
            price: true,
            stock: true,
            options: true,
          }
        },
        nutritionInfo: true,
      }
    });

    // Sanitize products for public API
    const sanitizedProducts = products.map(sanitizeProductForPublic);

    const response = NextResponse.json({ products: sanitizedProducts });

    // Add cache headers for better performance
    return withCacheHeaders(response, 60); // Cache for 60 seconds
  } catch (error) {
    return handleApiError(error, 'fetch products');
  }
}
