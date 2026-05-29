'use client';

import { useState } from 'react';
import { useLanguage } from '@/components/LanguageToggle';
import { CONSULTATION_SLOTS, formatSlot } from '@/lib/consultation-slots';

export default function ConsultationBooking() {
  const lang = useLanguage();
  const [form, setForm] = useState({ name: '', phone: '', email: '', slot: '', businessInfo: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const t = {
    label: lang === 'vi' ? 'Tư vấn 1-1' : '1-on-1 Consultation',
    title: lang === 'vi' ? 'Đặt lịch tư vấn 1-1 với chị Bo' : 'Book a 1-on-1 with Bo',
    subtitle:
      lang === 'vi'
        ? 'Chọn khung giờ phù hợp để trao đổi trực tiếp về định hướng kinh doanh của bạn. Chị Bo sẽ liên hệ xác nhận ngày cụ thể.'
        : 'Pick a time that works for you to talk directly about your business. Bo will reach out to confirm the exact date.',
    name: lang === 'vi' ? 'Họ và tên' : 'Full name',
    phone: lang === 'vi' ? 'Số điện thoại' : 'Phone number',
    email: 'Email',
    slot: lang === 'vi' ? 'Khung giờ mong muốn' : 'Preferred time',
    slotPlaceholder: lang === 'vi' ? '— Chọn khung giờ —' : '— Select a time —',
    businessInfo: lang === 'vi' ? 'Thông tin kinh doanh (nếu có)' : 'Business info (optional)',
    businessInfoPlaceholder:
      lang === 'vi' ? 'Bạn đang/định kinh doanh gì? Quy mô ra sao?' : 'What do you sell or plan to sell?',
    message: lang === 'vi' ? 'Nhu cầu / câu hỏi cho chị Bo' : 'What would you like to discuss?',
    messagePlaceholder:
      lang === 'vi' ? 'Bạn muốn được tư vấn điều gì?' : 'What do you want advice on?',
    submit: lang === 'vi' ? 'Đặt lịch tư vấn' : 'Book consultation',
    submitting: lang === 'vi' ? 'Đang gửi...' : 'Sending...',
    successTitle: lang === 'vi' ? 'Đã nhận lịch của bạn! 🌿' : 'Booking received! 🌿',
    successMsg:
      lang === 'vi'
        ? 'Chị Bo sẽ liên hệ để xác nhận ngày cụ thể với bạn nhé.'
        : 'Bo will contact you to confirm the exact date.',
    errorDefault: lang === 'vi' ? 'Có lỗi xảy ra, vui lòng thử lại.' : 'Something went wrong, please try again.',
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMsg('');
    try {
      const res = await fetch('/api/booking-1-1', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || t.errorDefault);
      setStatus('success');
    } catch (err: any) {
      setErrorMsg(err.message || t.errorDefault);
      setStatus('error');
    }
  };

  const inputClass =
    'w-full border border-primary/20 rounded-lg px-4 py-3 text-primary placeholder-muted focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary bg-white transition';

  return (
    <section id="booking-1-1" className="py-16 md:py-24 bg-primary/5 border-t border-primary/10 scroll-mt-24">
      <div className="max-w-xl mx-auto px-6">
        <div className="text-center mb-10">
          <p className="text-secondary uppercase tracking-widest text-sm mb-3 font-medium">{t.label}</p>
          <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4 font-serif">{t.title}</h2>
          <p className="text-muted">{t.subtitle}</p>
        </div>

        {status === 'success' ? (
          <div className="text-center py-12">
            <div className="text-5xl mb-6">🌿</div>
            <h3 className="text-2xl font-bold text-primary font-serif mb-4">{t.successTitle}</h3>
            <p className="text-muted text-lg">{t.successMsg}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-primary mb-1">{t.name} <span className="text-red-500">*</span></label>
              <input name="name" required value={form.name} onChange={handleChange} placeholder="Nguyễn Thị Lan" className={inputClass} />
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
              <label className="block text-sm font-medium text-primary mb-1">{t.slot} <span className="text-red-500">*</span></label>
              <select name="slot" required value={form.slot} onChange={handleChange} className={inputClass}>
                <option value="" disabled>{t.slotPlaceholder}</option>
                {CONSULTATION_SLOTS.map((day) => (
                  <optgroup key={day.label} label={day.label}>
                    {day.times.map((time) => {
                      const value = formatSlot(day.label, time);
                      return <option key={value} value={value}>{value}</option>;
                    })}
                  </optgroup>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-primary mb-1">{t.businessInfo}</label>
              <textarea name="businessInfo" rows={2} value={form.businessInfo} onChange={handleChange} placeholder={t.businessInfoPlaceholder} className={inputClass + ' resize-none'} />
            </div>

            <div>
              <label className="block text-sm font-medium text-primary mb-1">{t.message}</label>
              <textarea name="message" rows={3} value={form.message} onChange={handleChange} placeholder={t.messagePlaceholder} className={inputClass + ' resize-none'} />
            </div>

            {status === 'error' && <p className="text-red-500 text-sm">{errorMsg}</p>}

            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full bg-primary text-light py-3 rounded-lg font-semibold hover:bg-primary/90 transition disabled:opacity-60"
            >
              {status === 'loading' ? t.submitting : t.submit}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
