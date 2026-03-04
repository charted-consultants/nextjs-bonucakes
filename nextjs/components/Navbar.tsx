'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import LanguageToggle, { useLanguage } from './LanguageToggle';
import { useCartStore } from '@/lib/stores/cart-store';

interface NavItem {
  href: string;
  label: { vi: string; en: string };
}

const navItems: NavItem[] = [
  { href: '/story', label: { vi: 'Câu chuyện', en: 'Story' } },
  { href: '/products', label: { vi: 'Sản phẩm', en: 'Products' } },
  { href: '/culinary-consultation', label: { vi: 'Tư vấn', en: 'Services' } },
  { href: '/blog', label: { vi: 'Blog', en: 'Blog' } },
  { href: '#contact', label: { vi: 'Liên hệ', en: 'Contact' } },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const currentLang = useLanguage();
  const cartCount = useCartStore((state) =>
    state.items.reduce((total, item) => total + item.quantity, 0)
  );

  useEffect(() => {
    setMounted(true);

    // Handle scroll effect
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 bg-espresso/95 backdrop-blur-sm transition-shadow duration-300 ${
        scrolled ? 'shadow-[0_8px_24px_rgba(0,0,0,0.25)]' : ''
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
        <Link href="/" className="text-3xl font-bold text-gold font-serif">
          Bonu F&B
        </Link>

        <div className="flex items-center gap-6">
          {/* Desktop Navigation */}
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-cream/80 hover:text-white transition-colors hidden md:block"
            >
              {item.label[currentLang]}
            </Link>
          ))}

          {/* Cart Icon */}
          <Link
            href="/cart"
            className="relative text-cream/80 hover:text-white transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            {mounted && cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-terracotta text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>

          {/* Language Toggle */}
          <LanguageToggle />
        </div>
      </div>
    </nav>
  );
}
