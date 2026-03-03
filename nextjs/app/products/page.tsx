'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import ProductCard, { Product } from '@/components/ProductCard';
import ProductFilters, { AvailabilityFilter, CategoryFilter } from '@/components/ProductFilters';
import { useLanguage } from '@/components/LanguageToggle';

// Mock product data (based on products.json)
const mockProducts: Product[] = [
  {
    id: 'banh-mi-saigon',
    slug: 'banh-mi-sai-gon-half-baked',
    name: {
      vi: 'Bánh Mì Sài Gòn',
      en: 'Saigon Baguette',
    },
    shortDescription: {
      vi: 'Bánh mì nướng 70%, đóng gói riêng với đầy đủ nhân',
      en: '70% pre-baked bread with all fillings separately packed',
    },
    images: ['/img/banh-mi/banh-mi-3.webp?v=2'],
    price: {
      amount: 9,
      currency: 'GBP',
      displayPrice: '£9 / loaf',
      displayPriceVi: '£9 / ổ',
      unit: { en: 'loaf', vi: 'ổ' },
    },
    promotion: {
      vi: 'Mua 10 tặng 1',
      en: 'Buy 10 get 1 free',
    },
    available: true,
    featured: true,
    sortOrder: 1,
  },
  {
    id: 'bo-vien',
    slug: 'bo-vien',
    name: {
      vi: 'Bò Viên',
      en: 'Beef Balls',
    },
    shortDescription: {
      vi: 'Bò viên tự làm, không chất bảo quản, giòn tươi',
      en: 'Homemade beef balls, no preservatives, fresh and bouncy',
    },
    images: ['/images/products/bo-vien-v2.webp'],
    price: {
      amount: 15,
      currency: 'GBP',
      displayPrice: '£15 / 500g',
      displayPriceVi: '£15 / 500gr',
      unit: { en: '500g', vi: '500gr' },
    },
    available: true,
    featured: true,
    sortOrder: 2,
  },
  {
    id: 'ga-vien',
    slug: 'ga-vien',
    name: {
      vi: 'Gà Viên',
      en: 'Chicken Balls',
    },
    shortDescription: {
      vi: 'Gà viên tự làm, không chất bảo quản, giòn tươi',
      en: 'Homemade chicken balls, no preservatives, fresh and bouncy',
    },
    images: ['/images/products/ga-vien-v2.webp'],
    price: {
      amount: 12,
      currency: 'GBP',
      displayPrice: '£12 / 500g',
      displayPriceVi: '£12 / 500gr',
      unit: { en: '500g', vi: '500gr' },
    },
    available: true,
    featured: true,
    sortOrder: 3,
  },
  {
    id: 'xa-xiu',
    slug: 'thit-xa-xiu',
    name: {
      vi: 'Thịt Xá Xíu',
      en: 'Char Siu (BBQ Pork)',
    },
    shortDescription: {
      vi: 'Thịt xá xíu tự làm, ăn với mì, cơm, hoặc bánh',
      en: 'Homemade char siu, great with noodles, rice, or bread',
    },
    images: ['/img/xa-xiu.webp'],
    price: {
      amount: 16,
      currency: 'GBP',
      displayPrice: '£16 / 500g',
      displayPriceVi: '£16 / 500gr',
      unit: { en: '500g', vi: '500gr' },
    },
    available: false,
    featured: true,
    sortOrder: 4,
  },
  {
    id: 'vit-quay',
    slug: 'vit-quay',
    name: {
      vi: 'Vịt Quay',
      en: 'Roast Duck',
    },
    shortDescription: {
      vi: 'Vịt quay giòn da, đã chặt sẵn, kèm công thức mì vịt tiềm',
      en: 'Crispy roast duck, pre-cut, includes duck noodle soup recipe',
    },
    images: ['/images/products/vit-quay-v2.webp'],
    price: {
      amount: 32,
      currency: 'GBP',
      displayPrice: '£32 / con',
      displayPriceVi: '£32 / con',
      unit: { en: 'whole duck', vi: 'con' },
    },
    available: true,
    featured: true,
    sortOrder: 5,
  },
  {
    id: 'nem-lui',
    slug: 'nem-lui',
    name: {
      vi: 'Nem Lụi',
      en: 'Grilled Pork Skewers (Nem Lui)',
    },
    shortDescription: {
      vi: 'Nem lụi tự làm, nướng sơ hoặc hâm microwave là ăn được',
      en: 'Homemade nem lui, grill or microwave to serve',
    },
    images: ['/images/products/nem-lui-v2.webp'],
    price: {
      amount: 15,
      currency: 'GBP',
      displayPrice: '£15 / 500g',
      displayPriceVi: '£15 / 500gr',
      unit: { en: '500g', vi: '500gr' },
    },
    available: true,
    featured: true,
    sortOrder: 6,
  },
  {
    id: 'cha-lua',
    slug: 'cha-lua',
    name: {
      vi: 'Chả Lụa',
      en: 'Vietnamese Ham (Cha Lua)',
    },
    shortDescription: {
      vi: 'Chả lụa tự làm, bán riêng để khách tự kết hợp',
      en: 'Homemade Vietnamese ham, sold separately for custom use',
    },
    images: ['/img/cha-lua.webp'],
    price: {
      amount: 12,
      currency: 'GBP',
      displayPrice: '£12 / 500g',
      displayPriceVi: '£12 / 500gr',
      unit: { en: '500g', vi: '500gr' },
    },
    available: true,
    featured: true,
    sortOrder: 7,
  },
  {
    id: 'pate',
    slug: 'pate',
    name: {
      vi: 'Pate',
      en: 'Pork Liver Pate',
    },
    shortDescription: {
      vi: 'Pate gan heo tự làm, bán riêng',
      en: 'Homemade pork liver pate, sold separately',
    },
    images: ['/images/products/pate-1.webp'],
    price: {
      amount: 16,
      currency: 'GBP',
      displayPrice: '£16 / 500g',
      displayPriceVi: '£16 / 500gr',
      unit: { en: '500g', vi: '500gr' },
    },
    available: true,
    featured: true,
    sortOrder: 8,
  },
  {
    id: 'thit-nguoi',
    slug: 'thit-nguoi',
    name: {
      vi: 'Thịt Nguội',
      en: 'Cold Cuts',
    },
    shortDescription: {
      vi: 'Thịt nguội tự làm, bán riêng',
      en: 'Homemade cold cuts, sold separately',
    },
    images: ['/images/products/thit-nguoi-v2.webp'],
    price: {
      amount: 15,
      currency: 'GBP',
      displayPrice: '£15 / 500g',
      displayPriceVi: '£15 / 500gr',
      unit: { en: '500g', vi: '500gr' },
    },
    available: true,
    featured: false,
    sortOrder: 9,
  },
  {
    id: 'cha-bong',
    slug: 'cha-bong',
    name: {
      vi: 'Chà Bông',
      en: 'Pork Floss',
    },
    shortDescription: {
      vi: 'Chà bông heo tự làm, sợi bông, vị đậm vừa, ăn kèm cơm/cháo/bánh mì',
      en: 'Homemade pork floss, light and savory, perfect with rice, congee, or banh mi',
    },
    images: ['/images/products/cha-bong-1.webp'],
    price: {
      amount: 35,
      currency: 'GBP',
      displayPrice: '£35 / 500g',
      displayPriceVi: '£35 / 500gr',
      unit: { en: '500g', vi: '500gr' },
    },
    available: false,
    featured: false,
    sortOrder: 10,
  },
];

