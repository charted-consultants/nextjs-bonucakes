import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  errorResponse,
  handleApiError,
  notFoundResponse,
  sanitizeProductForPublic,
  withCacheHeaders
} from '@/lib/api-helpers';

export const dynamic = 'force-dynamic';

/**
 * GET /api/products/[slug]
 * Get single product by slug (public endpoint)
 * Includes product variants, nutrition info, and approved reviews
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;

    if (!slug) {
      return errorResponse('Product slug is required', 400);
    }

    const product = await prisma.product.findUnique({
      where: {
        slug,
        available: true,
      },
      include: {
        productVariants: {
          where: { available: true },
          orderBy: { price: 'asc' },
          select: {
            id: true,
            nameVi: true,
            nameEn: true,
            sku: true,
            price: true,
            stock: true,
            available: true,
            options: true,
          }
        },
        nutritionInfo: true,
        productFaqs: {
          where: { active: true },
          orderBy: { displayOrder: 'asc' },
          select: {
            id: true,
            questionVi: true,
            questionEn: true,
            answerVi: true,
            answerEn: true,
          }
        },
        reviews: {
          where: { approved: true },
          orderBy: { createdAt: 'desc' },
          take: 10, // Get latest 10 reviews
          select: {
            id: true,
            name: true,
            rating: true,
            title: true,
            comment: true,
            images: true,
            verified: true,
            helpful: true,
            createdAt: true,
          }
        }
      },
    });

    if (!product) {
      return notFoundResponse('Product');
    }

    // Calculate review statistics
    const reviewStats = await prisma.review.aggregate({
      where: {
        productId: product.id,
        approved: true,
      },
      _avg: {
        rating: true,
      },
      _count: {
        rating: true,
      }
    });

    // Get complementary products if specified
    let complementaryProducts: any[] = [];
    if (product.complementaryProducts && product.complementaryProducts.length > 0) {
      complementaryProducts = await prisma.product.findMany({
        where: {
          id: { in: product.complementaryProducts },
          available: true,
        },
        select: {
          id: true,
          nameVi: true,
          nameEn: true,
          slug: true,
          price: true,
          imageSrc: true,
          imageAlt: true,
          shortDescriptionVi: true,
          shortDescriptionEn: true,
        },
        take: 4,
      });
    }

    // Sanitize product for public API
    const sanitizedProduct = sanitizeProductForPublic(product);

    const response = NextResponse.json({
      product: {
        ...sanitizedProduct,
        reviewStats: {
          averageRating: reviewStats._avg.rating || 0,
          totalReviews: reviewStats._count.rating || 0,
        },
        complementaryProducts,
      }
    });

    // Cache for 30 seconds
    return withCacheHeaders(response, 30);
  } catch (error) {
    return handleApiError(error, 'fetch product');
  }
}
