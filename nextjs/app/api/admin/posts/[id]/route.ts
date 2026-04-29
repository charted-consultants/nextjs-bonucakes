/**
 * Admin Individual Blog Post API
 * GET: Get a single post by ID
 * PUT: Update a post
 * DELETE: Delete a post
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Validation schema for updating blog posts
const blogPostUpdateSchema = z.object({
  titleVi: z.string().min(1, 'Vietnamese title is required').optional(),
  titleEn: z.string().min(1, 'English title is required').optional(),
  excerptVi: z.string().optional(),
  excerptEn: z.string().optional(),
  contentVi: z.string().min(1, 'Vietnamese content is required').optional(),
  contentEn: z.string().min(1, 'English content is required').optional(),
  slug: z.string().min(1, 'Slug is required').regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Invalid slug format').optional(),
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

// GET: Get a single blog post by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authCheck = await checkAdminAuth();
  if (!authCheck.authorized) {
    return NextResponse.json({ error: authCheck.error }, { status: 401 });
  }

  try {
    const postId = parseInt(params.id);

    if (isNaN(postId)) {
      return NextResponse.json({ error: 'Invalid post ID' }, { status: 400 });
    }

    const post = await prisma.blogPost.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    return NextResponse.json({ post });
  } catch (error) {
    console.error('Error fetching blog post:', error);
    return NextResponse.json(
      { error: 'Failed to fetch blog post' },
      { status: 500 }
    );
  }
}

// PUT: Update a blog post
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authCheck = await checkAdminAuth();
  if (!authCheck.authorized) {
    return NextResponse.json({ error: authCheck.error }, { status: 401 });
  }

  try {
    const postId = parseInt(params.id);

    if (isNaN(postId)) {
      return NextResponse.json({ error: 'Invalid post ID' }, { status: 400 });
    }

    // Check if post exists
    const existingPost = await prisma.blogPost.findUnique({
      where: { id: postId },
    });

    if (!existingPost) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    const body = await request.json();

    // Validate input
    const validatedData = blogPostUpdateSchema.parse(body);

    // If slug is being changed, check if it's already in use
    if (validatedData.slug && validatedData.slug !== existingPost.slug) {
      const slugExists = await prisma.blogPost.findUnique({
        where: { slug: validatedData.slug },
      });

      if (slugExists) {
        return NextResponse.json(
          { error: 'A post with this slug already exists' },
          { status: 400 }
        );
      }
    }

    // Set publishedAt if publishing for the first time
    let publishedAt = existingPost.publishedAt;
    if (validatedData.published && !existingPost.published && !publishedAt) {
      publishedAt = new Date();
    } else if (validatedData.publishedAt) {
      publishedAt = new Date(validatedData.publishedAt);
    }

    // Update the blog post
    const updateData: any = {};

    if (validatedData.titleVi !== undefined) updateData.titleVi = validatedData.titleVi;
    if (validatedData.titleEn !== undefined) updateData.titleEn = validatedData.titleEn;
    if (validatedData.excerptVi !== undefined) updateData.excerptVi = validatedData.excerptVi;
    if (validatedData.excerptEn !== undefined) updateData.excerptEn = validatedData.excerptEn;
    if (validatedData.contentVi !== undefined) updateData.contentVi = validatedData.contentVi;
    if (validatedData.contentEn !== undefined) updateData.contentEn = validatedData.contentEn;
    if (validatedData.slug !== undefined) updateData.slug = validatedData.slug;
    if (validatedData.image !== undefined) updateData.image = validatedData.image;
    if (validatedData.images !== undefined) updateData.images = validatedData.images;
    if (validatedData.category !== undefined) updateData.category = validatedData.category;
    if (validatedData.tags !== undefined) updateData.tags = validatedData.tags;
    if (validatedData.author !== undefined) updateData.author = validatedData.author;
    if (validatedData.authorImage !== undefined) updateData.authorImage = validatedData.authorImage;
    if (validatedData.authorRole !== undefined) updateData.authorRole = validatedData.authorRole;
    if (validatedData.featured !== undefined) updateData.featured = validatedData.featured;
    if (validatedData.published !== undefined) updateData.published = validatedData.published;
    if (publishedAt !== existingPost.publishedAt) updateData.publishedAt = publishedAt;
    if (validatedData.readingTime !== undefined) updateData.readingTime = validatedData.readingTime;
    if (validatedData.metaTitle !== undefined) updateData.metaTitle = validatedData.metaTitle;
    if (validatedData.metaDescription !== undefined) updateData.metaDescription = validatedData.metaDescription;

    const post = await prisma.blogPost.update({
      where: { id: postId },
      data: updateData,
    });

    return NextResponse.json({
      message: 'Blog post updated successfully',
      post,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error updating blog post:', error);
    return NextResponse.json(
      { error: 'Failed to update blog post' },
      { status: 500 }
    );
  }
}

// DELETE: Delete a blog post
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authCheck = await checkAdminAuth();
  if (!authCheck.authorized) {
    return NextResponse.json({ error: authCheck.error }, { status: 401 });
  }

  try {
    const postId = parseInt(params.id);

    if (isNaN(postId)) {
      return NextResponse.json({ error: 'Invalid post ID' }, { status: 400 });
    }

    // Check if post exists
    const existingPost = await prisma.blogPost.findUnique({
      where: { id: postId },
    });

    if (!existingPost) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    await prisma.blogPost.update({
      where: { id: postId },
      data: { deletedAt: new Date() },
    });

    return NextResponse.json({
      message: 'Blog post deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting blog post:', error);
    return NextResponse.json(
      { error: 'Failed to delete blog post' },
      { status: 500 }
    );
  }
}
