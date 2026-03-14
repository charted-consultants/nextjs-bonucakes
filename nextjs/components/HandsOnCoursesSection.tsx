'use client';

import { useLanguage } from './LanguageToggle';

// Local path for course PDFs
const PDF_BASE_URL = '';

interface HandsOnCourse {
  id: string;
  title: { vi: string; en: string };
  description: { vi: string; en: string };
  duration: { vi: string; en: string };
  highlights: { vi: string[]; en: string[] };
  pdfEn: string;
  pdfVi: string;
}

const handsOnCourses: HandsOnCourse[] = [
  {
    id: 'banh-mi',
    title: {
      vi: 'Bánh Mì - Khóa học cao cấp',
      en: 'Bánh Mì - Premium Masterclass',
    },
    description: {
      vi: 'Học làm bánh mì Việt Nam từ A-Z với 8 loại nhân thịt, 5 loại sốt đặc trưng.',
      en: 'Master Vietnamese baguette from A-Z with 8 protein fillings and 5 signature sauces.',
    },
    duration: { vi: '3 ngày', en: '3 days' },
    highlights: {
      vi: ['8 loại nhân thịt', '5 loại sốt', 'Vận hành & đóng gói'],
      en: ['8 protein fillings', '5 signature sauces', 'Operations & packaging'],
    },
    pdfEn: '/downloads/courses/course-banh-mi.pdf',
    pdfVi: '/downloads/courses/course-banh-mi-vi.pdf',
  },
  {
    id: 'tra-sua',
    title: {
      vi: 'Trà Sữa - Khóa học đầy đủ',
      en: 'Bubble Tea - Complete Masterclass',
    },
    description: {
      vi: 'Học pha chế 30+ loại đồ uống: trà sữa, matcha, trà trái cây và topping tự làm.',
      en: 'Learn to craft 30+ drinks: milk teas, matcha, fruit teas, and homemade toppings.',
    },
    duration: { vi: '2 ngày', en: '2 days' },
    highlights: {
      vi: ['30+ loại đồ uống', 'Trân châu tự làm', 'Cheese foam độc quyền'],
      en: ['30+ drink recipes', 'Homemade tapioca', 'Signature cheese foam'],
    },
    pdfEn: '/downloads/courses/course-tra-sua.pdf',
    pdfVi: '/downloads/courses/course-tra-sua-vi.pdf',
  },
  {
    id: 'pho',
    title: {
      vi: 'Phở - Khóa học nền tảng',
      en: 'Phở - Foundational Masterclass',
    },
    description: {
      vi: 'Nắm vững nghệ thuật nấu nước dùng, cân bằng gia vị và kỹ thuật phục vụ.',
      en: 'Master broth artistry, spice balancing, and authentic service techniques.',
    },
    duration: { vi: '2 ngày', en: '2 days' },
    highlights: {
      vi: ['Nước dùng chuẩn vị', 'Cắt thịt chuyên nghiệp', 'Quy trình phục vụ'],
      en: ['Authentic broth', 'Professional meat cuts', 'Service flow'],
    },
    pdfEn: '/downloads/courses/course-pho.pdf',
    pdfVi: '/downloads/courses/course-pho-vi.pdf',
  },
  {
    id: 'bun-bo-hue',
    title: {
      vi: 'Bún Bò Huế',
      en: 'Bún Bò Huế - Spicy Beef Noodle Soup',
    },
    description: {
      vi: 'Học nấu bún bò Huế chuẩn vị với nước dùng sả, mắm ruốc và sate tự làm.',
      en: 'Master authentic Huế-style soup with lemongrass broth, shrimp paste, and homemade sate.',
    },
    duration: { vi: '2 ngày', en: '2 days' },
    highlights: {
      vi: ['Nước dùng sả đặc trưng', 'Sate tự làm', 'Chả cua Huế'],
      en: ['Signature lemongrass broth', 'Homemade sate paste', 'Huế crab cake'],
    },
    pdfEn: '/downloads/courses/course-bun-bo-hue.pdf',
    pdfVi: '/downloads/courses/course-bun-bo-hue-vi.pdf',
  },
  {
    id: 'banh-bao',
    title: {
      vi: 'Bánh Bao - Công thức cao cấp',
      en: 'Bánh Bao - Premium Steamed Buns',
    },
    description: {
      vi: 'Học làm bánh bao với công thức bột độc quyền, mềm mịn và trắng hoàn hảo.',
      en: 'Learn premium steamed buns with proprietary flour blend for perfect soft, white texture.',
    },
    duration: { vi: '2 ngày', en: '2 days' },
    highlights: {
      vi: ['Công thức bột độc quyền', 'Nhân thịt truyền thống', 'Đông lạnh & bán online'],
      en: ['Proprietary flour blend', 'Traditional pork filling', 'Freezing & online sales'],
    },
    pdfEn: '/downloads/courses/course-banh-bao.pdf',
    pdfVi: '/downloads/courses/course-banh-bao-vi.pdf',
  },
];

