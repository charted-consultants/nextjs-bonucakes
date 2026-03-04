'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe, Stripe } from '@stripe/stripe-js';
import { useLanguage } from '@/components/LanguageToggle';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { PaymentForm } from '@/components/PaymentForm';

let stripePromise: Promise<Stripe | null> | null = null;

function getStripePromise() {
  if (!stripePromise) {
    stripePromise = fetch('/api/config')
      .then((res) => res.json())
      .then((data) => {
        if (!data.stripePublishableKey) {
          throw new Error('Stripe publishable key not configured');
        }
        return loadStripe(data.stripePublishableKey);
      })
      .catch((error) => {
        console.error('Failed to load Stripe:', error);
        return null;
      });
  }
  return stripePromise;
}

function PaymentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentLang = useLanguage();
  const orderId = searchParams.get('orderId');
  const orderCode = searchParams.get('code');

  const [stripe, setStripe] = useState<Stripe | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalAmount, setTotalAmount] = useState<number>(0);

  const translations = {
    title: { vi: 'Thanh toán', en: 'Payment' },
    subtitle: { vi: 'Hoàn tất thanh toán của bạn', en: 'Complete your payment' },
    loading: { vi: 'Đang tải...', en: 'Loading...' },
    paymentDetails: { vi: 'Thông tin thanh toán', en: 'Payment Details' },
    orderSummary: { vi: 'Đơn hàng', en: 'Order Summary' },
    orderNumber: { vi: 'Mã đơn hàng', en: 'Order Number' },
    total: { vi: 'Tổng cộng', en: 'Total' },
    errorTitle: { vi: 'Có lỗi xảy ra', en: 'Error Occurred' },
    noOrderId: {
      vi: 'Không tìm thấy mã đơn hàng',
      en: 'Order ID not found',
    },
    paymentLoadError: {
      vi: 'Không thể tải thông tin thanh toán. Vui lòng thử lại.',
      en: 'Failed to load payment information. Please try again.',
    },
    backToHome: { vi: 'Quay về trang chủ', en: 'Back to Home' },
  };

  useEffect(() => {
    if (!orderId) {
      setError(translations.noOrderId[currentLang]);
      setLoading(false);
      return;
    }

    // Load Stripe
    getStripePromise().then((stripeInstance) => {
      setStripe(stripeInstance);
    });

    // Create payment intent
    fetch(`/api/orders/${orderId}/payment`, {
      method: 'POST',
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.clientSecret) {
          setClientSecret(data.clientSecret);
        } else {
          throw new Error('Failed to create payment intent');
        }
      })
      .catch((err) => {
        console.error('Payment setup error:', err);
        setError(translations.paymentLoadError[currentLang]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [orderId, currentLang]);

  const handlePaymentSuccess = () => {
    router.push(`/order-success?orderId=${orderId}&code=${orderCode}`);
  };

  const handlePaymentError = (message: string) => {
    setError(message);
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-cream">
        {/* Hero Section */}
        <header className="relative bg-warmwhite pt-32 pb-16 border-b border-espresso/10">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-espresso mb-4 font-serif">
              {translations.title[currentLang]}
            </h1>
            <p className="text-lg text-coffee">
              {translations.subtitle[currentLang]}
            </p>
          </div>
        </header>

        {/* Payment Content */}
        <section className="py-16 bg-cream">
          <div className="max-w-2xl mx-auto px-6">
            {loading && (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-terracotta mx-auto mb-4"></div>
                <p className="text-coffee">{translations.loading[currentLang]}</p>
              </div>
            )}

            {error && (
              <div className="bg-warmwhite border border-terracotta/30 p-8 rounded">
                <h2 className="text-2xl font-bold text-espresso mb-4 font-serif">
                  {translations.errorTitle[currentLang]}
                </h2>
                <p className="text-coffee mb-6">{error}</p>
                <a
                  href="/"
                  className="inline-block bg-terracotta text-white px-8 py-3 font-semibold hover:bg-terracotta/90 transition-colors"
                >
                  {translations.backToHome[currentLang]}
                </a>
              </div>
            )}

            {!loading && !error && clientSecret && stripe && (
              <div className="bg-white border border-espresso/10 p-8 rounded">
                {orderCode && (
                  <div className="mb-6 pb-6 border-b border-espresso/10">
                    <div className="flex justify-between items-center">
                      <span className="text-coffee">
                        {translations.orderNumber[currentLang]}
                      </span>
                      <span className="font-bold text-espresso text-xl">
                        #{orderCode}
                      </span>
                    </div>
                  </div>
                )}

                <h2 className="text-2xl font-bold text-espresso mb-6 font-serif">
                  {translations.paymentDetails[currentLang]}
                </h2>

                <Elements
                  stripe={stripe}
                  options={{
                    clientSecret: clientSecret,
                    appearance: {
                      theme: 'stripe',
                      variables: {
                        colorPrimary: '#D4734C',
                        colorBackground: '#FFFFFF',
                        colorText: '#3E2723',
                        colorDanger: '#D32F2F',
                        fontFamily: 'system-ui, sans-serif',
                        borderRadius: '4px',
                      },
                    },
                  }}
                >
                  <PaymentForm
                    totalAmount={totalAmount}
                    onSuccess={handlePaymentSuccess}
                    onError={handlePaymentError}
                  />
                </Elements>
              </div>
            )}
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PaymentContent />
    </Suspense>
  );
}
