import { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = {
  ...pageMetadata({
    path: '/culinary-consultation',
    title: 'Culinary Consultation — Exclusive Vietnamese Recipes',
    description:
      'Premium culinary consultation with Uyên Nguyễn: recipes tested and optimised for local UK ingredients, with a first-time-success guarantee. Tư vấn công thức ẩm thực cao cấp cho nhà hàng Việt.',
  }),
  authors: [{ name: 'Uyen Nguyen - Bonu Cakes' }],
};

export default function CulinaryConsultationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
