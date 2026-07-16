/**
 * Admin Blog Posts API
 * GET: List all posts (with pagination)
 * POST: Create a new blog post
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Validation schema for creating/updating blog posts
const blogPostSchema = z.object({
  titleVi: z.string().min(1, 'Vietnamese title is required'),
  titleEn: z.string().min(1, 'English title is required'),
  excerptVi: z.string().optional(),
  excerptEn: z.string().optional(),
  contentVi: z.string().min(1, 'Vietnamese content is required'),
  contentEn: z.string().min(1, 'English content is required'),
  slug: z.string().min(1, 'Slug is required').regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Invalid slug format'),
  image: z.string().optional(),
  images: z.array(z.string()).optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  author: z.string().optional(),
  authorImage: z.string().optional(),
  authorRole: z.string().optional(),
  featured: z.boolean().optional(),
  published: z.boolean().optional(),
  publishedAt: z.string().optional(),
  readingTime: z.number().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
});

// Check if user is authenticated and is admin
async function checkAdminAuth() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return { authorized: false, error: 'Not authenticated' };
  }

  if (session.user.role !== 'admin') {
    return { authorized: false, error: 'Not authorized' };
  }

  return { authorized: true };
}

// GET: List all blog posts with pagination
export async function GET(request: NextRequest) {
  const authCheck = await checkAdminAuth();
  if (!authCheck.authorized) {
    return NextResponse.json({ error: authCheck.error }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || 'all'; // all, published, draft
    const category = searchParams.get('category') || '';

    const skip = (page - 1) * limit;

    // Build where clause - exclude soft-deleted posts from the admin list
    const where: any = { deletedAt: null };

    if (status === 'published') {
      where.published = true;
    } else if (status === 'draft') {
      where.published = false;
    }

    if (category) {
      where.category = category;
    }

    if (search) {
      where.OR = [
        { titleVi: { contains: search, mode: 'insensitive' } },
        { titleEn: { contains: search, mode: 'insensitive' } },
        { excerptVi: { contains: search, mode: 'insensitive' } },
        { excerptEn: { contains: search, mode: 'insensitive' } },
      ];
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

// POST: Create a new blog post
export async function POST(request: NextRequest) {
  const authCheck = await checkAdminAuth();
  if (!authCheck.authorized) {
    return NextResponse.json({ error: authCheck.error }, { status: 401 });
  }

  try {
    const body = await request.json();

    // Validate input
    const validatedData = blogPostSchema.parse(body);

    // Check if slug already exists
    const existingPost = await prisma.blogPost.findUnique({
      where: { slug: validatedData.slug },
    });

    if (existingPost) {
      return NextResponse.json(
        { error: 'A post with this slug already exists' },
        { status: 400 }
      );
    }

    // Set publishedAt if publishing for the first time
    const publishedAt = validatedData.published && !validatedData.publishedAt
      ? new Date().toISOString()
      : validatedData.publishedAt;

    // Create the blog post
    const post = await prisma.blogPost.create({
      data: {
        titleVi: validatedData.titleVi,
        titleEn: validatedData.titleEn,
        excerptVi: validatedData.excerptVi,
        excerptEn: validatedData.excerptEn,
        contentVi: validatedData.contentVi,
        contentEn: validatedData.contentEn,
        slug: validatedData.slug,
        image: validatedData.image,
        images: validatedData.images || [],
        category: validatedData.category,
        tags: validatedData.tags || [],
        author: validatedData.author,
        authorImage: validatedData.authorImage,
        authorRole: validatedData.authorRole,
        featured: validatedData.featured || false,
        published: validatedData.published || false,
        publishedAt: publishedAt ? new Date(publishedAt) : null,
        readingTime: validatedData.readingTime,
        metaTitle: validatedData.metaTitle,
        metaDescription: validatedData.metaDescription,
      },
    });

    return NextResponse.json(
      { message: 'Blog post created successfully', post },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error creating blog post:', error);
    return NextResponse.json(
      { error: 'Failed to create blog post' },
      { status: 500 }
    );
  }
}
