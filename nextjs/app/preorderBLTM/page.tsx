'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useLanguage } from '@/components/LanguageToggle';

export default function PreorderBLTMPage() {
  const lang = useLanguage();
  const [form, setForm] = useState({ name: '', location: '', phone: '', email: '', quantity: 1, note: '' });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const t = {
    tag: lang === 'vi' ? 'Pre-Order' : 'Pre-Order',
    title: 'Bánh Bông Lan Trứng Muối',
    subtitle:
      lang === 'vi'
        ? 'Cốt bánh mềm mịn tan trong miệng, trứng muối nướng bùi thơm, chà bông chuẩn, 4 loại sốt đặc biệt. Đặt trước để không bỏ lỡ mẻ đầu tiên!'
        : 'Soft sponge cake, roasted salted egg, premium pork floss, 4 special sauces. Pre-order now to be first in line!',
    price: '£40 / cái',
    name: lang === 'vi' ? 'Họ và tên' : 'Full name',
    location: lang === 'vi' ? 'Địa chỉ' : 'Address',
    phone: lang === 'vi' ? 'Số điện thoại' : 'Phone number',
    email: 'Email',
    quantity: lang === 'vi' ? 'Số lượng muốn đặt' : 'Quantity',
    note: lang === 'vi' ? 'Ghi chú / yêu cầu thêm' : 'Notes / special requests',
    notePlaceholder: lang === 'vi' ? 'Ngày nhận hàng mong muốn, địa chỉ giao hàng chi tiết...' : 'Preferred delivery date, detailed address...',
    submit: lang === 'vi' ? 'Gửi Pre-Order' : 'Submit Pre-Order',
    submitting: lang === 'vi' ? 'Đang gửi...' : 'Sending...',
    successTitle: lang === 'vi' ? 'Đặt trước thành công! 🌿' : 'Pre-Order Received! 🌿',
    successMsg:
      lang === 'vi'
        ? 'Cảm ơn bạn đã tin tưởng Bonu. Bonu sẽ liên hệ xác nhận trong 1–2 ngày nhé!'
        : 'Thank you for trusting Bonu. We will confirm your order within 1–2 days!',
    total: lang === 'vi' ? 'Tổng tạm tính' : 'Estimated total',
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const val = e.target.name === 'quantity' ? Number(e.target.value) : e.target.value;
    setForm((prev) => ({ ...prev, [e.target.name]: val }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMsg('');
    try {
      const res = await fetch('/api/preorder-bltm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, quantity: Number(form.quantity) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Có lỗi xảy ra.');
      setStatus('success');
    } catch (err: any) {
      setErrorMsg(err.message);
      setStatus('error');
    }
  };

  const inputClass =
    'w-full border border-primary/20 rounded-lg px-4 py-3 text-primary placeholder-muted focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary bg-white transition';

  return (
    <div className="min-h-screen bg-light">
      {/* Hero */}
      <header className="bg-light pt-32 pb-12 border-b border-primary/10">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <span className="inline-block bg-amber-600 text-white text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full mb-4">
            {t.tag}
          </span>
          <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4 font-serif">{t.title}</h1>
          <p className="text-lg text-muted mb-4">{t.subtitle}</p>
          <p className="text-2xl font-bold text-secondary">{t.price}</p>
        </div>
      </header>

      {/* Product image strip */}
      <div className="relative h-56 md:h-72 w-full overflow-hidden">
        <Image
          src="https://static.bonucakes.com/products/banh-bong-lan-trung-muoi.jpg"
          alt="Bánh Bông Lan Trứng Muối"
          fill
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-primary/20" />
      </div>

      {/* Form */}
      <section className="py-16 md:py-24">
        <div className="max-w-xl mx-auto px-6">
          {status === 'success' ? (
            <div className="text-center py-16">
              <div className="text-5xl mb-6">🌿</div>
              <h2 className="text-2xl font-bold text-primary font-serif mb-4">{t.successTitle}</h2>
              <p className="text-muted text-lg">{t.successMsg}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-primary mb-1">{t.name} <span className="text-red-500">*</span></label>
                <input name="name" required value={form.name} onChange={handleChange} placeholder="Nguyễn Thị Lan" className={inputClass} />
              </div>

              <div>
                <label className="block text-sm font-medium text-primary mb-1">{t.location} <span className="text-red-500">*</span></label>
                <input name="location" required value={form.location} onChange={handleChange} placeholder="Quận 3, TP.HCM" className={inputClass} />
              </div>

              <div>
                <label className="block text-sm font-medium text-primary mb-1">{t.phone} <span className="text-red-500">*</span></label>
                <input name="phone" required type="tel" value={form.phone} onChange={handleChange} placeholder="0912 345 678" className={inputClass} />
              </div>

              <div>
                <label className="block text-sm font-medium text-primary mb-1">{t.email} <span className="text-red-500">*</span></label>
                <input name="email" required type="email" value={form.email} onChange={handleChange} placeholder="lan@gmail.com" className={inputClass} />
              </div>

              <div>
                <label className="block text-sm font-medium text-primary mb-1">{t.quantity} <span className="text-red-500">*</span></label>
                <input
                  name="quantity"
                  required
                  type="number"
                  min={1}
                  max={50}
                  value={form.quantity}
                  onChange={handleChange}
                  className={inputClass}
                />
                {form.quantity >= 1 && (
                  <p className="text-sm text-secondary font-medium mt-1">
                    {t.total}: <strong>£{form.quantity * 40}</strong>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-primary mb-1">{t.note}</label>
                <textarea
                  name="note"
                  rows={3}
                  value={form.note}
                  onChange={handleChange}
                  placeholder={t.notePlaceholder}
                  className={inputClass + ' resize-none'}
                />
              </div>

              {status === 'error' && (
                <p className="text-red-500 text-sm">{errorMsg}</p>
              )}

              <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full bg-amber-600 text-white py-3 rounded-lg font-semibold hover:bg-amber-700 transition disabled:opacity-60"
              >
                {status === 'loading' ? t.submitting : t.submit}
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}
