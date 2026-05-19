import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // 1. Bánh Bông Lan Trứng Muối
  const banhBongLan = await prisma.product.upsert({
    where: { slug: 'banh-bong-lan-trung-muoi' },
    update: {},
    create: {
      nameVi: 'Bánh Bông Lan Trứng Muối',
      nameEn: 'Salted Egg Sponge Cake',
      descriptionVi:
        'Cốt bánh mềm mịn tan trong miệng, để qua đêm vẫn ngon, để tủ 1 tuần vẫn ổn (không chất bảo quản). Trứng muối nướng bùi thơm. Chà bông chuẩn. 4 loại sốt đặc biệt.',
      descriptionEn:
        'Soft sponge melts in mouth, stays delicious overnight, lasts 1 week in fridge (no preservatives). Roasted salted egg with rich aroma. Premium pork floss. 4 special sauces.',
      shortDescriptionVi:
        'Cốt bánh mềm mịn, trứng muối nướng bùi thơm, chà bông chuẩn, 4 loại sốt đặc biệt',
      shortDescriptionEn:
        'Soft sponge cake, roasted salted egg, premium pork floss, 4 special sauces',
      slug: 'banh-bong-lan-trung-muoi',
      price: 0,
      category: 'cake',
      images: [],
      featured: true,
      available: false,
      stock: 0,
      stockStatus: 'out_of_stock',
      promoTitle: 'Coming Soon',
      tags: ['banh', 'trung-muoi', 'bong-lan', 'coming-soon'],
    },
  });

  console.log('✅ Bánh Bông Lan Trứng Muối:', banhBongLan.id, banhBongLan.slug);

  // 2. Chà Bông
  const chaBong = await prisma.product.upsert({
    where: { slug: 'cha-bong' },
    update: {
      featured: true,
      available: false,
      promoTitle: 'Coming Soon',
    },
    create: {
      nameVi: 'Chà Bông',
      nameEn: 'Pork Floss',
      descriptionVi:
        'Chà bông heo làm thủ công theo công thức truyền thống, sợi bông tơi, vị đậm vừa, phù hợp cho trẻ nhỏ và người lớn. Dùng kèm cơm, cháo, xôi, hoặc bánh mì.',
      descriptionEn:
        'Handmade pork floss using a traditional recipe. Light, fluffy strands with balanced seasoning. Great with rice, congee, sticky rice, or banh mi.',
      shortDescriptionVi:
        'Chà bông heo tự làm, sợi bông, vị đậm vừa, ăn kèm cơm/cháo/bánh mì',
      shortDescriptionEn:
        'Homemade pork floss, light and savory, perfect with rice, congee, or banh mi',
      slug: 'cha-bong',
      price: 0,
      category: 'condiments',
      images: [
        '/images/products/cha-bong-1.webp',
        '/images/products/cha-bong-2.webp',
      ],
      featured: true,
      available: false,
      stock: 0,
      stockStatus: 'out_of_stock',
      promoTitle: 'Coming Soon',
      tags: ['cha-bong', 'pork-floss', 'coming-soon'],
    },
  });

  console.log('✅ Chà Bông:', chaBong.id, chaBong.slug);
}

main()
  .catch((e) => {
    console.error('❌ Lỗi:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
