'use client';

import { useState } from 'react';
import {
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { useLanguage } from './LanguageToggle';

interface PaymentFormProps {
  totalAmount: number;
  onSuccess: () => void;
  onError: (message: string) => void;
}

export function PaymentForm({
  totalAmount,
  onSuccess,
  onError,
}: PaymentFormProps) {
  const currentLang = useLanguage();
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);

  const translations = {
    payButton: { vi: 'Thanh toán', en: 'Pay' },
    processing: { vi: 'Đang xử lý...', en: 'Processing...' },
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/order-success`,
      },
      redirect: 'if_required',
    });

    if (error) {
      onError(error.message || 'Payment failed');
      setIsProcessing(false);
    } else {
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      <button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full bg-terracotta text-white px-6 py-4 font-semibold hover:bg-terracotta/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isProcessing
          ? translations.processing[currentLang]
          : `${translations.payButton[currentLang]} - £${totalAmount.toFixed(2)}`}
      </button>
    </form>
  );
}
