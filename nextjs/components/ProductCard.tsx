'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, Check } from 'lucide-react';
import { useLanguage } from './LanguageToggle';
import { useCartStore } from '@/lib/stores/cart-store';
import ProductBadge from './ProductBadge';

export interface ProductVariant {
  id: number;
  nameVi: string;
  nameEn: string;
  price: string;
  available: boolean;
}

export interface Product {
  id: string;
  slug: string;
  name: {
    vi: string;
    en: string;
  };
  shortDescription: {
    vi: string;
    en: string;
  };
  images: string[];
  price: {
    amount: number;
    currency: string;
    displayPrice?: string;
    displayPriceVi?: string;
    unit?: {
      vi: string;
      en: string;
    };
  };
  promotion?: {
    vi: string;
    en: string;
  };
  available: boolean;
  featured: boolean;
  sortOrder: number;
  variants?: ProductVariant[];
}

interface ProductCardProps {
  product: Product;
  onAddToCart?: (productId: string) => void;
}

export default function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const currentLang = useLanguage();
  const [imageError, setImageError] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const [showVariantPicker, setShowVariantPicker] = useState(false);
  const addItem = useCartStore((state) => state.addItem);

  const name = product.name[currentLang] || product.name.vi;
  const shortDesc = product.shortDescription[currentLang] || product.shortDescription.vi;
  const image = product.images && product.images.length > 0 ? product.images[0] : '/placeholder-product.webp';

  const getDisplayPrice = () => {
    const { amount, currency, displayPrice, displayPriceVi, unit } = product.price;

    if (amount > 0 && unit) {
      const money = currency === 'GBP' ? `£${amount}` : `${amount.toLocaleString()}₫`;
      const unitText = unit[currentLang] || unit.vi || unit.en;
      return `${money} / ${unitText}`;
    }

    const display = currentLang === 'vi'
      ? (displayPriceVi || displayPrice || '')
      : (displayPrice || displayPriceVi || '');

    if (display) return display;

    if (amount > 0) {
      return currency === 'GBP' ? `£${amount}` : `${amount.toLocaleString()}₫`;
    }

    return '';
  };

  const handleAddToCartClick = () => {
    if (!product.available || isAdding) return;
    if (product.variants && product.variants.length > 0) {
      setShowVariantPicker(true);
      return;
    }
    addToCartDirect();
  };

  const addToCartDirect = async (variant?: ProductVariant) => {
    try {
      setIsAdding(true);
      const priceAmount = variant ? parseFloat(variant.price) : product.price.amount;
      const displayPrice = `£${priceAmount}`;

      addItem({
        id: variant ? `${product.id}-variant-${variant.id}` : product.id,
        slug: product.slug,
        name: variant
          ? { vi: `${product.name.vi} - ${variant.nameVi}`, en: `${product.name.en} - ${variant.nameEn}` }
          : product.name,
        price: {
          amount: priceAmount,
          currency: product.price.currency,
          displayPrice,
          displayPriceVi: displayPrice,
        },
        images: product.images.length > 0 ? [{ url: product.images[0], alt: product.name.en }] : undefined,
        hasPromo: !!(product.promotion),
      }, 1);

      setShowVariantPicker(false);
      setJustAdded(true);
      if (onAddToCart) onAddToCart(product.id);
      setTimeout(() => setJustAdded(false), 2000);
    } catch (error) {
      console.error('Error adding to cart:', error);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="relative flex flex-col bg-white border border-primary/10 overflow-hidden transition-transform duration-200 ease-in-out hover:-translate-y-1 hover:shadow-[0_8px_20px_rgba(0,0,0,0.15)]">
      {/* Variant Picker Modal */}
      {showVariantPicker && product.variants && (
        <div
          className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/95 backdrop-blur-sm p-6"
          onClick={() => setShowVariantPicker(false)}
        >
          <div
            className="w-full max-w-xs"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-center font-semibold text-primary mb-4 text-lg">
              {currentLang === 'vi' ? 'Chọn khối lượng' : 'Select weight'}
            </p>
            <div className="flex flex-col gap-3">
              {product.variants.map((v) => (
                <button
                  key={v.id}
                  disabled={!v.available}
                  onClick={() => addToCartDirect(v)}
                  className="flex items-center justify-between w-full border-2 border-primary/20 hover:border-secondary hover:bg-secondary/5 rounded-lg px-4 py-3 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="font-medium text-primary">
                    {currentLang === 'vi' ? v.nameVi : v.nameEn}
                  </span>
                  <span className="font-bold text-secondary">£{v.price}</span>
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowVariantPicker(false)}
              className="mt-4 w-full text-sm text-muted hover:text-primary transition-colors"
            >
              {currentLang === 'vi' ? 'Huỷ' : 'Cancel'}
            </button>
          </div>
        </div>
      )}
      {/* Product Image */}
      <Link href={`/products/${product.slug}`} className="relative">
        <div className="relative w-full h-64 bg-light">
          <Image
            src={imageError ? '/placeholder-product.webp' : image}
            alt={name}
            fill
            className="object-cover"
            onError={() => setImageError(true)}
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        </div>

        {/* Badges */}
        {product.featured && (
          <div className="absolute top-4 right-4">
            <ProductBadge type="featured" />
          </div>
        )}

        {product.promotion && product.available && (
          <div className="absolute top-4 left-4">
            <ProductBadge type="promotion" text={product.promotion} />
          </div>
        )}

        {!product.available && product.promotion && (
          <div className="absolute bottom-4 right-4">
            <ProductBadge type="coming-soon" />
          </div>
        )}

        {!product.available && !product.promotion && (
          <div className="absolute bottom-4 right-4">
            <ProductBadge type="out-of-stock" />
          </div>
        )}
      </Link>

      {/* Product Info */}
      <div className="flex flex-col flex-grow p-6">
        <Link href={`/products/${product.slug}`}>
          <h3 className="text-2xl font-bold text-primary mb-2 hover:text-secondary transition-colors font-serif">
            {name}
          </h3>
        </Link>

        <p className="text-muted mb-4 flex-grow">
          {shortDesc}
        </p>

        <div className="text-2xl font-bold text-secondary mb-4">
          {getDisplayPrice()}
        </div>

        {/* Add to Cart Button */}
        {product.available ? (
          <button
            onClick={handleAddToCartClick}
            disabled={isAdding}
            className="w-full bg-primary text-white px-6 py-3 font-semibold hover:bg-primary/90 transition-all mb-2 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {justAdded ? (
              <>
                <Check className="h-5 w-5" />
                <span>{currentLang === 'vi' ? 'Đã thêm!' : 'Added!'}</span>
              </>
            ) : (
              <>
                <ShoppingCart className="h-5 w-5" />
                <span>{currentLang === 'vi' ? 'Thêm vào giỏ hàng' : 'Add to Cart'}</span>
              </>
            )}
          </button>
        ) : product.slug === 'banh-bong-lan-trung-muoi' ? (
          <Link
            href="/preorderBLTM"
            className="w-full bg-amber-600 text-white px-6 py-3 font-semibold hover:bg-amber-700 transition-colors mb-2 flex items-center justify-center gap-2"
          >
            {currentLang === 'vi' ? 'Pre-Order ngay' : 'Pre-Order Now'}
          </Link>
        ) : product.promotion ? (
          <button
            disabled
            className="w-full bg-amber-600 text-white px-6 py-3 font-semibold opacity-80 cursor-not-allowed mb-2"
          >
            {currentLang === 'vi' ? 'Sắp ra mắt' : 'Coming Soon'}
          </button>
        ) : (
          <button
            disabled
            className="w-full bg-gray-300 text-primary px-6 py-3 font-semibold opacity-60 cursor-not-allowed mb-2"
          >
            {currentLang === 'vi' ? 'Tạm hết hàng' : 'Out of stock'}
          </button>
        )}

        {/* View Details Link */}
        <Link
          href={`/products/${product.slug}`}
          className="block w-full text-center border border-primary/20 text-primary px-6 py-3 font-semibold hover:bg-primary/5 transition-colors"
        >
          {currentLang === 'vi' ? 'Chi tiết' : 'View Details'}
        </Link>
      </div>
    </div>
  );
}
