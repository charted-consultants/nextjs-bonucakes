/**
 * OrderSummary Component
 * Order summary sidebar showing totals, shipping, and promotions
 */

'use client';

import Link from 'next/link';
import { useLanguage } from './LanguageToggle';
import { useCartItems, useCartTotals, useCartPromotions } from '@/lib/stores/cart-store';

interface OrderSummaryProps {
  showCheckoutButton?: boolean;
  showContinueShopping?: boolean;
  showItems?: boolean;
  onSubmit?: () => void;
  isSubmitting?: boolean;
  submitButtonText?: string;
  checkoutFormId?: string;
}

export default function OrderSummary({
  showCheckoutButton = true,
  showContinueShopping = true,
  showItems = false,
  onSubmit,
  isSubmitting = false,
  submitButtonText,
  checkoutFormId,
}: OrderSummaryProps) {
  const currentLang = useLanguage();
  const items = useCartItems();
  const { subtotal, shipping, total } = useCartTotals();
  const promotions = useCartPromotions();

  const translations = {
    title: { vi: 'Tổng đơn hàng', en: 'Order Summary' },
    titleCheckout: { vi: 'Đơn hàng của bạn', en: 'Your Order' },
    subtotal: { vi: 'Thành tiền', en: 'Subtotal' },
    shipping: { vi: 'Phí giao hàng (Nội địa UK)', en: 'Shipping (UK Mainland)' },
    total: { vi: 'Tổng cộng', en: 'Total' },
    promotions: { vi: 'Khuyến mãi', en: 'Promotions' },
    free: { vi: 'miễn phí', en: 'free' },
    proceedToCheckout: { vi: 'Tiến hành thanh toán', en: 'Proceed to Checkout' },
    continueShopping: { vi: 'Tiếp tục mua sắm', en: 'Continue Shopping' },
    placeOrder: { vi: 'Đặt hàng', en: 'Place Order' },
    backToCart: { vi: 'Quay lại giỏ hàng', en: 'Back to Cart' },
  };

  const title = showCheckoutButton ? translations.title : translations.titleCheckout;

  return (
    <div className="bg-white border border-espresso/10 p-6 sticky top-24">
      <h2 className="text-2xl font-bold text-espresso mb-6">{title[currentLang]}</h2>

      {/* Order Items List (only show in checkout) */}
      {showItems && items.length > 0 && (
        <div className="space-y-4 mb-6 pb-6 border-b border-espresso/10">
          {items.map((item) => {
            const itemName = currentLang === 'vi' ? item.productName.vi : item.productName.en;
            const unit = currentLang === 'vi' ? item.unitVi : item.unitEn;
            const freeItems = Math.floor(item.quantity / 10);

            // Format price display
            const formatPrice = () => {
              const amount = Number(item.unitPrice || 0);
              if (amount > 0 && unit) {
                return `£${amount} / ${unit}`;
              }
              const localizedDisplay =
                currentLang === 'vi'
                  ? item.displayPriceVi || item.displayPrice
                  : item.displayPrice || item.displayPriceVi;
              if (localizedDisplay) return localizedDisplay;
              return amount > 0 ? `£${amount}` : '';
            };

            return (
              <div key={item.productId} className="flex justify-between text-sm">
                <div className="flex-grow">
                  <p className="font-semibold text-espresso">
                    {item.quantity}x {itemName} {unit && `(${unit})`}
                  </p>
                  {freeItems > 0 && (
                    <p className="text-xs text-gold">
                      {currentLang === 'vi' ? 'Tặng' : 'Free'}: +{freeItems}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="font-semibold text-terracotta">{formatPrice()}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Totals */}
      <div className="space-y-4 mb-6">
        <div className="flex justify-between text-coffee">
          <span>{translations.subtotal[currentLang]}</span>
          <span>£{subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-coffee">
          <span>{translations.shipping[currentLang]}</span>
          <span>£{shipping.toFixed(2)}</span>
        </div>
        <div className="border-t border-espresso/10 pt-4">
          <div className="flex justify-between text-lg font-bold text-espresso">
            <span>{translations.total[currentLang]}</span>
            <span>£{total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Promotions */}
      {promotions.length > 0 && (
        <div className="mb-6">
          <div className="bg-gold/10 border border-gold/30 p-4 rounded">
            <p className="text-sm font-semibold text-espresso mb-2">
              {translations.promotions[currentLang]}
            </p>
            <div className="text-sm text-coffee space-y-1">
              {promotions.map((promo) => {
                const productName =
                  currentLang === 'vi' ? promo.productName.vi : promo.productName.en;
                return (
                  <p key={promo.productId}>
                    + {promo.freeItems} {translations.free[currentLang]} {productName}
                  </p>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      {showCheckoutButton && (
        <>
          <Link
            href="/checkout"
            className="block w-full text-center bg-terracotta text-white px-6 py-4 font-semibold hover:bg-terracotta/90 transition-colors mb-4"
          >
            {translations.proceedToCheckout[currentLang]}
          </Link>
          {showContinueShopping && (
            <Link
              href="/products"
              className="block w-full text-center border border-espresso/20 text-espresso px-6 py-3 font-semibold hover:bg-espresso/5 transition-colors"
            >
              {translations.continueShopping[currentLang]}
            </Link>
          )}
        </>
      )}

      {/* Checkout Form Submit */}
      {!showCheckoutButton && (
        <>
          <button
            type="submit"
            form={checkoutFormId}
            onClick={onSubmit}
            disabled={isSubmitting}
            className="w-full bg-terracotta text-white px-6 py-4 font-semibold hover:bg-terracotta/90 transition-colors mb-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting
              ? currentLang === 'vi'
                ? 'Đang xử lý...'
                : 'Processing...'
              : submitButtonText || translations.placeOrder[currentLang]}
          </button>
          <Link
            href="/cart"
            className="block w-full text-center border border-espresso/20 text-espresso px-6 py-3 font-semibold hover:bg-espresso/5 transition-colors"
          >
            {translations.backToCart[currentLang]}
          </Link>
        </>
      )}
    </div>
  );
}
