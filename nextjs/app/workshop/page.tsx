'use client';

import { useState } from 'react';
import { useLanguage } from '@/components/LanguageToggle';

export default function WorkshopPage() {
  const lang = useLanguage();
  const [form, setForm] = useState({ name: '', location: '', phone: '', email: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const t = {
    label: lang === 'vi' ? 'Workshop' : 'Workshop',
    title: lang === 'vi' ? 'Bếp Bà Bo' : 'Bếp Bà Bo',
    subtitle:
      lang === 'vi'
        ? 'Đăng ký để nhận thông tin về buổi workshop nấu ăn Việt Nam truyền thống cùng Bonu.'
        : 'Register to receive information about our traditional Vietnamese cooking workshop with Bonu.',
    name: lang === 'vi' ? 'Họ và tên' : 'Full name',
    location: lang === 'vi' ? 'Địa chỉ' : 'Address',
    phone: lang === 'vi' ? 'Số điện thoại' : 'Phone number',
    email: 'Email',
    message: lang === 'vi' ? 'Thắc mắc và suy nghĩ của bạn muốn gửi đến Bonu' : 'Your questions or thoughts for Bonu',
    messagePlaceholder:
      lang === 'vi'
        ? 'Bạn muốn học gì? Có câu hỏi nào muốn hỏi Bonu không?'
        : 'What would you like to learn? Any questions for Bonu?',
    submit: lang === 'vi' ? 'Gửi thông tin' : 'Submit',
    submitting: lang === 'vi' ? 'Đang gửi...' : 'Sending...',
    successTitle: lang === 'vi' ? 'Bonu đã nhận được rồi! 🌿' : 'Received! 🌿',
    successMsg:
      lang === 'vi'
        ? 'Cảm ơn bạn đã quan tâm. Bonu sẽ liên hệ với bạn trong 1–2 ngày nhé.'
        : 'Thank you for your interest. Bonu will get back to you within 1–2 days.',
    errorDefault: lang === 'vi' ? 'Có lỗi xảy ra, vui lòng thử lại.' : 'Something went wrong, please try again.',
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMsg('');
    try {
      const res = await fetch('/api/workshop', {
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
    <div className="min-h-screen bg-light">
      {/* Hero */}
      <header className="bg-light pt-32 pb-16 border-b border-primary/10">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <p className="text-secondary uppercase tracking-widest text-sm mb-4 font-medium">{t.label}</p>
          <h1 className="text-4xl md:text-5xl font-bold text-primary mb-6 font-serif">{t.title}</h1>
          <p className="text-lg text-muted">{t.subtitle}</p>
        </div>
      </header>

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
                <label className="block text-sm font-medium text-primary mb-1">{t.message}</label>
                <textarea
                  name="message"
                  rows={4}
                  value={form.message}
                  onChange={handleChange}
                  placeholder={t.messagePlaceholder}
                  className={inputClass + ' resize-none'}
                />
              </div>

              {status === 'error' && (
                <p className="text-red-500 text-sm">{errorMsg}</p>
              )}

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
    </div>
  );
}
