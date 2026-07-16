/**
 * Public Individual Blog Post API
 * GET: Get a single published post by slug and increment views
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;

    // Find the post
    const post = await prisma.blogPost.findUnique({
      where: { slug },
    });

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Only show published, non-deleted posts to the public
    if (!post.published || post.deletedAt) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Increment view count
    await prisma.blogPost.update({
      where: { slug },
      data: { views: post.views + 1 },
    });

    // Return post with incremented view count
    const updatedPost = {
      ...post,
      views: post.views + 1,
    };

    return NextResponse.json({ post: updatedPost });
  } catch (error) {
    console.error('Error fetching blog post:', error);
    return NextResponse.json(
      { error: 'Failed to fetch blog post' },
      { status: 500 }
    );
  }
}
