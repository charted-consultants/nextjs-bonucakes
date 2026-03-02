/**
 * Cart Page
 * Shopping cart with item list, quantity adjustment, and order summary
 */

'use client';

import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import { useLanguage } from '@/components/LanguageToggle';
import { useCartStore, useCartItems } from '@/lib/stores/cart-store';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CartItem from '@/components/CartItem';
import OrderSummary from '@/components/OrderSummary';

export default function CartPage() {
  const currentLang = useLanguage();
  const items = useCartItems();
  const { updateQuantity, removeItem } = useCartStore();

  const translations = {
    title: { vi: 'Giỏ hàng', en: 'Shopping Cart' },
    subtitle: {
      vi: 'Xem lại đơn hàng của bạn trước khi thanh toán',
      en: 'Review your order before checkout',
    },
    emptyTitle: { vi: 'Giỏ hàng trống', en: 'Cart is empty' },
    emptyMessage: {
      vi: 'Chưa có sản phẩm nào trong giỏ hàng',
      en: 'No products in cart yet',
    },
    continueShopping: { vi: 'Tiếp tục mua sắm', en: 'Continue Shopping' },
  };

  const isEmpty = items.length === 0;

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-cream">
        {/* Hero Section */}
        <header className="relative bg-warmwhite pt-32 pb-16 border-b border-espresso/10">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-espresso mb-4 font-serif">
            {translations.title[currentLang]}
          </h1>
          <p className="text-lg text-coffee">{translations.subtitle[currentLang]}</p>
        </div>
      </header>

      {/* Cart Content */}
      <section className="py-16 bg-cream">
        <div className="max-w-6xl mx-auto px-6">
          {/* Empty Cart Message */}
          {isEmpty && (
            <div className="text-center py-12">
              <ShoppingCart className="h-24 w-24 mx-auto text-coffee/30 mb-4" strokeWidth={1} />
              <h2 className="text-2xl font-bold text-espresso mb-2 font-serif">
                {translations.emptyTitle[currentLang]}
              </h2>
              <p className="text-coffee mb-6">{translations.emptyMessage[currentLang]}</p>
              <Link
                href="/products"
                className="inline-block bg-terracotta text-white px-8 py-3 font-semibold hover:bg-terracotta/90 transition-colors"
              >
                {translations.continueShopping[currentLang]}
              </Link>
            </div>
          )}

          {/* Cart Items */}
          {!isEmpty && (
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Items List */}
              <div className="lg:col-span-2">
                <div className="space-y-4">
                  {items.map((item) => (
                    <CartItem
                      key={item.productId}
                      item={item}
                      onUpdateQuantity={updateQuantity}
                      onRemove={removeItem}
                    />
                  ))}
                </div>
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <OrderSummary showCheckoutButton showContinueShopping />
              </div>
            </div>
          )}
        </div>
      </section>
      </div>
      <Footer />
    </>
  );
}
