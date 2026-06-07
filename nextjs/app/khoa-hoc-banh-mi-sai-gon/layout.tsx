import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Khoá học Bánh Mì Sài Gòn | Bonu Cakes',
  description:
    'Khoá truyền nghề bánh mì Sài Gòn cho người muốn kinh doanh tại UK. Học 1-1 trong 3 ngày: 8 loại nhân, pâté, 5 loại sốt, cách định giá, đóng gói và vận hành kinh doanh — từ người đã tự mở 3 nhà hàng tại Anh.',
  keywords:
    'khoá học bánh mì, học làm bánh mì, kinh doanh bánh mì UK, bánh mì Sài Gòn, dạy nghề bánh mì, Bonu Cakes',
  openGraph: {
    type: 'website',
    url: 'https://bonucakes.com/khoa-hoc-banh-mi-sai-gon',
    title: 'Khoá học Bánh Mì Sài Gòn | Bonu Cakes',
    description:
      'Học nhân, học cách bán và vận hành đơn hàng bài bản — từ người đã tự mở 3 nhà hàng tại Anh.',
    siteName: 'Bonu Cakes',
    locale: 'vi_VN',
  },
  alternates: {
    canonical: 'https://bonucakes.com/khoa-hoc-banh-mi-sai-gon',
  },
};

export default function KhoaHocBanhMiLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
