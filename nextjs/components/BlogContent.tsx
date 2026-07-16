'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { useLanguage } from './LanguageToggle';

export interface BlogContentData {
  title: string;
  titleEn?: string;
  excerpt?: string;
  excerptEn?: string;
  content: string;
  contentEn?: string;
  image?: string;
  date: string;
  author?: string;
}

interface BlogContentProps {
  post: BlogContentData;
}

export default function BlogContent({ post }: BlogContentProps) {
  const currentLang = useLanguage();
  const contentRef = useRef<HTMLDivElement>(null);

  const title = currentLang === 'en' && post.titleEn ? post.titleEn : post.title;
  const excerpt = currentLang === 'en' && post.excerptEn ? post.excerptEn : post.excerpt;
  const content = currentLang === 'en' && post.contentEn ? post.contentEn : post.content;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(currentLang === 'vi' ? 'vi-VN' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Posts written with the admin rich text editor are already HTML
  // (e.g. "<p>...</p>"). Older posts (mock launch content, or posts
  // created before the RTE existed) are plain markdown-ish text and
  // still need the legacy conversion below.
  const isHtml = (text: string) => /^\s*<[a-z][\s\S]*>/i.test(text);

  // Process markdown-like content to HTML
  const renderContent = (text: string) => {
    if (isHtml(text)) return text;

    // Split by double newlines for paragraphs
    const blocks = text.split('\n\n').filter(block => block.trim());

    return blocks.map((block, index) => {
      const trimmed = block.trim();

      // Headings
      if (trimmed.startsWith('## ')) {
        return `<h2 key="${index}" class="text-2xl font-bold font-serif text-[#083121] mt-8 mb-4">${trimmed.slice(3)}</h2>`;
      }
      if (trimmed.startsWith('# ')) {
        return `<h1 key="${index}" class="text-3xl font-bold font-serif text-[#083121] mt-8 mb-4">${trimmed.slice(2)}</h1>`;
      }

      // Blockquote
      if (trimmed.startsWith('> ')) {
        const quoteText = trimmed.split('\n').map(line => line.replace(/^> /, '')).join(' ');
        return `<blockquote key="${index}" class="border-l-4 border-[#fcc56c] pl-4 my-6 italic text-[#4a5c52]">${quoteText}</blockquote>`;
      }

      // Unordered list
      if (trimmed.match(/^[•\-*] /m)) {
        const items = trimmed.split('\n')
          .filter(line => line.match(/^[•\-*] /))
          .map(line => `<li>${line.replace(/^[•\-*] /, '')}</li>`)
          .join('');
        return `<ul key="${index}" class="list-disc pl-6 my-4 space-y-2">${items}</ul>`;
      }

      // Ordered list
      if (trimmed.match(/^\d+\. /m)) {
        const items = trimmed.split('\n')
          .filter(line => line.match(/^\d+\. /))
          .map(line => `<li>${line.replace(/^\d+\. /, '')}</li>`)
          .join('');
        return `<ol key="${index}" class="list-decimal pl-6 my-4 space-y-2">${items}</ol>`;
      }

      // Regular paragraph
      // Process inline formatting: **bold**, *italic*, [link](url)
      let processed = trimmed
        .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
        .replace(/\*([^*]+)\*/g, '<em>$1</em>')
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-[#fcc56c] hover:underline">$1</a>');

      return `<p key="${index}" class="mb-6 leading-relaxed">${processed}</p>`;
    }).join('');
  };

  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.innerHTML = renderContent(content);
    }
  }, [content]);

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedTitle = encodeURIComponent(title);

  return (
    <article className="max-w-4xl mx-auto px-6 pt-24 md:pt-28 pb-12">
      <Link
        href="/blog"
        className="text-[#fcc56c] hover:underline mb-6 inline-block"
      >
        ← {currentLang === 'vi' ? 'Quay lại Blog' : 'Back to Blog'}
      </Link>

      <header className="mb-8">
        <time className="text-[#4a5c52]/60 text-sm">{formatDate(post.date)}</time>
        <h1 className="text-3xl md:text-4xl font-bold font-serif text-[#083121] mt-2 mb-4">
          {title}
        </h1>
        {excerpt && (
          <p className="text-xl text-[#4a5c52] leading-relaxed">{excerpt}</p>
        )}
        {post.author && (
          <div className="mt-4 text-sm text-[#4a5c52]/70">
            {currentLang === 'vi' ? 'Bởi' : 'By'} <span className="font-medium">{post.author}</span>
          </div>
        )}
      </header>

      {post.image && (
        <div className="mb-8 rounded-lg overflow-hidden">
          <img src={post.image} alt={title} className="w-full h-auto" />
        </div>
      )}

      <div
        ref={contentRef}
        className="prose prose-lg max-w-none text-[#4a5c52]"
        style={{
          fontFamily: 'Inter, sans-serif'
        }}
      />

      {/* Share buttons */}
      <div className="mt-12 pt-8 border-t border-[#083121]/10">
        <h3 className="text-lg font-bold font-serif text-[#083121] mb-4">
          {currentLang === 'vi' ? 'Chia sẻ bài viết' : 'Share this post'}
        </h3>
        <div className="flex gap-4">
          <a
            href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-[#083121] text-white rounded-lg hover:bg-[#fcc56c] hover:text-[#083121] transition-colors"
          >
            Facebook
          </a>
          <a
            href={`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-[#083121] text-white rounded-lg hover:bg-[#fcc56c] hover:text-[#083121] transition-colors"
          >
            Twitter
          </a>
          <a
            href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-[#083121] text-white rounded-lg hover:bg-[#fcc56c] hover:text-[#083121] transition-colors"
          >
            LinkedIn
          </a>
        </div>
      </div>
    </article>
  );
}
