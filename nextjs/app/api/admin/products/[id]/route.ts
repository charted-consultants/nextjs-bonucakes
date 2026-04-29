import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkAuth } from '@/lib/auth-middleware';
import {
  errorResponse,
  handleApiError,
  badRequestResponse,
  unauthorizedResponse,
  notFoundResponse,
  successResponse,
  parseIntId,
  withNoCacheHeaders
} from '@/lib/api-helpers';
import { generateUniqueSlug, isValidSlugFormat } from '@/lib/utils/slug';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/products/[id]
 * Get a specific product by ID (admin only)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const isAuthed = await checkAuth(request);
    if (!isAuthed) {
      return unauthorizedResponse('Admin access required');
    }

    const id = parseIntId(params.id);
    if (id === null) {
      return badRequestResponse('Invalid product ID');
    }

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        productVariants: {
          orderBy: { price: 'asc' },
        },
        nutritionInfo: true,
        productFaqs: {
          orderBy: { displayOrder: 'asc' },
        },
        reviews: {
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
        _count: {
          select: {
            reviews: true,
            orderItems: true,
          }
        }
      },
    });

    if (!product) {
      return notFoundResponse('Product');
    }

    // Get review statistics
    const reviewStats = await prisma.review.aggregate({
      where: {
        productId: id,
        approved: true,
      },
      _avg: {
        rating: true,
      },
      _count: {
        rating: true,
      }
    });

    const response = NextResponse.json({
      product: {
        ...product,
        reviewStats: {
          averageRating: reviewStats._avg.rating || 0,
          totalReviews: reviewStats._count.rating || 0,
        }
      }
    });

    return withNoCacheHeaders(response);
  } catch (error) {
    return handleApiError(error, 'fetch product');
  }
}

/**
 * PUT /api/admin/products/[id]
 * Update a product (admin only)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const isAuthed = await checkAuth(request);
    if (!isAuthed) {
      return unauthorizedResponse('Admin access required');
    }

    const id = parseIntId(params.id);
    if (id === null) {
      return badRequestResponse('Invalid product ID');
    }

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      return notFoundResponse('Product');
    }

    const body = await request.json();

    const {
      // Vietnamese fields
      nameVi,
      descriptionVi,
      shortDescriptionVi,
      ingredientsVi,
      howToUseVi,
      // English fields
      nameEn,
      descriptionEn,
      shortDescriptionEn,
      ingredientsEn,
      howToUseEn,
      // Common fields
      slug: providedSlug,
      sku,
      price,
      compareAtPrice,
      cost,
      category,
      tags,
      weight,
      weightUnit,
      servingSize,
      servingsPerContainer,
      calories,
      allergens,
      storageInstructions,
      shelfLife,
      imageSrc,
      imageAlt,
      images,
      featured,
      available,
      stock,
      stockStatus,
      trackInventory,
      complementaryProducts,
      promoTitle,
      promoDescription,
      promoImage,
      promoButtonText,
      promoButtonLink,
      metaTitle,
      metaDescription,
    } = body;

    // Handle slug update
    let slug = providedSlug;

    // If slug is being changed, validate and check uniqueness
    if (slug && slug !== existingProduct.slug) {
      // Validate slug format
      if (!isValidSlugFormat(slug)) {
        return badRequestResponse('Invalid slug format. Slug must contain only lowercase letters, numbers, and hyphens.');
      }

      // Check if slug is already taken by another product
      const slugExists = await prisma.product.findUnique({
        where: { slug },
      });

      if (slugExists) {
        return badRequestResponse('A product with this slug already exists');
      }
    }

    // If Vietnamese name is being changed and slug is not provided, regenerate slug
    if (nameVi && nameVi !== existingProduct.nameVi && !providedSlug) {
      try {
        slug = await generateUniqueSlug(nameVi, id);
      } catch (error: any) {
        return badRequestResponse(`Failed to generate slug: ${error.message}`);
      }
    }

    // If SKU is being changed, check if it's already taken
    if (sku && sku !== existingProduct.sku) {
      const skuExists = await prisma.product.findUnique({
        where: { sku },
      });

      if (skuExists) {
        return badRequestResponse('A product with this SKU already exists');
      }
    }

    // Update product
    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        // Vietnamese fields
        ...(nameVi !== undefined && { nameVi }),
        ...(descriptionVi !== undefined && { descriptionVi }),
        ...(shortDescriptionVi !== undefined && { shortDescriptionVi }),
        ...(ingredientsVi !== undefined && { ingredientsVi }),
        ...(howToUseVi !== undefined && { howToUseVi }),
        // English fields
        ...(nameEn !== undefined && { nameEn }),
        ...(descriptionEn !== undefined && { descriptionEn }),
        ...(shortDescriptionEn !== undefined && { shortDescriptionEn }),
        ...(ingredientsEn !== undefined && { ingredientsEn }),
        ...(howToUseEn !== undefined && { howToUseEn }),
        // Common fields
        ...(slug !== undefined && { slug }),
        ...(sku !== undefined && { sku }),
        ...(price !== undefined && { price }),
        ...(compareAtPrice !== undefined && { compareAtPrice }),
        ...(cost !== undefined && { cost }),
        ...(category !== undefined && { category }),
        ...(tags !== undefined && { tags }),
        ...(weight !== undefined && { weight }),
        ...(weightUnit !== undefined && { weightUnit }),
        ...(servingSize !== undefined && { servingSize }),
        ...(servingsPerContainer !== undefined && { servingsPerContainer }),
        ...(calories !== undefined && { calories }),
        ...(allergens !== undefined && { allergens }),
        ...(storageInstructions !== undefined && { storageInstructions }),
        ...(shelfLife !== undefined && { shelfLife }),
        ...(imageSrc !== undefined && { imageSrc }),
        ...(imageAlt !== undefined && { imageAlt }),
        ...(images !== undefined && { images }),
        ...(featured !== undefined && { featured }),
        ...(available !== undefined && { available }),
        ...(stock !== undefined && { stock }),
        ...(stockStatus !== undefined && { stockStatus }),
        ...(trackInventory !== undefined && { trackInventory }),
        ...(complementaryProducts !== undefined && { complementaryProducts }),
        ...(promoTitle !== undefined && { promoTitle }),
        ...(promoDescription !== undefined && { promoDescription }),
        ...(promoImage !== undefined && { promoImage }),
        ...(promoButtonText !== undefined && { promoButtonText }),
        ...(promoButtonLink !== undefined && { promoButtonLink }),
        ...(metaTitle !== undefined && { metaTitle }),
        ...(metaDescription !== undefined && { metaDescription }),
      },
      include: {
        productVariants: true,
        nutritionInfo: true,
        productFaqs: true,
      },
    });

    return successResponse(updatedProduct, 200, 'Product updated successfully');
  } catch (error) {
    return handleApiError(error, 'update product');
  }
}

/**
 * DELETE /api/admin/products/[id]
 * Delete a product (admin only)
 * This performs a soft delete by setting available to false
 * Query param: hard=true for hard delete (permanent)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const isAuthed = await checkAuth(request);
    if (!isAuthed) {
      return unauthorizedResponse('Admin access required');
    }

    const id = parseIntId(params.id);
    if (id === null) {
      return badRequestResponse('Invalid product ID');
    }

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      return notFoundResponse('Product');
    }

    // Soft delete
    await prisma.product.update({
      where: { id },
      data: { available: false, deletedAt: new Date() },
    });

    return successResponse(
      { id, available: false },
      200,
      'Product deactivated successfully'
    );
  } catch (error) {
    return handleApiError(error, 'delete product');
  }
}
