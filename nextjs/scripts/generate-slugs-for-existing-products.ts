/**
 * Script to generate slugs for existing products that don't have them
 * or have invalid slugs.
 *
 * Run with: npx tsx scripts/generate-slugs-for-existing-products.ts
 */

import { PrismaClient } from '@prisma/client';
import { slugify, isValidSlugFormat } from '../lib/utils/slug';

const prisma = new PrismaClient();

async function generateSlugForProduct(
  productId: number,
  nameVi: string,
  currentSlug: string | null
): Promise<string> {
  // Generate base slug from Vietnamese name
  const baseSlug = slugify(nameVi);

  if (!baseSlug) {
    throw new Error(`Cannot generate slug from name: ${nameVi}`);
  }

  // Check if base slug is available (excluding current product)
  const existing = await prisma.product.findFirst({
    where: {
      slug: baseSlug,
      id: { not: productId },
    },
  });

  if (!existing) {
    return baseSlug;
  }

  // Find a unique slug by appending numbers
  let counter = 2;
  while (true) {
    const candidateSlug = `${baseSlug}-${counter}`;

    const exists = await prisma.product.findFirst({
      where: {
        slug: candidateSlug,
        id: { not: productId },
      },
    });

    if (!exists) {
      return candidateSlug;
    }

    counter++;

    if (counter > 1000) {
      throw new Error('Unable to generate unique slug after 1000 attempts');
    }
  }
}

async function main() {
  console.log('\n=== Product Slug Generation Script ===\n');

  try {
    // Get all products
    const products = await prisma.product.findMany({
      select: {
        id: true,
        nameVi: true,
        nameEn: true,
        slug: true,
      },
      orderBy: {
        id: 'asc',
      },
    });

    console.log(`Found ${products.length} products in database\n`);

    if (products.length === 0) {
      console.log('No products found. Exiting.\n');
      return;
    }

    // Categorize products
    const needsSlug: typeof products = [];
    const hasInvalidSlug: typeof products = [];
    const hasValidSlug: typeof products = [];

    products.forEach((product) => {
      if (!product.slug) {
        needsSlug.push(product);
      } else if (!isValidSlugFormat(product.slug)) {
        hasInvalidSlug.push(product);
      } else {
        hasValidSlug.push(product);
      }
    });

    console.log('Product Analysis:');
    console.log(`- Products with valid slugs: ${hasValidSlug.length}`);
    console.log(`- Products with invalid slugs: ${hasInvalidSlug.length}`);
    console.log(`- Products without slugs: ${needsSlug.length}\n`);

    // Process products that need slug generation
    const toUpdate = [...needsSlug, ...hasInvalidSlug];

    if (toUpdate.length === 0) {
      console.log('✓ All products have valid slugs!\n');
      return;
    }

    console.log(`Processing ${toUpdate.length} products...\n`);

    let successCount = 0;
    let errorCount = 0;

    for (const product of toUpdate) {
      try {
        const newSlug = await generateSlugForProduct(
          product.id,
          product.nameVi,
          product.slug
        );

        await prisma.product.update({
          where: { id: product.id },
          data: { slug: newSlug },
        });

        console.log(
          `✓ [${product.id}] ${product.nameVi.padEnd(40)} => ${newSlug}`
        );
        successCount++;
      } catch (error: any) {
        console.error(
          `✗ [${product.id}] ${product.nameVi.padEnd(40)} => Error: ${error.message}`
        );
        errorCount++;
      }
    }

    console.log('\n=== Summary ===');
    console.log(`Successfully updated: ${successCount}`);
    console.log(`Errors: ${errorCount}`);
    console.log('Total processed:', successCount + errorCount);

    if (errorCount === 0) {
      console.log('\n✓ All products have been updated successfully!\n');
    } else {
      console.log('\n⚠ Some products failed to update. Please review errors above.\n');
    }
  } catch (error) {
    console.error('\n✗ Fatal error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((error) => {
    console.error('Unhandled error:', error);
    process.exit(1);
  });
