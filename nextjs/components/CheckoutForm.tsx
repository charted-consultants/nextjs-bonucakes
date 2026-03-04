/**
 * CheckoutForm Component
 * Checkout form with React Hook Form validation
 */

'use client';

import { useForm } from 'react-hook-form';
import { useLanguage } from './LanguageToggle';

export interface CheckoutFormData {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  deliveryAddress: string;
  specialNotes?: string;
  paymentMethod: 'bank_transfer' | 'stripe';
}

interface CheckoutFormProps {
  onSubmit: (data: CheckoutFormData) => Promise<void>;
  isSubmitting: boolean;
  formId?: string;
}

export default function CheckoutForm({ onSubmit, isSubmitting, formId = 'checkout-form' }: CheckoutFormProps) {
  const currentLang = useLanguage();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutFormData>({
    defaultValues: {
      paymentMethod: 'stripe',
    },
  });

  const translations = {
    title: { vi: 'Thông tin khách hàng', en: 'Customer Information' },
    fullName: { vi: 'Họ và tên', en: 'Full Name' },
    fullNamePlaceholder: { vi: 'John Smith', en: 'John Smith' },
    email: { vi: 'Email', en: 'Email' },
    emailPlaceholder: { vi: 'example@email.com', en: 'example@email.com' },
    phone: { vi: 'Số điện thoại', en: 'Phone Number' },
    phonePlaceholder: { vi: '07123 456789', en: '07123 456789' },
    deliveryAddress: { vi: 'Địa chỉ giao hàng', en: 'Delivery Address' },
    deliveryAddressPlaceholder: {
      vi: '221B Baker Street, London NW1 6XE',
      en: '221B Baker Street, London NW1 6XE',
    },
    specialNotes: { vi: 'Ghi chú đặc biệt', en: 'Special Notes' },
    specialNotesPlaceholder: {
      vi: 'Hướng dẫn giao hàng (ví dụ: bấm chuông, để lại cho hàng xóm)',
      en: 'Delivery instructions (e.g., ring doorbell, leave with neighbour)',
    },
    required: { vi: 'Trường này là bắt buộc', en: 'This field is required' },
    invalidEmail: { vi: 'Email không hợp lệ', en: 'Invalid email address' },
    processing: { vi: 'Đang xử lý đơn hàng...', en: 'Processing order...' },
    paymentMethod: { vi: 'Phương thức thanh toán', en: 'Payment Method' },
    stripe: { vi: 'Thanh toán bằng thẻ (Stripe)', en: 'Card Payment (Stripe)' },
    bankTransfer: { vi: 'Chuyển khoản ngân hàng', en: 'Bank Transfer' },
  };

  return (
    <div className="bg-white border border-espresso/10 p-6">
      <h2 className="text-2xl font-bold text-espresso mb-6">
        {translations.title[currentLang]}
      </h2>

      <form id={formId} onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Full Name */}
        <div>
          <label className="block text-coffee font-semibold mb-2">
            {translations.fullName[currentLang]} <span className="text-terracotta">*</span>
          </label>
          <input
            type="text"
            {...register('customerName', {
              required: translations.required[currentLang],
            })}
            className={`w-full border ${
              errors.customerName ? 'border-terracotta' : 'border-espresso/20'
            } px-4 py-3 focus:outline-none focus:border-terracotta`}
            placeholder={translations.fullNamePlaceholder[currentLang]}
            disabled={isSubmitting}
          />
          {errors.customerName && (
            <p className="text-terracotta text-sm mt-1">{errors.customerName.message}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="block text-coffee font-semibold mb-2">
            {translations.email[currentLang]} <span className="text-terracotta">*</span>
          </label>
          <input
            type="email"
            {...register('customerEmail', {
              required: translations.required[currentLang],
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: translations.invalidEmail[currentLang],
              },
            })}
            className={`w-full border ${
              errors.customerEmail ? 'border-terracotta' : 'border-espresso/20'
            } px-4 py-3 focus:outline-none focus:border-terracotta`}
            placeholder={translations.emailPlaceholder[currentLang]}
            disabled={isSubmitting}
          />
          {errors.customerEmail && (
            <p className="text-terracotta text-sm mt-1">{errors.customerEmail.message}</p>
          )}
        </div>

        {/* Phone */}
        <div>
          <label className="block text-coffee font-semibold mb-2">
            {translations.phone[currentLang]} <span className="text-terracotta">*</span>
          </label>
          <input
            type="tel"
            {...register('customerPhone', {
              required: translations.required[currentLang],
            })}
            className={`w-full border ${
              errors.customerPhone ? 'border-terracotta' : 'border-espresso/20'
            } px-4 py-3 focus:outline-none focus:border-terracotta`}
            placeholder={translations.phonePlaceholder[currentLang]}
            disabled={isSubmitting}
          />
          {errors.customerPhone && (
            <p className="text-terracotta text-sm mt-1">{errors.customerPhone.message}</p>
          )}
        </div>

        {/* Delivery Address */}
        <div>
          <label className="block text-coffee font-semibold mb-2">
            {translations.deliveryAddress[currentLang]} <span className="text-terracotta">*</span>
          </label>
          <textarea
            {...register('deliveryAddress', {
              required: translations.required[currentLang],
            })}
            rows={3}
            className={`w-full border ${
              errors.deliveryAddress ? 'border-terracotta' : 'border-espresso/20'
            } px-4 py-3 focus:outline-none focus:border-terracotta`}
            placeholder={translations.deliveryAddressPlaceholder[currentLang]}
            disabled={isSubmitting}
          />
          {errors.deliveryAddress && (
            <p className="text-terracotta text-sm mt-1">{errors.deliveryAddress.message}</p>
          )}
        </div>

        {/* Payment Method */}
        <div>
          <label className="block text-coffee font-semibold mb-2">
            {translations.paymentMethod[currentLang]} <span className="text-terracotta">*</span>
          </label>
          <div className="space-y-3">
            <label className="flex items-center p-4 border border-espresso/20 cursor-pointer hover:bg-cream transition-colors">
              <input
                type="radio"
                value="stripe"
                {...register('paymentMethod', { required: true })}
                className="mr-3"
                disabled={isSubmitting}
              />
              <span className="text-espresso">{translations.stripe[currentLang]}</span>
            </label>
            <label className="flex items-center p-4 border border-espresso/20 cursor-pointer hover:bg-cream transition-colors">
              <input
                type="radio"
                value="bank_transfer"
                {...register('paymentMethod', { required: true })}
                className="mr-3"
                disabled={isSubmitting}
              />
              <span className="text-espresso">{translations.bankTransfer[currentLang]}</span>
            </label>
          </div>
        </div>

        {/* Special Notes */}
        <div>
          <label className="block text-coffee font-semibold mb-2">
            {translations.specialNotes[currentLang]}
          </label>
          <textarea
            {...register('specialNotes')}
            rows={3}
            className="w-full border border-espresso/20 px-4 py-3 focus:outline-none focus:border-terracotta"
            placeholder={translations.specialNotesPlaceholder[currentLang]}
            disabled={isSubmitting}
          />
        </div>

        {/* Loading Message */}
        {isSubmitting && (
          <div className="bg-gold/10 border border-gold text-espresso px-4 py-3 rounded">
            <p className="font-semibold">{translations.processing[currentLang]}</p>
          </div>
        )}
      </form>
    </div>
  );
}
