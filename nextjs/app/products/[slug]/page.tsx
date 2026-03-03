'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { useLanguage } from '@/components/LanguageToggle';
import { ShoppingCart, Star, Check, X } from 'lucide-react';
import { useCartStore } from '@/lib/stores/cart-store';

interface ProductData {
  id: number;
  nameVi: string;
  nameEn: string;
  descriptionVi: string;
  descriptionEn: string;
  shortDescriptionVi?: string;
  shortDescriptionEn?: string;
  slug: string;
  sku?: string;
  price: string;
  compareAtPrice?: string;
  category: string;
  tags: string[];
  imageSrc?: string;
  imageAlt?: string;
  images: string[];
  featured: boolean;
  available: boolean;
  stock: number;
  stockStatus: string;
  ingredientsVi?: string;
  ingredientsEn?: string;
  howToUseVi?: string;
  howToUseEn?: string;
  allergens: string[];
  weight?: string;
  weightUnit?: string;
  servingSize?: string;
  calories?: number;
  reviewStats: {
    averageRating: number;
    totalReviews: number;
  };
  complementaryProducts: Array<{
    id: number;
    nameVi: string;
    nameEn: string;
    slug: string;
    price: string;
    imageSrc?: string;
    shortDescriptionVi?: string;
    shortDescriptionEn?: string;
  }>;
  productVariants: Array<{
    id: number;
    nameVi: string;
    nameEn: string;
    price: string;
    stock: number;
    available: boolean;
  }>;
  reviews: Array<{
    id: number;
    name: string;
    rating: number;
    title?: string;
    comment: string;
    createdAt: string;
    verified: boolean;
  }>;
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const currentLang = useLanguage();
  const slug = params.slug as string;