export default function HandsOnCoursesSection() {
  const currentLang = useLanguage();

  const handleDownload = (pdfUrl: string) => {
    window.open(pdfUrl, '_blank');
  };

  return (
    <section id="hands-on-courses" className="py-16 md:py-24 bg-white fade-in">
      <div className="max-w-6xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-12">
          <p className="text-secondary uppercase tracking-widest text-sm mb-4 font-medium">
            {currentLang === 'vi' ? 'Khóa học thực hành' : 'Hands-On Courses'}
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
            {currentLang === 'vi' ? 'Khóa học 1-1 tại Wales' : '1-on-1 Courses in Wales'}
          </h2>
          <p className="text-muted max-w-2xl mx-auto">
            {currentLang === 'vi'
              ? 'Học trực tiếp với founder tại Saundersfoot, Wales. Bao gồm chỗ ở, nguyên liệu và hỗ trợ sau khóa học.'
              : 'Learn directly with the founder in Saundersfoot, Wales. Includes accommodation, ingredients, and post-course support.'}
          </p>
        </div>

        {/* Download Catalogue Button */}
        <div className="text-center mb-10">
          <a
            href="/downloads/courses/course-catalogue.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-secondary text-primary px-6 py-3 font-semibold hover:bg-secondary/90 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            {currentLang === 'vi' ? 'Tải Catalogue Khóa Học' : 'Download Course Catalogue'}
          </a>
        </div>

        {/* Courses Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {handsOnCourses.map((course) => (
            <div
              key={course.id}
              className="bg-light border border-primary/10 p-6 hover-lift flex flex-col"
            >
              <div className="flex-1">
                <div className="flex justify-between items-start mb-3">
                  <span className="text-xs text-muted bg-primary/5 px-2 py-1">
                    {course.duration[currentLang]}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-primary mb-2">
                  {course.title[currentLang]}
                </h3>
                <p className="text-muted text-sm mb-4">{course.description[currentLang]}</p>
                <ul className="text-sm text-muted space-y-1 mb-4">
                  {course.highlights[currentLang].map((highlight, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <span className="text-secondary">•</span>
                      {highlight}
                    </li>
                  ))}
                </ul>
              </div>
              <button
                onClick={() => handleDownload(currentLang === 'vi' ? course.pdfVi : course.pdfEn)}
                className="w-full mt-auto flex items-center justify-center gap-2 bg-primary text-white px-4 py-3 font-semibold hover:bg-primary/90 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                {currentLang === 'vi' ? 'Tải PDF Chi Tiết' : 'Download Details PDF'}
              </button>
            </div>
          ))}
        </div>

        {/* Contact CTA */}
        <div className="text-center mt-12 p-8 bg-primary/5 border border-primary/10">
          <p className="text-muted mb-4">
            {currentLang === 'vi'
              ? 'Giá và lịch học được ghi trong PDF. Liên hệ để đặt lịch.'
              : 'Pricing and schedule details are in the PDF. Contact us to book.'}
          </p>
          <a
            href="#contact"
            className="inline-block bg-primary text-white px-8 py-4 font-semibold hover:bg-primary/90 transition-colors"
          >
            {currentLang === 'vi' ? 'Liên hệ đặt lịch' : 'Contact to Book'}
          </a>
        </div>
      </div>
    </section>
  );
}
