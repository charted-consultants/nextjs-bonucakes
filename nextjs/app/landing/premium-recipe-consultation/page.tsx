'use client';

import { useLanguage } from '@/components/LanguageToggle';
import Link from 'next/link';
import { useEffect } from 'react';

export default function PremiumRecipeConsultationPage() {
  const currentLang = useLanguage();

  useEffect(() => {
    document.title = 'Tư vấn công thức độc quyền 1-1 | Bonu F&B';
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute(
        'content',
        'Nhận công thức đã được test & tối ưu theo nguyên liệu địa phương. Support đến khi ra thành phẩm. Phù hợp mở quán và scale.'
      );
    }
  }, []);

  return (
    <>
      <header className="pt-24 md:pt-28 pb-10 bg-[#f8faf9] border-b border-[#083121]/10">
        <div className="max-w-5xl mx-auto px-6">
          <p className="text-[#fcc56c] uppercase tracking-widest text-sm mb-3 font-medium">
            Signature • {currentLang === 'vi' ? 'Trọn gói' : 'Full package'}
          </p>
          <h1 className="text-3xl md:text-5xl font-bold text-[#083121] mb-4">
            {currentLang === 'vi'
              ? 'Tư vấn công thức độc quyền 1-1'
              : 'Premium 1-1 Recipe Consultation'}
          </h1>
          <p className="text-lg text-[#4a5c52] max-w-3xl">
            {currentLang === 'vi'
              ? 'Nhận công thức đã test & tối ưu theo nguyên liệu bạn có sẵn. Gửi ảnh/website nguyên liệu → nhận công thức chuẩn → support đến khi ra thành phẩm. Phù hợp mở quán và mở rộng.'
              : 'Receive tested & optimized formulas for your available ingredients. Send photos/ingredient website → receive precise formula → support until finished product. Suitable for opening shop and scaling.'}
          </p>
          <div className="mt-6 flex flex-wrap gap-3 text-sm text-[#4a5c52]/80">
            <span className="px-3 py-1 bg-[#f8faf9] border border-[#083121]/10">
              {currentLang === 'vi' ? 'Phù hợp mọi địa điểm' : 'Suitable for any location'}
            </span>
            <span className="px-3 py-1 bg-[#f8faf9] border border-[#083121]/10">
              {currentLang === 'vi' ? 'Support 1-1' : '1-1 Support'}
            </span>
            <span className="px-3 py-1 bg-[#f8faf9] border border-[#083121]/10">
              {currentLang === 'vi' ? 'Scale‑ready' : 'Scale‑ready'}
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12">
        <section className="grid md:grid-cols-2 gap-8 mb-10">
          <div className="bg-white border border-[#083121]/10 p-6">
            <h2 className="text-2xl font-bold text-[#083121] mb-4">
              {currentLang === 'vi' ? 'Quy trình làm việc' : 'Work process'}
            </h2>
            <ol className="list-decimal pl-6 text-[#4a5c52] space-y-2">
              {currentLang === 'vi' ? (
                <>
                  <li>Khảo sát nguyên liệu địa phương (ảnh/link cửa hàng).</li>
                  <li>Thiết kế công thức phù hợp – gửi video hướng dẫn.</li>
                  <li>Thực hành, feedback, tinh chỉnh tới khi đạt.</li>
                  <li>Chuẩn hóa SOP sản xuất & bảo quản.</li>
                </>
              ) : (
                <>
                  <li>Survey local ingredients (photos/shop links).</li>
                  <li>Design suitable formula – send instructional video.</li>
                  <li>Practice, feedback, refine until achieved.</li>
                  <li>Standardize production & storage SOP.</li>
                </>
              )}
            </ol>
          </div>
          <div className="bg-white border border-[#083121]/10 p-6">
            <h2 className="text-2xl font-bold text-[#083121] mb-4">
              {currentLang === 'vi' ? 'Phạm vi món' : 'Dish scope'}
            </h2>
            <ul className="space-y-2 text-[#4a5c52]">
              {currentLang === 'vi' ? (
                <>
                  <li>• Bánh ngọt/bánh mì; món nước; đồ uống; topping/syrup.</li>
                  <li>• Công thức mới hoặc tối ưu công thức hiện có.</li>
                  <li>• Setup menu theo phân khúc & location cụ thể.</li>
                </>
              ) : (
                <>
                  <li>• Pastries/bread; soup dishes; beverages; topping/syrup.</li>
                  <li>• New formula or optimize existing formula.</li>
                  <li>• Setup menu by segment & specific location.</li>
                </>
              )}
            </ul>
            <p className="text-[#4a5c52]/70 mt-3 text-sm">
              {currentLang === 'vi'
                ? 'Chi phí theo độ khó & độ tuỳ chỉnh; on‑site tính thêm di chuyển/lưu trú.'
                : 'Cost by difficulty & customization level; on‑site includes travel/accommodation.'}
            </p>
          </div>
        </section>

        <section className="grid md:grid-cols-3 gap-6 mb-10">
          <div className="bg-[#083121] text-[#f8faf9] p-6">
            <p className="text-3xl font-bold text-[#fcc56c] mb-1">100%</p>
            <p className="text-[#f8faf9]/80 text-sm">
              {currentLang === 'vi' ? 'Cam kết ra sản phẩm' : 'Product guarantee'}
            </p>
          </div>
          <div className="bg-[#f8faf9] border border-[#083121]/10 p-6">
            <p className="text-[#083121] font-bold mb-1">
              {currentLang === 'vi' ? 'Tối ưu thực tế' : 'Real optimization'}
            </p>
            <p className="text-[#4a5c52]/80 text-sm">
              {currentLang === 'vi' ? 'Theo nguyên liệu địa phương' : 'Based on local ingredients'}
            </p>
          </div>
          <div className="bg-[#f8faf9] border border-[#083121]/10 p-6">
            <p className="text-[#083121] font-bold mb-1">
              {currentLang === 'vi' ? 'Vận hành' : 'Operations'}
            </p>
            <p className="text-[#4a5c52]/80 text-sm">
              {currentLang === 'vi' ? 'SOP sẵn sàng scale' : 'SOP ready to scale'}
            </p>
          </div>
        </section>

        <section className="bg-[#f8faf9] border border-[#083121]/10 p-6 md:p-8 mb-10">
          <h2 className="text-2xl font-bold text-[#083121] mb-4">
            {currentLang === 'vi' ? 'Câu hỏi để chốt lộ trình' : 'Questions to determine roadmap'}
          </h2>
          <ul className="list-disc pl-6 text-[#4a5c52] space-y-2">
            {currentLang === 'vi' ? (
              <>
                <li>Mục tiêu 3–6 tháng? (doanh thu/sản phẩm/hệ thống)</li>
                <li>Tệp khách hàng & location bạn phục vụ?</li>
                <li>Thiết bị/nhân sự hiện có và gap cần bù?</li>
                <li>Kế hoạch thử nghiệm và mốc đo lường?</li>
              </>
            ) : (
              <>
                <li>3–6 month goals? (revenue/product/system)</li>
                <li>Customer base & location you serve?</li>
                <li>Current equipment/staff and gap to fill?</li>
                <li>Testing plan and measurement milestones?</li>
              </>
            )}
          </ul>
        </section>

        {/* Narrative: vì sao 1-1 */}
        <section className="bg-white border border-[#083121]/10 p-6 md:p-8 mb-10">
          <h2 className="text-2xl font-bold text-[#083121] mb-4">
            {currentLang === 'vi' ? 'Tại sao 1‑1 hiệu quả?' : 'Why is 1‑1 effective?'}
          </h2>
          <p className="text-[#4a5c52] mb-3">
            {currentLang === 'vi'
              ? 'Mỗi nơi một khác: bột, đường, sữa, thậm chí nước và lò nướng. 1‑1 cho phép hiệu chỉnh công thức theo đúng nguyên liệu bạn có – thay vì cố ép theo một bản công thức "chuẩn chung".'
              : 'Every place is different: flour, sugar, milk, even water and ovens. 1‑1 allows formula adjustment according to your exact ingredients – instead of forcing a "standard" formula.'}
          </p>
          <p className="text-[#4a5c52]">
            {currentLang === 'vi'
              ? 'Mục tiêu: ra sản phẩm đúng và ra tiền sớm – không sa đà học quá rộng mà không bán được.'
              : 'Goal: get the right product and earn money early – not getting lost in learning too broadly without selling.'}
          </p>
        </section>

        {/* Outcomes & mini cases */}
        <section className="mb-10">
          {/* Mobile stacked */}
          <div className="md:hidden space-y-3">
            {currentLang === 'vi' ? (
              <>
                <div className="border border-[#083121]/10 p-3">
                  <p className="text-[#4a5c52]">
                    <span className="font-semibold">Khảo sát:</span> 1–3 ngày
                  </p>
                </div>
                <div className="border border-[#083121]/10 p-3">
                  <p className="text-[#4a5c52]">
                    <span className="font-semibold">Thiết kế + test:</span> 3–7 ngày
                  </p>
                </div>
                <div className="border border-[#083121]/10 p-3">
                  <p className="text-[#4a5c52]">
                    <span className="font-semibold">Tinh chỉnh:</span> 3–7 ngày (tùy món)
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="border border-[#083121]/10 p-3">
                  <p className="text-[#4a5c52]">
                    <span className="font-semibold">Survey:</span> 1–3 days
                  </p>
                </div>
                <div className="border border-[#083121]/10 p-3">
                  <p className="text-[#4a5c52]">
                    <span className="font-semibold">Design + test:</span> 3–7 days
                  </p>
                </div>
                <div className="border border-[#083121]/10 p-3">
                  <p className="text-[#4a5c52]">
                    <span className="font-semibold">Refinement:</span> 3–7 days (depends on dish)
                  </p>
                </div>
              </>
            )}
          </div>
          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto mb-6">
            <table className="w-full border-collapse">
              <thead>
                <tr className="text-left bg-[#f8faf9]">
                  <th className="p-3 border border-[#083121]/10 w-56">
                    {currentLang === 'vi' ? 'Giai đoạn' : 'Phase'}
                  </th>
                  <th className="p-3 border border-[#083121]/10">
                    {currentLang === 'vi' ? 'Thời gian' : 'Duration'}
                  </th>
                </tr>
              </thead>
              <tbody className="text-[#4a5c52]">
                {currentLang === 'vi' ? (
                  <>
                    <tr>
                      <td className="p-3 border border-[#083121]/10">Khảo sát</td>
                      <td className="p-3 border border-[#083121]/10">1–3 ngày</td>
                    </tr>
                    <tr className="bg-[#f8faf9]/50">
                      <td className="p-3 border border-[#083121]/10">Thiết kế + test</td>
                      <td className="p-3 border border-[#083121]/10">3–7 ngày</td>
                    </tr>
                    <tr>
                      <td className="p-3 border border-[#083121]/10">Tinh chỉnh</td>
                      <td className="p-3 border border-[#083121]/10">3–7 ngày (tùy món)</td>
                    </tr>
                  </>
                ) : (
                  <>
                    <tr>
                      <td className="p-3 border border-[#083121]/10">Survey</td>
                      <td className="p-3 border border-[#083121]/10">1–3 days</td>
                    </tr>
                    <tr className="bg-[#f8faf9]/50">
                      <td className="p-3 border border-[#083121]/10">Design + test</td>
                      <td className="p-3 border border-[#083121]/10">3–7 days</td>
                    </tr>
                    <tr>
                      <td className="p-3 border border-[#083121]/10">Refinement</td>
                      <td className="p-3 border border-[#083121]/10">3–7 days (depends on dish)</td>
                    </tr>
                  </>
                )}
              </tbody>
            </table>
          </div>
          <div className="bg-[#f8faf9] border border-[#083121]/10 p-6 mb-6">
            <h3 className="font-semibold text-[#083121] mb-2">
              {currentLang === 'vi' ? 'Bạn sẽ có' : 'You will have'}
            </h3>
            <ul className="list-disc pl-5 text-[#4a5c52] space-y-1">
              {currentLang === 'vi' ? (
                <>
                  <li>Công thức đã test theo nguyên liệu của bạn</li>
                  <li>Video hướng dẫn + checklist thao tác</li>
                  <li>Kế hoạch thử bán/điều chỉnh nhanh</li>
                </>
              ) : (
                <>
                  <li>Tested formula for your ingredients</li>
                  <li>Instructional video + operation checklist</li>
                  <li>Test sales/quick adjustment plan</li>
                </>
              )}
            </ul>
          </div>
          <div className="bg-[#f8faf9] border border-[#083121]/10 p-6">
            <h3 className="font-semibold text-[#083121] mb-2">
              {currentLang === 'vi' ? 'Case ngắn' : 'Case studies'}
            </h3>
            <ul className="list-disc pl-5 text-[#4a5c52] space-y-1">
              {currentLang === 'vi' ? (
                <>
                  <li>Mỹ: tối ưu syrup đồ uống theo đường địa phương</li>
                  <li>EU: điều chỉnh bột cho cốt bánh đứng form</li>
                  <li>NA: quy trình giao xa không mất cấu trúc</li>
                </>
              ) : (
                <>
                  <li>USA: optimize beverage syrup to local sugar</li>
                  <li>EU: adjust flour for cake structure retention</li>
                  <li>NA: long-distance delivery process without losing structure</li>
                </>
              )}
            </ul>
          </div>
        </section>

        {/* Beyond recipes: F&B mindset */}
        <section className="bg-[#f8faf9] border border-[#083121]/10 p-6 md:p-8 mb-10">
          <h2 className="text-2xl font-bold text-[#083121] mb-4">
            {currentLang === 'vi'
              ? 'Không chỉ là công thức: tư duy vận hành F&B'
              : 'Beyond recipes: F&B operations mindset'}
          </h2>
          <p className="text-[#4a5c52] mb-3">
            {currentLang === 'vi'
              ? '1‑1 giúp bạn vừa có công thức đúng, vừa lắp tư duy vận hành chuẩn để đi đường dài.'
              : '1‑1 helps you get the right formula while installing proper operational mindset for the long road.'}
          </p>
          <ul className="list-disc pl-5 text-[#4a5c52] space-y-1">
            {currentLang === 'vi' ? (
              <>
                <li>Chân dung khách hàng – chiến lược giữ chân</li>
                <li>Nhân sự: vai trò, đào tạo nhanh, tạo động lực</li>
                <li>Hàng hóa/nguyên liệu: tồn kho, thay thế, cost</li>
                <li>Quy trình: SOP, đo lường, tối ưu theo dữ liệu</li>
                <li>"Mỗi món nói điều gì" – định vị qua sản phẩm</li>
              </>
            ) : (
              <>
                <li>Customer profile – retention strategy</li>
                <li>Staff: roles, quick training, motivation</li>
                <li>Inventory/ingredients: stock, substitution, cost</li>
                <li>Process: SOP, measurement, data-driven optimization</li>
                <li>"What each dish says" – positioning through products</li>
              </>
            )}
          </ul>
        </section>

        <section className="bg-[#083121] text-[#f8faf9] p-6 md:p-8">
          <div className="md:flex md:items-center md:justify-between gap-6">
            <div className="mb-4 md:mb-0">
              <h2 className="text-2xl font-bold mb-2">
                {currentLang === 'vi'
                  ? 'Đăng ký tư vấn công thức 1-1'
                  : 'Register for 1-1 Recipe Consultation'}
              </h2>
              <p className="text-[#f8faf9]/80">
                {currentLang === 'vi'
                  ? 'Nhắn để nhận lịch & lộ trình phù hợp mục tiêu của bạn.'
                  : 'Message to receive schedule & roadmap suitable for your goals.'}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/culinary-consultation#contact"
                className="inline-flex items-center justify-center gap-3 bg-[#fcc56c] text-[#083121] px-6 py-3 font-semibold hover:bg-[#fcc56c]/90 transition-colors"
              >
                {currentLang === 'vi' ? 'Liên hệ tư vấn' : 'Contact for consultation'}
              </Link>
              <Link
                href="/workshop_booking1-1"
                className="inline-flex items-center justify-center gap-3 border-2 border-[#f8faf9] text-[#f8faf9] px-6 py-3 font-semibold hover:bg-[#f8faf9]/10 transition-colors"
              >
                {currentLang === 'vi' ? 'Đăng ký nhanh' : 'Quick register'}
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
