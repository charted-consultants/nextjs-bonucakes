'use client';

import { useLanguage } from './LanguageToggle';

interface ProductBadgeProps {
  type: 'featured' | 'promotion' | 'out-of-stock' | 'coming-soon';
  text?: {
    vi: string;
    en: string;
  };
  className?: string;
}

export default function ProductBadge({ type, text, className = '' }: ProductBadgeProps) {
  const currentLang = useLanguage();

  const getBadgeContent = () => {
    switch (type) {
      case 'featured':
        return {
          text: currentLang === 'vi' ? 'Nổi bật' : 'Featured',
          className: 'bg-secondary text-primary',
        };
      case 'promotion':
        return {
          text: text ? text[currentLang] : '',
          className: 'bg-primary text-white',
        };
      case 'out-of-stock':
        return {
          text: currentLang === 'vi' ? 'Hết hàng' : 'Out of stock',
          className: 'bg-gray-800 text-white',
        };
      case 'coming-soon':
        return {
          text: currentLang === 'vi' ? 'Sắp ra mắt' : 'Coming Soon',
          className: 'bg-amber-600 text-white',
        };
      default:
        return {
          text: '',
          className: '',
        };
    }
  };

  const badge = getBadgeContent();

  if (!badge.text) return null;

  return (
    <div className={`px-3 py-1 text-sm font-semibold ${badge.className} ${className}`}>
      {badge.text}
    </div>
  );
}