  const [product, setProduct] = useState<ProductData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<number | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);

  const addToCart = useCartStore((state) => state.addItem);

  useEffect(() => {
    async function fetchProduct() {
      try {
        const res = await fetch(`/api/products/${slug}`);
        if (!res.ok) {
          if (res.status === 404) {
            setError('Product not found');
          } else {
            setError('Failed to load product');
          }
          return;
        }

        const data = await res.json();
        setProduct(data.product);
      } catch (err) {
        console.error('Error fetching product:', err);
        setError('Failed to load product');
      } finally {
        setLoading(false);
      }
    }

    if (slug) {
      fetchProduct();
    }
  }, [slug]);

  const handleAddToCart = () => {
    if (!product) return;

    const variant = selectedVariant
      ? product.productVariants.find((v) => v.id === selectedVariant)
      : null;

    const priceAmount = variant ? parseFloat(variant.price) : parseFloat(product.price);
    const displayPrice = `£${priceAmount}`;

    addToCart({
      id: variant ? `variant-${variant.id}` : product.id.toString(),
      slug: product.slug,
      name: {
        en: variant ? variant.nameEn : product.nameEn,
        vi: variant ? variant.nameVi : product.nameVi,
      },
      price: {
        amount: priceAmount,
        currency: 'GBP',
        displayPrice: displayPrice,
        displayPriceVi: displayPrice,
      },
      images: product.images.length > 0
        ? [{ url: product.images[0], alt: product.imageAlt || product.nameEn }]
        : product.imageSrc
        ? [{ url: product.imageSrc, alt: product.imageAlt || product.nameEn }]
        : undefined,
    }, quantity);

    // Show success message or redirect to cart
    router.push('/cart');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cream">
        <Navbar />
        <div className="pt-32 pb-16">
          <div className="max-w-6xl mx-auto px-6">
            <div className="animate-pulse">
              <div className="grid md:grid-cols-2 gap-12">
                <div className="aspect-square bg-warmwhite rounded-lg"></div>
                <div className="space-y-4">
                  <div className="h-8 bg-warmwhite rounded w-3/4"></div>
                  <div className="h-4 bg-warmwhite rounded w-1/2"></div>
                  <div className="h-32 bg-warmwhite rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-cream">
        <Navbar />
        <div className="pt-32 pb-16">
          <div className="max-w-6xl mx-auto px-6 text-center">
            <h1 className="text-3xl font-bold text-espresso mb-4">
              {currentLang === 'vi' ? 'Không tìm thấy sản phẩm' : 'Product Not Found'}
            </h1>
            <p className="text-coffee mb-8">
              {currentLang === 'vi'
                ? 'Sản phẩm bạn đang tìm không tồn tại hoặc đã bị xóa.'
                : 'The product you are looking for does not exist or has been removed.'}
            </p>
            <button
              onClick={() => router.push('/products')}
              className="bg-terracotta text-white px-6 py-3 rounded-lg hover:bg-terracotta/90 transition-colors"
            >
              {currentLang === 'vi' ? 'Quay lại trang sản phẩm' : 'Back to Products'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const displayImages = product.images.length > 0 ? product.images : product.imageSrc ? [product.imageSrc] : [];
  const currentImage = displayImages[selectedImage] || '/images/placeholder-product.jpg';
  const name = currentLang === 'vi' ? product.nameVi : product.nameEn;
  const description = currentLang === 'vi' ? product.descriptionVi : product.descriptionEn;
  const shortDescription = currentLang === 'vi' ? product.shortDescriptionVi : product.shortDescriptionEn;
  const ingredients = currentLang === 'vi' ? product.ingredientsVi : product.ingredientsEn;
  const howToUse = currentLang === 'vi' ? product.howToUseVi : product.howToUseEn;

  const priceToDisplay = selectedVariant
    ? product.productVariants.find((v) => v.id === selectedVariant)?.price
    : product.price;

  return (
    <div className="min-h-screen bg-cream">
      <Navbar />

      {/* Product Detail Section */}
      <section className="pt-32 pb-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12">
            {/* Product Images */}
            <div className="space-y-4">
              <div className="aspect-square bg-warmwhite rounded-lg overflow-hidden">
                <img
                  src={currentImage}
                  alt={product.imageAlt || name}
                  className="w-full h-full object-cover"
                />
              </div>
              {displayImages.length > 1 && (
                <div className="grid grid-cols-4 gap-4">
                  {displayImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(idx)}
                      className={`aspect-square rounded-lg overflow-hidden border-2 transition-colors ${
                        selectedImage === idx ? 'border-terracotta' : 'border-transparent'
                      }`}
                    >
                      <img src={img} alt={`${name} ${idx + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-espresso mb-2 font-serif">{name}</h1>
                {product.sku && (
                  <p className="text-sm text-coffee/60">
                    {currentLang === 'vi' ? 'Mã SP' : 'SKU'}: {product.sku}
                  </p>
                )}
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold text-terracotta">£{priceToDisplay}</span>
                {product.compareAtPrice && (
                  <span className="text-xl text-coffee/50 line-through">£{product.compareAtPrice}</span>
                )}
              </div>

              {/* Reviews */}
              {product.reviewStats.totalReviews > 0 && (
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${
                          i < Math.floor(product.reviewStats.averageRating)
                            ? 'fill-gold text-gold'
                            : 'text-coffee/20'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-coffee">
                    {product.reviewStats.averageRating.toFixed(1)} ({product.reviewStats.totalReviews}{' '}
                    {currentLang === 'vi' ? 'đánh giá' : 'reviews'})
                  </span>
                </div>
              )}

              {/* Stock Status */}
              <div className="flex items-center gap-2">
                {product.available ? (
                  <>
                    <Check className="w-5 h-5 text-green-600" />
                    <span className="text-green-600 font-medium">
                      {currentLang === 'vi' ? 'Còn hàng' : 'In Stock'}
                    </span>
                  </>
                ) : (
                  <>
                    <X className="w-5 h-5 text-red-600" />
                    <span className="text-red-600 font-medium">
                      {currentLang === 'vi' ? 'Hết hàng' : 'Out of Stock'}
                    </span>
                  </>
                )}
              </div>

              {/* Short Description */}
              {shortDescription && <p className="text-coffee leading-relaxed">{shortDescription}</p>}

              {/* Variants */}
              {product.productVariants.length > 0 && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-espresso">
                    {currentLang === 'vi' ? 'Chọn loại' : 'Select Variant'}
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {product.productVariants.map((variant) => (
                      <button
                        key={variant.id}
                        onClick={() => setSelectedVariant(variant.id)}
                        disabled={!variant.available}
                        className={`p-3 rounded-lg border-2 transition-colors ${
                          selectedVariant === variant.id
                            ? 'border-terracotta bg-terracotta/5'
                            : 'border-warmwhite hover:border-terracotta/50'
                        } ${!variant.available ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <div className="text-left">
                          <p className="font-medium text-espresso">
                            {currentLang === 'vi' ? variant.nameVi : variant.nameEn}
                          </p>
                          <p className="text-sm text-terracotta">£{variant.price}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity */}
              {product.available && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-espresso">
                    {currentLang === 'vi' ? 'Số lượng' : 'Quantity'}
                  </label>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-10 h-10 rounded-lg bg-warmwhite hover:bg-terracotta/10 transition-colors flex items-center justify-center"
                    >
                      -
                    </button>
                    <span className="text-xl font-medium text-espresso w-12 text-center">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-10 h-10 rounded-lg bg-warmwhite hover:bg-terracotta/10 transition-colors flex items-center justify-center"
                    >
                      +
                    </button>
                  </div>
                </div>
              )}

              {/* Add to Cart */}
              {product.available && (
                <button
                  onClick={handleAddToCart}
                  className="w-full bg-terracotta text-white py-4 rounded-lg font-medium hover:bg-terracotta/90 transition-colors flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="w-5 h-5" />
                  {currentLang === 'vi' ? 'Thêm vào giỏ hàng' : 'Add to Cart'}
                </button>
              )}

              {/* Product Tags */}
              {product.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {product.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-warmwhite text-coffee text-sm rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Product Details Tabs */}
          <div className="mt-16 border-t border-espresso/10 pt-12">
            <div className="space-y-8">
              {/* Description */}
              <div>
                <h2 className="text-2xl font-bold text-espresso mb-4 font-serif">
                  {currentLang === 'vi' ? 'Mô tả sản phẩm' : 'Product Description'}
                </h2>
                <div className="prose prose-lg max-w-none text-coffee">
                  <p className="whitespace-pre-line">{description}</p>
                </div>
              </div>

              {/* Ingredients */}
              {ingredients && (
                <div>
                  <h2 className="text-2xl font-bold text-espresso mb-4 font-serif">
                    {currentLang === 'vi' ? 'Thành phần' : 'Ingredients'}
                  </h2>
                  <p className="text-coffee whitespace-pre-line">{ingredients}</p>
                </div>
              )}

              {/* How to Use */}
              {howToUse && (
                <div>
                  <h2 className="text-2xl font-bold text-espresso mb-4 font-serif">
                    {currentLang === 'vi' ? 'Cách sử dụng' : 'How to Use'}
                  </h2>
                  <p className="text-coffee whitespace-pre-line">{howToUse}</p>
                </div>
              )}

              {/* Additional Info */}
              {(product.allergens.length > 0 || product.weight || product.calories) && (
                <div>
                  <h2 className="text-2xl font-bold text-espresso mb-4 font-serif">
                    {currentLang === 'vi' ? 'Thông tin bổ sung' : 'Additional Information'}
                  </h2>
                  <div className="grid md:grid-cols-2 gap-4">
                    {product.weight && (
                      <div>
                        <span className="font-medium text-espresso">
                          {currentLang === 'vi' ? 'Trọng lượng' : 'Weight'}:
                        </span>{' '}
                        <span className="text-coffee">
                          {product.weight}
                          {product.weightUnit}
                        </span>
                      </div>
                    )}
                    {product.calories && (
                      <div>
                        <span className="font-medium text-espresso">
                          {currentLang === 'vi' ? 'Calo' : 'Calories'}:
                        </span>{' '}
                        <span className="text-coffee">{product.calories}</span>
                      </div>
                    )}
                    {product.allergens.length > 0 && (
                      <div className="md:col-span-2">
                        <span className="font-medium text-espresso">
                          {currentLang === 'vi' ? 'Dị ứng' : 'Allergens'}:
                        </span>{' '}
                        <span className="text-coffee">{product.allergens.join(', ')}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Complementary Products */}
          {product.complementaryProducts.length > 0 && (
            <div className="mt-16 border-t border-espresso/10 pt-12">
              <h2 className="text-2xl font-bold text-espresso mb-8 font-serif">
                {currentLang === 'vi' ? 'Sản phẩm liên quan' : 'You May Also Like'}
              </h2>
              <div className="grid md:grid-cols-4 gap-6">
                {product.complementaryProducts.map((related) => (
                  <a
                    key={related.id}
                    href={`/products/${related.slug}`}
                    className="group bg-warmwhite rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    {related.imageSrc && (
                      <div className="aspect-square overflow-hidden">
                        <img
                          src={related.imageSrc}
                          alt={currentLang === 'vi' ? related.nameVi : related.nameEn}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      </div>
                    )}
                    <div className="p-4">
                      <h3 className="font-medium text-espresso mb-2">
                        {currentLang === 'vi' ? related.nameVi : related.nameEn}
                      </h3>
                      <p className="text-terracotta font-bold">£{related.price}</p>
                    </div>
                  </a>
                ))}
              </div>
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
