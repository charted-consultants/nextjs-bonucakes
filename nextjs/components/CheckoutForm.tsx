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
  deliveryCity?: string;
  deliveryPostcode?: string;
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
      paymentMethod: 'bank_transfer',
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
    deliveryAddress: { vi: 'Địa chỉ giao hàng', en: 'Street Address' },
    deliveryAddressPlaceholder: {
      vi: '221B Baker Street',
      en: '221B Baker Street',
    },
    deliveryCity: { vi: 'Thành phố', en: 'City' },
    deliveryCityPlaceholder: { vi: 'London', en: 'London' },
    deliveryPostcode: { vi: 'Mã bưu chính', en: 'Postcode' },
    deliveryPostcodePlaceholder: { vi: 'NW1 6XE', en: 'NW1 6XE' },
    specialNotes: { vi: 'Ghi chú đặc biệt', en: 'Special Notes' },
    specialNotesPlaceholder: {
      vi: 'Hướng dẫn giao hàng (ví dụ: bấm chuông, để lại cho hàng xóm)',
      en: 'Delivery instructions (e.g., ring doorbell, leave with neighbour)',
    },
    required: { vi: 'Trường này là bắt buộc', en: 'This field is required' },
    invalidEmail: { vi: 'Email không hợp lệ', en: 'Invalid email address' },
    processing: { vi: 'Đang xử lý đơn hàng...', en: 'Processing order...' },
    paymentMethod: { vi: 'Phương thức thanh toán', en: 'Payment Method' },
    stripe: { vi: 'Thanh toán bằng thẻ', en: 'Card Payment' },
    stripeUnavailable: { vi: 'Sắp có', en: 'Coming soon' },
    bankTransfer: { vi: 'Chuyển khoản ngân hàng', en: 'Bank Transfer' },
  };

  return (
    <div className="bg-white border border-primary/10 p-6">
      <h2 className="text-2xl font-bold text-primary mb-6">
        {translations.title[currentLang]}
      </h2>

      <form id={formId} onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Full Name */}
        <div>
          <label className="block text-muted font-semibold mb-2">
            {translations.fullName[currentLang]} <span className="text-secondary">*</span>
          </label>
          <input
            type="text"
            {...register('customerName', {
              required: translations.required[currentLang],
            })}
            className={`w-full border ${
              errors.customerName ? 'border-secondary' : 'border-primary/20'
            } px-4 py-3 focus:outline-none focus:border-secondary`}
            placeholder={translations.fullNamePlaceholder[currentLang]}
            disabled={isSubmitting}
          />
          {errors.customerName && (
            <p className="text-secondary text-sm mt-1">{errors.customerName.message}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="block text-muted font-semibold mb-2">
            {translations.email[currentLang]} <span className="text-secondary">*</span>
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
              errors.customerEmail ? 'border-secondary' : 'border-primary/20'
            } px-4 py-3 focus:outline-none focus:border-secondary`}
            placeholder={translations.emailPlaceholder[currentLang]}
            disabled={isSubmitting}
          />
          {errors.customerEmail && (
            <p className="text-secondary text-sm mt-1">{errors.customerEmail.message}</p>
          )}
        </div>

        {/* Phone */}
        <div>
          <label className="block text-muted font-semibold mb-2">
            {translations.phone[currentLang]} <span className="text-secondary">*</span>
          </label>
          <input
            type="tel"
            {...register('customerPhone', {
              required: translations.required[currentLang],
            })}
            className={`w-full border ${
              errors.customerPhone ? 'border-secondary' : 'border-primary/20'
            } px-4 py-3 focus:outline-none focus:border-secondary`}
            placeholder={translations.phonePlaceholder[currentLang]}
            disabled={isSubmitting}
          />
          {errors.customerPhone && (
            <p className="text-secondary text-sm mt-1">{errors.customerPhone.message}</p>
          )}
        </div>

        {/* Delivery Address */}
        <div>
          <label className="block text-muted font-semibold mb-2">
            {translations.deliveryAddress[currentLang]} <span className="text-secondary">*</span>
          </label>
          <textarea
            {...register('deliveryAddress', {
              required: translations.required[currentLang],
            })}
            rows={2}
            className={`w-full border ${
              errors.deliveryAddress ? 'border-secondary' : 'border-primary/20'
            } px-4 py-3 focus:outline-none focus:border-secondary`}
            placeholder={translations.deliveryAddressPlaceholder[currentLang]}
            disabled={isSubmitting}
          />
          {errors.deliveryAddress && (
            <p className="text-secondary text-sm mt-1">{errors.deliveryAddress.message}</p>
          )}
        </div>

        {/* City and Postcode Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* City */}
          <div>
            <label className="block text-muted font-semibold mb-2">
              {translations.deliveryCity[currentLang]}
            </label>
            <input
              type="text"
              {...register('deliveryCity')}
              className="w-full border border-primary/20 px-4 py-3 focus:outline-none focus:border-secondary"
              placeholder={translations.deliveryCityPlaceholder[currentLang]}
              disabled={isSubmitting}
            />
          </div>

          {/* Postcode */}
          <div>
            <label className="block text-muted font-semibold mb-2">
              {translations.deliveryPostcode[currentLang]}
            </label>
            <input
              type="text"
              {...register('deliveryPostcode')}
              className="w-full border border-primary/20 px-4 py-3 focus:outline-none focus:border-secondary"
              placeholder={translations.deliveryPostcodePlaceholder[currentLang]}
              disabled={isSubmitting}
            />
          </div>
        </div>

        {/* Payment Method */}
        <div>
          <label className="block text-muted font-semibold mb-2">
            {translations.paymentMethod[currentLang]} <span className="text-secondary">*</span>
          </label>
          <div className="space-y-3">
            <label className="flex items-center justify-between p-4 border border-primary/10 bg-primary/5 cursor-not-allowed opacity-50 select-none">
              <div className="flex items-center">
                <input
                  type="radio"
                  value="stripe"
                  className="mr-3"
                  disabled={true}
                />
                <span className="text-primary/60">{translations.stripe[currentLang]}</span>
              </div>
              <span className="text-xs text-muted border border-primary/20 px-2 py-0.5 rounded">
                {translations.stripeUnavailable[currentLang]}
              </span>
            </label>
            <label className="flex items-center p-4 border border-primary/20 cursor-pointer hover:bg-light transition-colors">
              <input
                type="radio"
                value="bank_transfer"
                {...register('paymentMethod', { required: true })}
                className="mr-3"
                disabled={isSubmitting}
              />
              <span className="text-primary">{translations.bankTransfer[currentLang]}</span>
            </label>
          </div>
        </div>

        {/* Special Notes */}
        <div>
          <label className="block text-muted font-semibold mb-2">
            {translations.specialNotes[currentLang]}
          </label>
          <textarea
            {...register('specialNotes')}
            rows={3}
            className="w-full border border-primary/20 px-4 py-3 focus:outline-none focus:border-secondary"
            placeholder={translations.specialNotesPlaceholder[currentLang]}
            disabled={isSubmitting}
          />
        </div>

        {/* Loading Message */}
        {isSubmitting && (
          <div className="bg-secondary/10 border border-secondary text-primary px-4 py-3 rounded">
            <p className="font-semibold">{translations.processing[currentLang]}</p>
          </div>
        )}
      </form>
    </div>
  );
}
