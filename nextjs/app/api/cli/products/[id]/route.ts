import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkCliAuth, unauthorizedCliResponse } from '@/lib/cli-auth';

export const dynamic = 'force-dynamic';

/**
 * PATCH /api/cli/products/[id]
 * Update a product's price, stock, availability, or featured status
 * Body: { price?, stock?, available?, featured?, stockStatus? }
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!checkCliAuth(request)) return unauthorizedCliResponse();

  const id = parseInt(params.id);
  if (isNaN(id)) {
    return NextResponse.json({ error: 'Invalid product id' }, { status: 400 });
  }

  const body = await request.json();
  const allowed = ['price', 'compareAtPrice', 'stock', 'available', 'featured', 'stockStatus'];
  const update: any = {};
  for (const key of allowed) {
    if (key in body) update[key] = body[key];
  }

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
  }

  update.updatedAt = new Date();

  const product = await prisma.product.update({
    where: { id },
    data: update,
    select: { id: true, nameEn: true, nameVi: true, slug: true, price: true, stock: true, available: true, stockStatus: true, featured: true },
  });

  return NextResponse.json({ product });
}
