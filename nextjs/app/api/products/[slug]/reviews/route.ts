import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  errorResponse,
  handleApiError,
  notFoundResponse,
  badRequestResponse,
  validateRequiredFields,
  successResponse
} from '@/lib/api-helpers';

/**
 * GET /api/products/[slug]/reviews
 * Get approved reviews for a product
 * Query params:
 * - page: page number (default: 1)
 * - limit: items per page (default: 10)
 * - rating: filter by rating (1-5)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    const { searchParams } = new URL(request.url);

    // Find product by slug
    const product = await prisma.product.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!product) {
      return notFoundResponse('Product');
    }

    // Parse query parameters
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = Math.min(parseInt(searchParams.get('limit') || '10', 10), 100);
    const ratingFilter = searchParams.get('rating');
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      productId: product.id,
      approved: true,
    };

    if (ratingFilter) {
      const rating = parseInt(ratingFilter, 10);
      if (rating >= 1 && rating <= 5) {
        where.rating = rating;
      }
    }

    // Get reviews with pagination
    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
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
        },
      }),
      prisma.review.count({ where })
    ]);

    // Get rating distribution
    const ratingDistribution = await prisma.review.groupBy({
      by: ['rating'],
      where: {
        productId: product.id,
        approved: true,
      },
      _count: {
        rating: true,
      },
    });

    // Get average rating
    const avgRating = await prisma.review.aggregate({
      where: {
        productId: product.id,
        approved: true,
      },
      _avg: {
        rating: true,
      },
    });

    return NextResponse.json({
      reviews,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: page * limit < total,
      },
      stats: {
        averageRating: avgRating._avg.rating || 0,
        totalReviews: total,
        ratingDistribution: ratingDistribution.reduce((acc: Record<number, number>, curr: any) => {
          acc[curr.rating] = curr._count.rating;
          return acc;
        }, {} as Record<number, number>),
      },
    });
  } catch (error) {
    return handleApiError(error, 'fetch reviews');
  }
}

/**
 * POST /api/products/[slug]/reviews
 * Submit a new review for a product
 * Body:
 * - name: reviewer name (required)
 * - email: reviewer email (required)
 * - rating: 1-5 (required)
 * - title: review title (optional)
 * - comment: review comment (required)
 * - images: array of image URLs (optional)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    const body = await request.json();

    // Validate required fields
    const validation = validateRequiredFields(body, ['name', 'email', 'rating', 'comment']);
    if (!validation.valid) {
      return badRequestResponse(`Missing required fields: ${validation.missing?.join(', ')}`);
    }

    const { name, email, rating, title, comment, images } = body;

    // Validate rating
    if (rating < 1 || rating > 5) {
      return badRequestResponse('Rating must be between 1 and 5');
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return badRequestResponse('Invalid email format');
    }

    // Find product by slug
    const product = await prisma.product.findUnique({
      where: { slug },
      select: { id: true, nameVi: true, nameEn: true },
    });

    if (!product) {
      return notFoundResponse('Product');
    }

    // Check if user has already reviewed this product with same email
    const existingReview = await prisma.review.findFirst({
      where: {
        productId: product.id,
        email: email.toLowerCase(),
      },
    });

    if (existingReview) {
      return errorResponse('You have already submitted a review for this product', 400);
    }

    // Create review (requires admin approval)
    const review = await prisma.review.create({
      data: {
        productId: product.id,
        name: name.trim(),
        email: email.toLowerCase().trim(),
        rating,
        title: title?.trim() || null,
        comment: comment.trim(),
        images: images || [],
        approved: false, // Requires admin approval
        verified: false,
        helpful: 0,
      },
    });

    return successResponse(
      {
        id: review.id,
        name: review.name,
        rating: review.rating,
        title: review.title,
        comment: review.comment,
        createdAt: review.createdAt,
      },
      201,
      'Review submitted successfully. It will appear after admin approval.'
    );
  } catch (error) {
    return handleApiError(error, 'submit review');
  }
}
