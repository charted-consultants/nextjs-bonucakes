/**
 * Public Blog Posts API
 * GET: List published blog posts with pagination
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const category = searchParams.get('category') || '';
    const featured = searchParams.get('featured') === 'true';

    const skip = (page - 1) * limit;

    // Build where clause - only show published, non-deleted posts
    const where: any = {
      published: true,
      deletedAt: null,
    };

    if (category) {
      where.category = category;
    }

    if (featured) {
      where.featured = true;
    }

    // Get posts and total count
    const [posts, totalCount] = await Promise.all([
      prisma.blogPost.findMany({
        where,
        skip,
        take: limit,
        orderBy: [
          { featured: 'desc' },
          { publishedAt: 'desc' },
          { createdAt: 'desc' },
        ],
        select: {
          id: true,
          titleVi: true,
          titleEn: true,
          excerptVi: true,
          excerptEn: true,
          slug: true,
          image: true,
          category: true,
          tags: true,
          author: true,
          authorImage: true,
          authorRole: true,
          featured: true,
          publishedAt: true,
          readingTime: true,
          views: true,
          createdAt: true,
        },
      }),
      prisma.blogPost.count({ where }),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      posts,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasMore: page < totalPages,
      },
    });
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch blog posts' },
      { status: 500 }
    );
  }
}
