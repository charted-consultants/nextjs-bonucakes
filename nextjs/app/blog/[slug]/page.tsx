'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import BlogContent, { BlogContentData } from '@/components/BlogContent';
import { useLanguage } from '@/components/LanguageToggle';
import Link from 'next/link';
import { BLOG_POSTS } from '@/lib/blog-posts';

// Blog post content lives in lib/blog-posts.ts (shared with the route's
// layout for metadata + structured data).
const mockPostsData: Record<string, BlogContentData> = BLOG_POSTS;

export default function BlogPostPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [post, setPost] = useState<BlogContentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const currentLang = useLanguage();

  useEffect(() => {
    // In production, this would fetch from an API or CMS
    // For now, we use mock data
    setTimeout(() => {
      const foundPost = mockPostsData[slug];
      if (foundPost) {
        setPost(foundPost);
      } else {
        setNotFound(true);
      }
      setLoading(false);
    }, 300);
  }, [slug]);

  return (
    <>
      {loading ? (
        <div className="max-w-4xl mx-auto px-6 pt-24 md:pt-28 pb-12 text-center text-[#4a5c52]">
          {currentLang === 'vi' ? 'Đang tải...' : 'Loading...'}
        </div>
      ) : notFound || !post ? (
        <div className="max-w-4xl mx-auto px-6 pt-24 md:pt-28 pb-12 text-center">
          <h1 className="text-2xl font-bold font-serif text-[#083121] mb-4">
            {currentLang === 'vi' ? 'Không tìm thấy bài viết' : 'Post not found'}
          </h1>
          <Link href="/blog" className="text-[#fcc56c] hover:underline">
            ← {currentLang === 'vi' ? 'Quay lại Blog' : 'Back to Blog'}
          </Link>
        </div>
      ) : (
        <BlogContent post={post} />
      )}

    </>
  );
}
