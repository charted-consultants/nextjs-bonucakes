/**
 * Checkout Page
 * Checkout form with order summary and payment instructions
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useLanguage } from '@/components/LanguageToggle';
import { useCartStore, useCartItems, useCartTotals } from '@/lib/stores/cart-store';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CheckoutForm, { type CheckoutFormData } from '@/components/CheckoutForm';
import OrderSummary from '@/components/OrderSummary';

export default function CheckoutPage() {
  const router = useRouter();
  const currentLang = useLanguage();
  const items = useCartItems();
  const { subtotal, shipping, total } = useCartTotals();
  const { getCartForAPI, clearCart } = useCartStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const translations = {
    title: { vi: 'Thanh toán', en: 'Checkout' },
    subtitle: {
      vi: 'Hoàn tất thông tin để đặt hàng',
      en: 'Complete your order information',
    },
    emptyTitle: { vi: 'Giỏ hàng trống', en: 'Cart is empty' },
    emptyMessage: {
      vi: 'Vui lòng thêm sản phẩm vào giỏ hàng trước khi thanh toán',
      en: 'Please add products to cart before checkout',
    },
    viewProducts: { vi: 'Xem sản phẩm', en: 'View Products' },
    orderItems: { vi: 'Đơn hàng của bạn', en: 'Your Order' },
    errorOccurred: {
      vi: 'Có lỗi xảy ra. Vui lòng thử lại hoặc liên hệ trực tiếp với Bếp Bà Bo.',
      en: 'An error occurred. Please try again or contact us directly.',
    },
  };

  // Redirect if cart is empty
  useEffect(() => {
    if (items.length === 0) {
      // Don't redirect on initial load, let the empty state show
    }
  }, [items.length]);

  const isEmpty = items.length === 0;

  // Generate short order code from order ID
  const shortCodeFrom = (id: string): string => {
    if (!id) return String(Math.floor(Math.random() * 10000)).padStart(4, '0');
    let h = 5381;
    for (let i = 0; i < id.length; i++) {
      h = ((h << 5) + h) + id.charCodeAt(i);
    }
    const n = Math.abs(h >>> 0) % 10000;
    return String(n).padStart(4, '0');
  };

  const handleSubmit = async (formData: CheckoutFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const cartItems = getCartForAPI();

      const orderData = {
        customerName: formData.customerName,
        customerEmail: formData.customerEmail,
        customerPhone: formData.customerPhone,
        deliveryAddress: formData.deliveryAddress,
        specialNotes: formData.specialNotes || '',
        items: cartItems,
        pricing: {
          currency: 'GBP',
          subtotal,
          shippingFee: shipping,
          total,
          shippingLabel: 'UK Mainland',
        },
      };

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // Clear cart
        clearCart();

        // Use orderCode from response if available, otherwise generate from orderId
        const shortCode = result.orderCode || shortCodeFrom(result.orderId);

        // Redirect to success page
        router.push(`/order-success?orderId=${encodeURIComponent(result.orderId)}&code=${shortCode}`);
      } else {
        console.error('API error response:', result);
        throw new Error(result.error || result.message || 'Order failed');
      }
    } catch (err) {
      console.error('Order submission error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(`${translations.errorOccurred[currentLang]} (${errorMessage})`);
      setIsSubmitting(false);
    }
  };

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

      {/* Checkout Content */}
      <section className="py-16 bg-cream">
        <div className="max-w-6xl mx-auto px-6">
          {/* Empty Cart Warning */}
          {isEmpty && (
            <div className="text-center py-12">
              <div className="bg-warmwhite border border-terracotta/30 p-8 rounded max-w-2xl mx-auto">
                <h2 className="text-2xl font-bold text-espresso mb-4 font-serif">
                  {translations.emptyTitle[currentLang]}
                </h2>
                <p className="text-coffee mb-6">{translations.emptyMessage[currentLang]}</p>
                <Link
                  href="/products"
                  className="inline-block bg-terracotta text-white px-8 py-3 font-semibold hover:bg-terracotta/90 transition-colors"
                >
                  {translations.viewProducts[currentLang]}
                </Link>
              </div>
            </div>
          )}

          {/* Checkout Form */}
          {!isEmpty && (
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Customer Information Form */}
              <div className="lg:col-span-2">
                <CheckoutForm
                  onSubmit={handleSubmit}
                  isSubmitting={isSubmitting}
                  formId="checkout-form"
                />

                {/* Error Message */}
                {error && (
                  <div className="mt-4 bg-terracotta/10 border border-terracotta text-terracotta px-4 py-3 rounded">
                    <p>{error}</p>
                  </div>
                )}
              </div>

              {/* Order Summary with Submit Button */}
              <div className="lg:col-span-1">
                <OrderSummary
                  showCheckoutButton={false}
                  showContinueShopping={false}
                  showItems={true}
                  isSubmitting={isSubmitting}
                  checkoutFormId="checkout-form"
                />
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
