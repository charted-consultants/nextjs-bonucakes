import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET /api/admin/customers/filter - Filter customers for email campaigns
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const tags = searchParams.get('tags')?.split(',').filter(Boolean) || [];
    const location = searchParams.get('location');
    const marketingConsent = searchParams.get('marketingConsent') === 'true';
    const hasOrders = searchParams.get('hasOrders');

    // Build where clause
    const where: any = {};

    // Marketing consent filter (always apply if true)
    if (marketingConsent) {
      where.marketingConsent = true;
    }

    // Tags filter (customer must have ALL specified tags)
    if (tags.length > 0) {
      where.tags = {
        hasEvery: tags,
      };
    }

    // Location filter
    if (location) {
      where.workshopRegistrations = {
        some: {
          location: {
            contains: location,
            mode: 'insensitive',
          },
        },
      };
    }

    // Has orders filter
    if (hasOrders !== null) {
      if (hasOrders === 'true') {
        where.totalOrders = { gt: 0 };
      } else if (hasOrders === 'false') {
        where.totalOrders = 0;
      }
    }

    // Get filtered customers
    const customers = await prisma.customer.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        tags: true,
        totalOrders: true,
        workshopRegistrations: {
          select: {
            location: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Transform data for response
    const customersWithLocation = customers.map(customer => ({
      id: customer.id,
      name: customer.name,
      email: customer.email,
      tags: customer.tags,
      location: customer.workshopRegistrations?.[0]?.location || null,
    }));

    return NextResponse.json({
      customers: customersWithLocation,
      count: customers.length,
    });
  } catch (error) {
    console.error('Error filtering customers:', error);
    return NextResponse.json(
      { error: 'Failed to filter customers' },
      { status: 500 }
    );
  }
}
