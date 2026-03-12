'use client';

import { useLanguage } from './LanguageToggle';
import Link from 'next/link';

interface HeroContent {
  tagline: { vi: string; en: string };
  title: { vi: string; en: string };
  subtitle: { vi: string; en: string };
  description: { vi: string; en: string };
  ctaPrimary: { vi: string; en: string };
  ctaSecondary: { vi: string; en: string };
}

const heroContent: HeroContent = {
  tagline: {
    vi: 'F&B Business & Personal Development',
    en: 'F&B Business & Personal Development',
  },
  title: {
    vi: 'Xây dựng sự nghiệp F&B<br>từ bên trong<br>Hiểu mình, lớn mạnh bền vững.',
    en: 'Build F&B business from within. Know yourself, grow sustainably.',
  },
  subtitle: {
    vi: 'Bài học thật từ 10+ năm: từ thất bại đến Best Bánh Mì in Manchester.',
    en: 'Real lessons from 10+ years: from failures to Best Bánh Mì in Manchester.',
  },
  description: {
    vi: 'Vì thành công bền vững đòi hỏi cả kỹ năng kinh doanh lẫn làm chủ bản thân.',
    en: 'Because sustainable success requires both business skills and self-mastery.',
  },
  ctaPrimary: {
    vi: 'Xem dịch vụ & khóa học',
    en: 'View services & courses',
  },
  ctaSecondary: {
    vi: 'Liên hệ tư vấn',
    en: 'Contact for consultation',
  },
};

export default function Hero() {
  const currentLang = useLanguage();

  return (
    <header className="relative text-white pt-24 pb-16 md:pt-32 md:pb-24 overflow-hidden fade-in">
      {/* Video Background */}
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src="/hero-video.mp4" type="video/mp4" />
      </video>

      {/* Content */}
      <div className="relative max-w-6xl mx-auto px-6 text-center">
        <p className="text-[#fcc56c] uppercase tracking-widest text-sm mb-4 font-medium">
          {heroContent.tagline[currentLang]}
        </p>

        <h1
          className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight max-w-4xl mx-auto"
          dangerouslySetInnerHTML={{ __html: heroContent.title[currentLang] }}
        />

        <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
          {heroContent.subtitle[currentLang]}
        </p>

        <p className="text-lg text-white/70 mb-8 max-w-2xl mx-auto">
          {heroContent.description[currentLang]}
        </p>

        <div className="flex flex-wrap gap-4 justify-center">
          <Link
            href="#courses"
            className="bg-[#fcc56c] text-[#083121] px-8 py-4 font-semibold hover:bg-[#fcc56c]/90 transition-all hover:-translate-y-0.5"
          >
            {heroContent.ctaPrimary[currentLang]}
          </Link>
          <Link
            href="#contact"
            className="border border-[#fcc56c]/50 text-[#fcc56c] px-8 py-4 font-semibold hover:bg-[#fcc56c]/10 transition-all hover:-translate-y-0.5"
          >
            {heroContent.ctaSecondary[currentLang]}
          </Link>
        </div>
      </div>
    </header>
  );
}
