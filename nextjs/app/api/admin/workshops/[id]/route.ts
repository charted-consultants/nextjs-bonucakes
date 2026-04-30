import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET /api/admin/workshops/[id] - Get single workshop registration
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const id = parseInt(params.id);
    const registration = await prisma.workshopRegistration.findUnique({
      where: { id },
      include: {
        customer: true,
      },
    });

    if (!registration) {
      return NextResponse.json(
        { error: 'Registration not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(registration);
  } catch (error) {
    console.error('Error fetching workshop registration:', error);
    return NextResponse.json(
      { error: 'Failed to fetch workshop registration' },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/workshops/[id] - Update workshop registration
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const id = parseInt(params.id);
    const body = await request.json();

    // Check if registration exists
    const existing = await prisma.workshopRegistration.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Registration not found' },
        { status: 404 }
      );
    }

    // Update the registration
    const updateData: any = {};

    if (body.attended !== undefined) {
      updateData.attended = body.attended;
      if (body.attended && !existing.attendanceDate) {
        updateData.attendanceDate = new Date();
      }
    }

    if (body.workshopName) updateData.workshopName = body.workshopName;
    if (body.workshopDate) updateData.workshopDate = new Date(body.workshopDate);
    if (body.age !== undefined) updateData.age = body.age;
    if (body.location !== undefined) updateData.location = body.location;
    if (body.phone !== undefined) updateData.phone = body.phone;
    if (body.facebookLink !== undefined) updateData.facebookLink = body.facebookLink;
    if (body.fbExperience !== undefined) updateData.fbExperience = body.fbExperience;
    if (body.barriers !== undefined) updateData.barriers = body.barriers;
    if (body.goals !== undefined) updateData.goals = body.goals;
    if (body.specificQuestions !== undefined) updateData.specificQuestions = body.specificQuestions;
    if (body.availability !== undefined) updateData.availability = body.availability;
    if (body.referralSource !== undefined) updateData.referralSource = body.referralSource;
    if (body.otherNotes !== undefined) updateData.otherNotes = body.otherNotes;

    const updated = await prisma.workshopRegistration.update({
      where: { id },
      data: updateData,
      include: {
        customer: true,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating workshop registration:', error);
    return NextResponse.json(
      { error: 'Failed to update workshop registration' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/workshops/[id] - Delete workshop registration
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const id = parseInt(params.id);

    // Check if registration exists
    const existing = await prisma.workshopRegistration.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Registration not found' },
        { status: 404 }
      );
    }

    await prisma.workshopRegistration.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return NextResponse.json({ message: 'Registration deleted successfully' });
  } catch (error) {
    console.error('Error deleting workshop registration:', error);
    return NextResponse.json(
      { error: 'Failed to delete workshop registration' },
      { status: 500 }
    );
  }
}
