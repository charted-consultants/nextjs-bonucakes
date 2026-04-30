/**
 * Admin Media Library API
 * GET: List all uploaded media files with pagination
 * DELETE: Delete a media file (via query param ?id=123)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { deleteFromR2 } from '@/lib/r2-storage';

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

// GET: List all media files
export async function GET(request: NextRequest) {
  const authCheck = await checkAdminAuth();
  if (!authCheck.authorized) {
    return NextResponse.json({ error: authCheck.error }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const fileType = searchParams.get('fileType') || '';

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (fileType) {
      where.fileType = { contains: fileType };
    }

    // Get media files and total count
    const [mediaFiles, totalCount] = await Promise.all([
      prisma.media.findMany({
        where,
        skip,
        take: limit,
        orderBy: { uploadedAt: 'desc' },
      }),
      prisma.media.count({ where }),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    // Build URLs for media files
    const PUBLIC_URL = process.env.R2_PUBLIC_URL || '';
    const mediaWithUrls = mediaFiles.map((media) => ({
      ...media,
      url: `${PUBLIC_URL}/${media.filePath}`,
    }));

    return NextResponse.json({
      media: mediaWithUrls,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasMore: page < totalPages,
      },
    });
  } catch (error) {
    console.error('Error fetching media files:', error);
    return NextResponse.json(
      { error: 'Failed to fetch media files' },
      { status: 500 }
    );
  }
}

// DELETE: Delete a media file
export async function DELETE(request: NextRequest) {
  const authCheck = await checkAdminAuth();
  if (!authCheck.authorized) {
    return NextResponse.json({ error: authCheck.error }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const mediaId = searchParams.get('id');

    if (!mediaId) {
      return NextResponse.json({ error: 'Media ID is required' }, { status: 400 });
    }

    const id = parseInt(mediaId);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid media ID' }, { status: 400 });
    }

    // Find the media record
    const media = await prisma.media.findUnique({
      where: { id },
    });

    if (!media) {
      return NextResponse.json({ error: 'Media not found' }, { status: 404 });
    }

    // Delete from R2 if it's stored there
    if (media.storageType === 'r2') {
      try {
        await deleteFromR2(media.filePath);
      } catch (error) {
        console.error('Error deleting from R2:', error);
        // Continue with database deletion even if R2 deletion fails
      }
    }

    await prisma.media.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return NextResponse.json({
      message: 'Media deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting media:', error);
    return NextResponse.json(
      { error: 'Failed to delete media' },
      { status: 500 }
    );
  }
}