// Helper function to categorize products
function getProductCategory(productId: string): CategoryFilter {
  if (productId.includes('banh-mi')) return 'banh-mi';
  if (productId.includes('vien')) return 'meat-balls';
  if (productId.includes('xa-xiu') || productId.includes('vit') || productId.includes('nem')) return 'meats';
  if (productId.includes('cha-') || productId.includes('pate') || productId.includes('thit-nguoi')) return 'condiments';
  return 'all';
}

export default function ProductsPage() {
  const currentLang = useLanguage();
  const [availabilityFilter, setAvailabilityFilter] = useState<AvailabilityFilter>('all');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(mockProducts);

  // Filter products based on selected filters
  useEffect(() => {
    let filtered = [...mockProducts];

    // Apply availability filter
    if (availabilityFilter === 'available') {
      filtered = filtered.filter((product) => product.available);
    } else if (availabilityFilter === 'out-of-stock') {
      filtered = filtered.filter((product) => !product.available);
    }

    // Apply category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter((product) => getProductCategory(product.id) === categoryFilter);
    }

    // Sort by sortOrder
    filtered.sort((a, b) => a.sortOrder - b.sortOrder);

    setFilteredProducts(filtered);
  }, [availabilityFilter, categoryFilter]);

  // This function is no longer needed as ProductCard now handles add to cart via Zustand

  return (
    <div className="min-h-screen bg-cream">
      <Navbar />

      {/* Hero Section */}
      <header className="relative bg-warmwhite pt-32 pb-16 border-b border-espresso/10">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-terracotta uppercase tracking-widest text-sm mb-4 font-medium">
            {currentLang === 'vi' ? 'Sản phẩm của chúng tôi' : 'Our Products'}
          </p>
          <h1 className="text-4xl md:text-5xl font-bold text-espresso mb-6 font-serif">
            {currentLang === 'vi' ? 'Bếp Bà Bo' : 'Bếp Bà Bo'}
          </h1>
          <p className="text-xl text-coffee max-w-3xl mx-auto">
            {currentLang === 'vi'
              ? 'Đồ ăn Việt Nam tự làm với công thức truyền thống. Chất lượng tươi ngon, đóng gói cẩn thận, giao hàng nhanh chóng.'
              : 'Homemade Vietnamese food with traditional recipes. Fresh quality, carefully packaged, fast delivery.'}
          </p>
        </div>
      </header>

      {/* Products Section */}
      <section className="py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-6">
          {/* Filters */}
          <ProductFilters
            availabilityFilter={availabilityFilter}
            categoryFilter={categoryFilter}
            onAvailabilityChange={setAvailabilityFilter}
            onCategoryChange={setCategoryFilter}
          />

          {/* Products Grid */}
          {filteredProducts.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-coffee text-lg">
                {currentLang === 'vi' ? 'Chưa có sản phẩm nào.' : 'No products available yet.'}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-espresso border-t border-gold/20 py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <a href="/" className="text-2xl font-bold text-gold font-serif">
              Bonu F&B
            </a>
            <div className="flex gap-6 text-cream/60 text-sm">
              <a href="/story" className="hover:text-white transition-colors">
                {currentLang === 'vi' ? 'Câu chuyện' : 'Story'}
              </a>
              <a href="/products" className="hover:text-white transition-colors">
                {currentLang === 'vi' ? 'Sản phẩm' : 'Products'}
              </a>
              <a href="/culinary-consultation" className="hover:text-white transition-colors">
                {currentLang === 'vi' ? 'Tư vấn' : 'Services'}
              </a>
              <a href="/blog" className="hover:text-white transition-colors">
                Blog
              </a>
              <a href="/#contact" className="hover:text-white transition-colors">
                {currentLang === 'vi' ? 'Liên hệ' : 'Contact'}
              </a>
            </div>
          </div>
          <div className="border-t border-cream/10 mt-8 pt-8 text-center text-cream/40 text-sm">
            <p>&copy; 2026 Uyen Nguyen - F&B Business Design</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
