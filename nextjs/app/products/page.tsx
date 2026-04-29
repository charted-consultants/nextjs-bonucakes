'use client';

import { useState, useEffect } from 'react';
import ProductCard, { Product } from '@/components/ProductCard';
import ProductFilters, { AvailabilityFilter, CategoryFilter } from '@/components/ProductFilters';
import { useLanguage } from '@/components/LanguageToggle';

function getProductCategory(slug: string): CategoryFilter {
  if (slug.includes('banh-mi')) return 'banh-mi';
  if (slug.includes('vien') || slug.includes('bao')) return 'meat-balls';
  if (slug.includes('xa-xiu') || slug.includes('vit') || slug.includes('nem')) return 'meats';
  if (slug.includes('cha-') || slug.includes('pate') || slug.includes('thit-nguoi')) return 'condiments';
  return 'all';
}

function mapApiProduct(p: any, index: number): Product {
  return {
    id: p.slug,
    slug: p.slug,
    name: { vi: p.nameVi, en: p.nameEn },
    shortDescription: {
      vi: p.shortDescriptionVi || '',
      en: p.shortDescriptionEn || '',
    },
    images: p.images?.length ? p.images : p.imageSrc ? [p.imageSrc] : [],
    price: {
      amount: parseFloat(p.price),
      currency: 'GBP',
      displayPrice: `£${p.price}`,
      displayPriceVi: `£${p.price}`,
    },
    promotion: p.promoTitleVi || p.promoTitleEn
      ? { vi: p.promoTitleVi || '', en: p.promoTitleEn || '' }
      : undefined,
    available: p.available,
    featured: p.featured,
    sortOrder: index,
  };
}

export default function ProductsPage() {
  const currentLang = useLanguage();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [availabilityFilter, setAvailabilityFilter] = useState<AvailabilityFilter>('all');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');

  useEffect(() => {
    fetch('/api/products')
      .then((res) => res.json())
      .then((data) => {
        const mapped = (data.products || []).map(mapApiProduct);
        setProducts(mapped);
      })
      .finally(() => setLoading(false));
  }, []);

  const filteredProducts = products
    .filter((p) => {
      if (availabilityFilter === 'available') return p.available;
      if (availabilityFilter === 'out-of-stock') return !p.available;
      return true;
    })
    .filter((p) => {
      if (categoryFilter === 'all') return true;
      return getProductCategory(p.slug) === categoryFilter;
    })
    .sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <div className="min-h-screen bg-light">
      <header className="relative bg-light pt-32 pb-16 border-b border-primary/10">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-secondary uppercase tracking-widest text-sm mb-4 font-medium">
            {currentLang === 'vi' ? 'Sản phẩm của chúng tôi' : 'Our Products'}
          </p>
          <h1 className="text-4xl md:text-5xl font-bold text-primary mb-6 font-serif">
            Bếp Bà Bo
          </h1>
          <p className="text-xl text-muted max-w-3xl mx-auto">
            {currentLang === 'vi'
              ? 'Đồ ăn Việt Nam tự làm với công thức truyền thống. Chất lượng tươi ngon, đóng gói cẩn thận, giao hàng nhanh chóng.'
              : 'Homemade Vietnamese food with traditional recipes. Fresh quality, carefully packaged, fast delivery.'}
          </p>
        </div>
      </header>

      <section className="py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-6">
          <ProductFilters
            availabilityFilter={availabilityFilter}
            categoryFilter={categoryFilter}
            onAvailabilityChange={setAvailabilityFilter}
            onCategoryChange={setCategoryFilter}
          />

          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="animate-pulse bg-white rounded-2xl h-80" />
              ))}
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted text-lg">
                {currentLang === 'vi' ? 'Chưa có sản phẩm nào.' : 'No products available yet.'}
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
