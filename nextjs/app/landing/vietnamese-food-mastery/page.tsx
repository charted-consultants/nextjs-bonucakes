'use client';

import { useLanguage } from '@/components/LanguageToggle';
import Link from 'next/link';
import { useEffect } from 'react';

export default function VietnameseFoodMasteryPage() {
  const currentLang = useLanguage();

  useEffect(() => {
    document.title = 'Mastery Món Việt | Bonu F&B';
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute(
        'content',
        'Bánh mì (pate, thịt nguội, chả), Phở, Trà sữa, các món Việt truyền thống. Công thức ổn định, chuẩn hóa để bán nhanh.'
      );
    }
  }, []);

  return (
    <>
      <header className="pt-24 md:pt-28 pb-10 bg-[#f8faf9] border-b border-[#083121]/10">
        <div className="max-w-5xl mx-auto px-6">
          <p className="text-[#fcc56c] uppercase tracking-widest text-sm mb-3 font-medium">
            Signature • {currentLang === 'vi' ? 'Theo nhu cầu' : 'Customized'}
          </p>
          <h1 className="text-3xl md:text-5xl font-bold text-[#083121] mb-4">
            {currentLang === 'vi' ? 'Mastery Món Việt' : 'Vietnamese Food Mastery'}
          </h1>
          <p className="text-lg text-[#4a5c52] max-w-3xl">
            {currentLang === 'vi'
              ? 'Bánh mì (pate, thịt nguội, chả), Phở, Trà sữa và các món Việt truyền thống. Công thức ổn định, quy trình hóa để bán nhanh, chuẩn vị theo nguyên liệu địa phương.'
              : 'Banh Mi (pate, cold cuts, cha), Pho, Milk tea and traditional Vietnamese dishes. Stable formulas, process-oriented for quick sales, flavor adjusted to local ingredients.'}
          </p>
          <div className="mt-6 flex flex-wrap gap-3 text-sm text-[#4a5c52]/80">
            <span className="px-3 py-1 bg-[#f8faf9] border border-[#083121]/10">
              {currentLang === 'vi' ? 'Chuẩn hóa chất lượng' : 'Quality standardization'}
            </span>
            <span className="px-3 py-1 bg-[#f8faf9] border border-[#083121]/10">
              {currentLang === 'vi' ? 'Tối ưu chi phí' : 'Cost optimization'}
            </span>
            <span className="px-3 py-1 bg-[#f8faf9] border border-[#083121]/10">
              {currentLang === 'vi' ? 'Phù hợp toàn cầu' : 'Suitable globally'}
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12">
        <section className="space-y-8 mb-10">
          <div className="bg-white border border-[#083121]/10 p-6">
            <h2 className="text-2xl font-bold text-[#083121] mb-4">
              {currentLang === 'vi' ? 'Bạn sẽ học' : 'What you will learn'}
            </h2>
            <ul className="space-y-3 text-[#4a5c52]">
              {currentLang === 'vi' ? (
                <>
                  <li>• Bánh mì: pate, thịt nguội, chả – công thức & quy trình set‑up.</li>
                  <li>• Phở: nước dùng chuẩn chỉnh, tối ưu nguyên liệu địa phương.</li>
                  <li>• Trà sữa: công thức bền vị, quy trình pha chế nhanh.</li>
                  <li>• Các món Việt truyền thống: chuẩn vị, dễ chuẩn hóa để training nhân viên; không phụ thuộc vào đầu bếp, không sợ mất nghề.</li>
                  <li>• Hệ thống hóa: SOP, bảo quản, đóng gói & vận hành.</li>
                </>
              ) : (
                <>
                  <li>• Banh Mi: pate, cold cuts, cha – formulas & setup process.</li>
                  <li>• Pho: precise broth, optimized local ingredients.</li>
                  <li>• Milk tea: stable flavor formula, quick brewing process.</li>
                  <li>• Traditional Vietnamese dishes: authentic flavor, easy to standardize for staff training; not dependent on chef, no fear of losing expertise.</li>
                  <li>• Systemization: SOP, storage, packaging & operations.</li>
                </>
              )}
            </ul>
          </div>
          <div className="bg-white border border-[#083121]/10 p-6">
            <h2 className="text-2xl font-bold text-[#083121] mb-4">
              {currentLang === 'vi' ? 'Hình thức học' : 'Learning format'}
            </h2>
            <ul className="space-y-3 text-[#4a5c52]">
              {currentLang === 'vi' ? (
                <>
                  <li>• Remote: test nguyên liệu tại chỗ, video hướng dẫn, support đến khi đạt.</li>
                  <li>• On‑site: đào tạo tại chỗ/đội ngũ; set‑up theo mô hình thực tế.</li>
                  <li>• Lịch: theo lịch hẹn; có gói video để ôn luyện.</li>
                </>
              ) : (
                <>
                  <li>• Remote: test local ingredients, video guides, support until achieved.</li>
                  <li>• On‑site: on-site training/team; setup according to actual model.</li>
                  <li>• Schedule: by appointment; video package for practice.</li>
                </>
              )}
            </ul>
            <p className="text-[#4a5c52]/70 mt-3 text-sm">
              {currentLang === 'vi'
                ? 'Chi phí theo module & địa điểm (on‑site tính thêm di chuyển/lưu trú).'
                : 'Cost by module & location (on‑site includes travel/accommodation).'}
            </p>
          </div>
        </section>

        <section className="grid md:grid-cols-3 gap-6 mb-10">
          <div className="bg-[#083121] text-[#f8faf9] p-6">
            <p className="text-3xl font-bold text-[#fcc56c] mb-1">3+</p>
            <p className="text-[#f8faf9]/80 text-sm">
              {currentLang === 'vi' ? 'Nhóm món cốt lõi' : 'Core dish groups'}
            </p>
          </div>
          <div className="bg-[#f8faf9] border border-[#083121]/10 p-6">
            <p className="text-[#083121] font-bold mb-1">
              {currentLang === 'vi' ? 'Menu linh hoạt' : 'Flexible menu'}
            </p>
            <p className="text-[#4a5c52]/80 text-sm">
              {currentLang === 'vi' ? 'Điều chỉnh theo tệp khách hàng' : 'Adjusted to customer base'}
            </p>
          </div>
          <div className="bg-[#f8faf9] border border-[#083121]/10 p-6">
            <p className="text-[#083121] font-bold mb-1">
              {currentLang === 'vi' ? 'Sẵn sàng bán' : 'Ready to sell'}
            </p>
            <p className="text-[#4a5c52]/80 text-sm">
              {currentLang === 'vi' ? 'Quy trình chuẩn hóa' : 'Standardized process'}
            </p>
          </div>
        </section>

        <section className="bg-white border border-[#083121]/10 p-6 md:p-8 mb-10">
          <h2 className="text-2xl font-bold text-[#083121] mb-4">
            {currentLang === 'vi' ? 'Lộ trình gợi ý' : 'Suggested roadmap'}
          </h2>
          <div className="md:hidden space-y-3">
            {currentLang === 'vi' ? (
              <>
                <div className="border border-[#083121]/10 p-3">
                  <p className="text-[#4a5c52]">
                    <span className="font-semibold">Bước 1:</span> Khảo sát thị trường & nguyên liệu địa phương.
                  </p>
                </div>
                <div className="border border-[#083121]/10 p-3">
                  <p className="text-[#4a5c52]">
                    <span className="font-semibold">Bước 2:</span> Chọn module ưu tiên: Bánh mì / Phở / Món truyền thống.
                  </p>
                </div>
                <div className="border border-[#083121]/10 p-3">
                  <p className="text-[#4a5c52]">
                    <span className="font-semibold">Bước 3:</span> Chuẩn hóa công thức + SOP sản xuất & phục vụ.
                  </p>
                </div>
                <div className="border border-[#083121]/10 p-3">
                  <p className="text-[#4a5c52]">
                    <span className="font-semibold">Bước 4:</span> Thử nghiệm bán nhỏ, đo lường, điều chỉnh.
                  </p>
                </div>
                <div className="border border-[#083121]/10 p-3">
                  <p className="text-[#4a5c52]">
                    <span className="font-semibold">Bước 5:</span> Chuẩn bị scale‑up: thiết bị, nhân sự, supply.
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="border border-[#083121]/10 p-3">
                  <p className="text-[#4a5c52]">
                    <span className="font-semibold">Step 1:</span> Survey market & local ingredients.
                  </p>
                </div>
                <div className="border border-[#083121]/10 p-3">
                  <p className="text-[#4a5c52]">
                    <span className="font-semibold">Step 2:</span> Choose priority module: Banh Mi / Pho / Traditional dishes.
                  </p>
                </div>
                <div className="border border-[#083121]/10 p-3">
                  <p className="text-[#4a5c52]">
                    <span className="font-semibold">Step 3:</span> Standardize formula + production & service SOP.
                  </p>
                </div>
                <div className="border border-[#083121]/10 p-3">
                  <p className="text-[#4a5c52]">
                    <span className="font-semibold">Step 4:</span> Test small sales, measure, adjust.
                  </p>
                </div>
                <div className="border border-[#083121]/10 p-3">
                  <p className="text-[#4a5c52]">
                    <span className="font-semibold">Step 5:</span> Prepare for scale‑up: equipment, staff, supply.
                  </p>
                </div>
              </>
            )}
          </div>
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="text-left bg-[#f8faf9]">
                  <th className="p-3 border border-[#083121]/10 w-24">
                    {currentLang === 'vi' ? 'Bước' : 'Step'}
                  </th>
                  <th className="p-3 border border-[#083121]/10">
                    {currentLang === 'vi' ? 'Nội dung' : 'Content'}
                  </th>
                </tr>
              </thead>
              <tbody className="text-[#4a5c52]">
                {currentLang === 'vi' ? (
                  <>
                    <tr>
                      <td className="p-3 border border-[#083121]/10">1</td>
                      <td className="p-3 border border-[#083121]/10">Khảo sát thị trường & nguyên liệu địa phương.</td>
                    </tr>
                    <tr className="bg-[#f8faf9]/50">
                      <td className="p-3 border border-[#083121]/10">2</td>
                      <td className="p-3 border border-[#083121]/10">Chọn module ưu tiên: Bánh mì / Phở / Món truyền thống.</td>
                    </tr>
                    <tr>
                      <td className="p-3 border border-[#083121]/10">3</td>
                      <td className="p-3 border border-[#083121]/10">Chuẩn hóa công thức + SOP sản xuất & phục vụ.</td>
                    </tr>
                    <tr className="bg-[#f8faf9]/50">
                      <td className="p-3 border border-[#083121]/10">4</td>
                      <td className="p-3 border border-[#083121]/10">Thử nghiệm bán nhỏ, đo lường, điều chỉnh.</td>
                    </tr>
                    <tr>
                      <td className="p-3 border border-[#083121]/10">5</td>
                      <td className="p-3 border border-[#083121]/10">Chuẩn bị scale‑up: thiết bị, nhân sự, supply.</td>
                    </tr>
                  </>
                ) : (
                  <>
                    <tr>
                      <td className="p-3 border border-[#083121]/10">1</td>
                      <td className="p-3 border border-[#083121]/10">Survey market & local ingredients.</td>
                    </tr>
                    <tr className="bg-[#f8faf9]/50">
                      <td className="p-3 border border-[#083121]/10">2</td>
                      <td className="p-3 border border-[#083121]/10">Choose priority module: Banh Mi / Pho / Traditional dishes.</td>
                    </tr>
                    <tr>
                      <td className="p-3 border border-[#083121]/10">3</td>
                      <td className="p-3 border border-[#083121]/10">Standardize formula + production & service SOP.</td>
                    </tr>
                    <tr className="bg-[#f8faf9]/50">
                      <td className="p-3 border border-[#083121]/10">4</td>
                      <td className="p-3 border border-[#083121]/10">Test small sales, measure, adjust.</td>
                    </tr>
                    <tr>
                      <td className="p-3 border border-[#083121]/10">5</td>
                      <td className="p-3 border border-[#083121]/10">Prepare for scale‑up: equipment, staff, supply.</td>
                    </tr>
                  </>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Narrative: triết lý triển khai */}
        <section className="bg-[#f8faf9] border border-[#083121]/10 p-6 md:p-8 mb-10">
          <h2 className="text-2xl font-bold text-[#083121] mb-4">
            {currentLang === 'vi' ? 'Làm đúng theo giai đoạn' : 'Do it right by phases'}
          </h2>
          <p className="text-[#4a5c52] mb-3">
            {currentLang === 'vi'
              ? 'Mastery không phải nhồi nhiều món cùng lúc. Bo ưu tiên một nhóm món, chuẩn hóa thật tốt (công thức + SOP + bảo quản), thử bán nhỏ, đo lường rồi mới mở rộng. Cách làm này giúp bạn tránh lãng phí và tăng xác suất thành công.'
              : "Mastery isn't cramming many dishes at once. Bo prioritizes one dish group, standardizes well (formula + SOP + storage), tests small sales, measures, then expands. This approach helps you avoid waste and increase success probability."}
          </p>
          <p className="text-[#4a5c52]">
            {currentLang === 'vi'
              ? 'Mỗi địa phương có nguyên liệu khác nhau – Bo hiệu chỉnh theo thực tế để ra vị chuẩn và quy trình hợp bếp của bạn.'
              : 'Each location has different ingredients – Bo adjusts according to reality to achieve authentic flavor and process suitable for your kitchen.'}
          </p>
        </section>

        {/* Outcomes & mini cases */}
        <section className="grid md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white border border-[#083121]/10 p-6">
            <h3 className="font-semibold text-[#083121] mb-2">
              {currentLang === 'vi' ? 'Kết quả mong đợi' : 'Expected results'}
            </h3>
            <ul className="list-disc pl-5 text-[#4a5c52] space-y-1">
              {currentLang === 'vi' ? (
                <>
                  <li>Menu khởi điểm phù hợp tệp khách</li>
                  <li>Công thức ổn định, SOP rõ ràng</li>
                  <li>Kế hoạch thử bán/đo lường cụ thể</li>
                </>
              ) : (
                <>
                  <li>Starting menu suitable for customer base</li>
                  <li>Stable formula, clear SOP</li>
                  <li>Specific test sales/measurement plan</li>
                </>
              )}
            </ul>
          </div>
          <div className="bg-white border border-[#083121]/10 p-6">
            <h3 className="font-semibold text-[#083121] mb-2">
              {currentLang === 'vi' ? 'Khi mở rộng' : 'When expanding'}
            </h3>
            <ul className="list-disc pl-5 text-[#4a5c52] space-y-1">
              {currentLang === 'vi' ? (
                <>
                  <li>Chuẩn hóa supply và cost</li>
                  <li>Training nhanh cho nhân sự mới</li>
                  <li>Checklist QA theo ca</li>
                </>
              ) : (
                <>
                  <li>Standardize supply and cost</li>
                  <li>Quick training for new staff</li>
                  <li>QA checklist per shift</li>
                </>
              )}
            </ul>
          </div>
          <div className="bg-white border border-[#083121]/10 p-6">
            <h3 className="font-semibold text-[#083121] mb-2">
              {currentLang === 'vi' ? 'Case ngắn' : 'Case studies'}
            </h3>
            <ul className="list-disc pl-5 text-[#4a5c52] space-y-1">
              {currentLang === 'vi' ? (
                <>
                  <li>UK: bánh mì – đồng bộ pate/thịt nguội theo supply</li>
                  <li>EU: phở – tối ưu xương/giò theo giá địa phương</li>
                  <li>APAC: trà nền… (nếu chọn module đồ uống)</li>
                </>
              ) : (
                <>
                  <li>UK: banh mi – synchronize pate/cold cuts with supply</li>
                  <li>EU: pho – optimize bones/trotters to local prices</li>
                  <li>APAC: tea base… (if beverage module chosen)</li>
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
              ? 'Mastery là xây nền móng để vận hành bền vững, không chạy theo mốt nhất thời. Bên cạnh kỹ năng nấu ngon, bạn cần tư duy vận hành đúng.'
              : 'Mastery is building foundation for sustainable operations, not chasing temporary trends. Besides cooking skills, you need proper operational mindset.'}
          </p>
          <ul className="list-disc pl-5 text-[#4a5c52] space-y-1">
            {currentLang === 'vi' ? (
              <>
                <li>Nắm đúng khách hàng mục tiêu và hành vi mua</li>
                <li>Quy trình đào tạo/động lực cho nhân sự</li>
                <li>Quản trị hàng hóa/nguyên liệu, cost & định giá</li>
                <li>SOP theo ca, checklist kiểm soát chất lượng</li>
                <li>Thiết kế menu kể câu chuyện thương hiệu</li>
              </>
            ) : (
              <>
                <li>Identify target customers and buying behavior</li>
                <li>Training process/motivation for staff</li>
                <li>Inventory/ingredient management, cost & pricing</li>
                <li>Per-shift SOP, quality control checklist</li>
                <li>Menu design that tells brand story</li>
              </>
            )}
          </ul>
        </section>

        <section className="bg-[#083121] text-[#f8faf9] p-6 md:p-8">
          <div className="md:flex md:items-center md:justify-between gap-6">
            <div className="mb-4 md:mb-0">
              <h2 className="text-2xl font-bold mb-2">
                {currentLang === 'vi'
                  ? 'Đăng ký Mastery Món Việt'
                  : 'Register for Vietnamese Food Mastery'}
              </h2>
              <p className="text-[#f8faf9]/80">
                {currentLang === 'vi'
                  ? 'Nhận lộ trình module phù hợp và lịch học khả dụng.'
                  : 'Receive suitable module roadmap and available schedule.'}
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
