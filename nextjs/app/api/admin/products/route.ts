import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkAuth } from '@/lib/auth-middleware';
import {
  errorResponse,
  handleApiError,
  badRequestResponse,
  unauthorizedResponse,
  validateRequiredFields,
  validateMultilingualFields,
  successResponse,
  parsePaginationParams,
  paginatedResponse,
  withNoCacheHeaders
} from '@/lib/api-helpers';
import { generateUniqueSlug, isValidSlugFormat } from '@/lib/utils/slug';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/products
 * Get all products (admin only)
 * Query params:
 * - page: page number
 * - limit: items per page
 * - category: filter by category
 * - available: filter by availability (true/false)
 * - search: search in product names
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const isAuthed = await checkAuth(request);
    if (!isAuthed) {
      return unauthorizedResponse('Admin access required');
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const available = searchParams.get('available');
    const search = searchParams.get('search');
    const usePagination = searchParams.has('page') || searchParams.has('limit');

    // Build where clause
    const where: any = {};

    if (category) {
      where.category = category;
    }

    if (available !== null) {
      where.available = available === 'true';
    }

    if (search) {
      where.OR = [
        { nameVi: { contains: search, mode: 'insensitive' } },
        { nameEn: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Handle pagination if requested
    if (usePagination) {
      const { page, limit, skip } = parsePaginationParams(searchParams);

      const [products, total] = await Promise.all([
        prisma.product.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
          include: {
            productVariants: {
              orderBy: { price: 'asc' },
            },
            nutritionInfo: true,
            productFaqs: {
              where: { active: true },
              orderBy: { displayOrder: 'asc' },
            },
            _count: {
              select: {
                reviews: true,
                orderItems: true,
              }
            }
          },
        }),
        prisma.product.count({ where })
      ]);

      return paginatedResponse(products, total, page, limit);
    }

    // Return all products without pagination
    const products = await prisma.product.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        productVariants: {
          orderBy: { price: 'asc' },
        },
        nutritionInfo: true,
        productFaqs: {
          where: { active: true },
          orderBy: { displayOrder: 'asc' },
        },
        _count: {
          select: {
            reviews: true,
            orderItems: true,
          }
        }
      },
    });

    const response = NextResponse.json({ products });
    return withNoCacheHeaders(response);
  } catch (error) {
    return handleApiError(error, 'fetch products');
  }
}

/**
 * POST /api/admin/products
 * Create a new product (admin only)
 * Body: Product data with multilingual fields
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const isAuthed = await checkAuth(request);
    if (!isAuthed) {
      return unauthorizedResponse('Admin access required');
    }

    const body = await request.json();

    // Validate required multilingual fields
    const multilingualValidation = validateMultilingualFields(body, ['name', 'description']);
    if (!multilingualValidation.valid) {
      return badRequestResponse(`Missing required multilingual fields: ${multilingualValidation.missing?.join(', ')}`);
    }

    // Validate other required fields (slug is optional, will be auto-generated)
    const validation = validateRequiredFields(body, ['price', 'category']);
    if (!validation.valid) {
      return badRequestResponse(`Missing required fields: ${validation.missing?.join(', ')}`);
    }

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

    // Generate or validate slug
    let slug: string;

    if (providedSlug) {
      // Validate provided slug format
      if (!isValidSlugFormat(providedSlug)) {
        return badRequestResponse('Invalid slug format. Slug must contain only lowercase letters, numbers, and hyphens.');
      }

      // Check if provided slug already exists
      const existingProduct = await prisma.product.findUnique({
        where: { slug: providedSlug },
      });

      if (existingProduct) {
        return badRequestResponse('A product with this slug already exists');
      }

      slug = providedSlug;
    } else {
      // Auto-generate unique slug from Vietnamese name
      if (!nameVi) {
        return badRequestResponse('Vietnamese name is required to generate slug');
      }

      try {
        slug = await generateUniqueSlug(nameVi);
      } catch (error: any) {
        return badRequestResponse(`Failed to generate slug: ${error.message}`);
      }
    }

    // Check if SKU already exists (if provided)
    if (sku) {
      const existingSku = await prisma.product.findUnique({
        where: { sku },
      });

      if (existingSku) {
        return badRequestResponse('A product with this SKU already exists');
      }
    }

    // Create product
    const product = await prisma.product.create({
      data: {
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
        slug,
        sku,
        price,
        compareAtPrice,
        cost,
        category,
        tags: tags || [],
        weight,
        weightUnit: weightUnit || 'g',
        servingSize,
        servingsPerContainer,
        calories,
        allergens: allergens || [],
        storageInstructions,
        shelfLife,
        imageSrc,
        imageAlt,
        images: images || [],
        featured: featured || false,
        available: available !== undefined ? available : true,
        stock: stock || 0,
        stockStatus: stockStatus || 'in_stock',
        trackInventory: trackInventory !== undefined ? trackInventory : true,
        complementaryProducts: complementaryProducts || [],
        promoTitle,
        promoDescription,
        promoImage,
        promoButtonText,
        promoButtonLink,
        metaTitle,
        metaDescription,
      },
    });

    return successResponse(product, 201, 'Product created successfully');
  } catch (error) {
    return handleApiError(error, 'create product');
  }
}
