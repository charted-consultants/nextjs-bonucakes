'use client';

import { useLanguage } from '@/components/LanguageToggle';
import Link from 'next/link';
import { useEffect } from 'react';

export default function MilkTeaProgramPage() {
  const currentLang = useLanguage();

  useEffect(() => {
    document.title = 'Chương trình Trà sữa độc quyền | Bonu F&B';
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute(
        'content',
        'Thiết kế menu trà sữa độc bản cho quán bạn: nền công thức vững, syrup/topping chuẩn, mix‑flavor tạo vị riêng. Kinh nghiệm thực chiến từ Trung Quốc, Thượng Hải, Đài Loan và chuỗi Nhật.'
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
            {currentLang === 'vi'
              ? 'Chương trình Trà sữa độc quyền'
              : 'Milk Tea Signature Program'}
          </h1>
          <p className="text-lg text-[#4a5c52] max-w-3xl">
            {currentLang === 'vi'
              ? 'Thiết kế menu trà sữa độc bản cho quán bạn: nền công thức vững, syrup/topping chuẩn, mix‑flavor tạo vị riêng. Kinh nghiệm thực chiến từ Trung Quốc (Thượng Hải), Đài Loan và chuỗi Nhật.'
              : 'Design unique milk tea menu for your shop: solid base formulas, proper syrups/toppings, signature flavor mixing. Hands-on experience from China (Shanghai), Taiwan and Japanese chains.'}
          </p>
          <div className="mt-6 flex flex-wrap gap-3 text-sm text-[#4a5c52]/80">
            <span className="px-3 py-1 bg-[#f8faf9] border border-[#083121]/10">
              {currentLang === 'vi' ? 'Vị riêng của quán' : 'Shop signature flavor'}
            </span>
            <span className="px-3 py-1 bg-[#f8faf9] border border-[#083121]/10">
              {currentLang === 'vi' ? 'Ổn định – chuẩn hóa' : 'Stable – standardized'}
            </span>
            <span className="px-3 py-1 bg-[#f8faf9] border border-[#083121]/10">
              {currentLang === 'vi' ? 'Phù hợp nguyên liệu địa phương' : 'Suitable for local ingredients'}
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12">
        <section className="grid md:grid-cols-2 gap-8 mb-10">
          <div className="bg-white border border-[#083121]/10 p-6">
            <h2 className="text-2xl font-bold text-[#083121] mb-4">
              {currentLang === 'vi' ? 'Bạn sẽ nhận được' : 'What you will receive'}
            </h2>
            <ul className="space-y-3 text-[#4a5c52]">
              {currentLang === 'vi' ? (
                <>
                  <li>• Base công thức: trà, sữa, tỷ lệ chiết xuất – nền tảng ổn định.</li>
                  <li>• Syrup/Topping: công thức và quy trình chuẩn để không tách lớp.</li>
                  <li>• Mix‑flavor: thiết kế vị signature riêng, không "đụng hàng".</li>
                  <li>• Quy trình pha chế nhanh, kiểm soát chất lượng & cost.</li>
                  <li>• Setup menu theo phân khúc khách & location cụ thể.</li>
                </>
              ) : (
                <>
                  <li>• Base formulas: tea, milk, extraction ratios – stable foundation.</li>
                  <li>• Syrup/Topping: formulas and standard process to prevent separation.</li>
                  <li>• Mix‑flavor: design unique signature flavors, not "duplicate".</li>
                  <li>• Quick brewing process, quality & cost control.</li>
                  <li>• Menu setup by customer segment & specific location.</li>
                </>
              )}
            </ul>
          </div>
          <div className="bg-white border border-[#083121]/10 p-6">
            <h2 className="text-2xl font-bold text-[#083121] mb-4">
              {currentLang === 'vi' ? 'Kinh nghiệm triển khai' : 'Implementation experience'}
            </h2>
            <ul className="space-y-3 text-[#4a5c52]">
              {currentLang === 'vi' ? (
                <>
                  <li>• Đã học/đi làm ở Trung Quốc (Thượng Hải), Đài Loan, chuỗi Nhật.</li>
                  <li>• Là người đầu tiên tạo ra các vị trà sữa trứng muối trong cộng đồng VN/hoa ở London (tiệm Bonu).</li>
                  <li>• Thiết kế menu độc quyền theo quán, không sao chép.</li>
                </>
              ) : (
                <>
                  <li>• Studied/worked in China (Shanghai), Taiwan, Japanese chains.</li>
                  <li>• First to create salted egg milk tea flavors in VN/Chinese community in London (Bonu shop).</li>
                  <li>• Design signature menu per shop, no copying.</li>
                </>
              )}
            </ul>
            <p className="text-[#4a5c52]/70 mt-3 text-sm">
              {currentLang === 'vi'
                ? 'Chi phí theo độ tùy chỉnh & địa điểm (on‑site tính thêm di chuyển/lưu trú).'
                : 'Cost by customization level & location (on‑site includes travel/accommodation).'}
            </p>
          </div>
        </section>

        <section className="bg-white border border-[#083121]/10 p-6 md:p-8 mb-10">
          <h2 className="text-2xl font-bold text-[#083121] mb-4">
            {currentLang === 'vi' ? 'Quy trình làm việc' : 'Work process'}
          </h2>
          <ol className="list-decimal pl-6 text-[#4a5c52] space-y-2">
            {currentLang === 'vi' ? (
              <>
                <li>Khảo sát nguyên liệu địa phương (ảnh/website cửa hàng).</li>
                <li>Thiết kế base + syrup/topping + mix‑flavor signature.</li>
                <li>Thực hành, feedback, tinh chỉnh tới khi đạt.</li>
                <li>Chuẩn hóa SOP, kiểm soát chất lượng & chi phí.</li>
              </>
            ) : (
              <>
                <li>Survey local ingredients (photos/shop website).</li>
                <li>Design base + syrup/topping + signature mix‑flavor.</li>
                <li>Practice, feedback, refine until achieved.</li>
                <li>Standardize SOP, quality & cost control.</li>
              </>
            )}
          </ol>
        </section>

        {/* Narrative: khác biệt của chương trình */}
        <section className="bg-[#f8faf9] border border-[#083121]/10 p-6 md:p-8 mb-10">
          <h2 className="text-2xl font-bold text-[#083121] mb-4">
            {currentLang === 'vi'
              ? 'Tạo vị riêng – không "đụng hàng"'
              : 'Create unique flavor – not "duplicate"'}
          </h2>
          <p className="text-[#4a5c52] mb-3">
            {currentLang === 'vi'
              ? 'Bo từng học và làm việc tại Trung Quốc (Thượng Hải), Đài Loan, và chuỗi Nhật. Điểm mấu chốt không phải sao chép menu, mà là thiết kế nền công thức vững + hệ topping/syrup sạch, rồi mix‑flavor ra vị riêng cho quán bạn.'
              : 'Bo studied and worked in China (Shanghai), Taiwan, and Japanese chains. The key is not copying menus, but designing solid base formulas + clean topping/syrup systems, then mixing flavors for your shop\'s unique taste.'}
          </p>
          <p className="text-[#4a5c52]">
            {currentLang === 'vi'
              ? 'Kết quả là bạn có menu "ký tên", dễ chuẩn hóa và có khả năng scale.'
              : 'Result is you have a "signature" menu, easy to standardize and scalable.'}
          </p>
        </section>

        {/* Outcomes & examples */}
        <section className="mb-10">
          {/* Mobile stacked table replacement */}
          <div className="md:hidden space-y-3 mb-6">
            {currentLang === 'vi' ? (
              <>
                <div className="border border-[#083121]/10 p-3">
                  <p className="text-[#4a5c52]">
                    <span className="font-semibold">Base/Syrup/Topping:</span> Nền ổn định, không tách lớp
                  </p>
                </div>
                <div className="border border-[#083121]/10 p-3">
                  <p className="text-[#4a5c52]">
                    <span className="font-semibold">Signature:</span> 3–5 vị riêng
                  </p>
                </div>
                <div className="border border-[#083121]/10 p-3">
                  <p className="text-[#4a5c52]">
                    <span className="font-semibold">KPIs:</span> Thời gian pha, cost/ly, tỉ lệ lặp lại
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="border border-[#083121]/10 p-3">
                  <p className="text-[#4a5c52]">
                    <span className="font-semibold">Base/Syrup/Topping:</span> Stable base, no separation
                  </p>
                </div>
                <div className="border border-[#083121]/10 p-3">
                  <p className="text-[#4a5c52]">
                    <span className="font-semibold">Signature:</span> 3–5 unique flavors
                  </p>
                </div>
                <div className="border border-[#083121]/10 p-3">
                  <p className="text-[#4a5c52]">
                    <span className="font-semibold">KPIs:</span> Brewing time, cost/cup, repeat rate
                  </p>
                </div>
              </>
            )}
          </div>
          {/* Desktop 2-col table */}
          <div className="hidden md:block overflow-x-auto mb-6">
            <table className="w-full border-collapse">
              <thead>
                <tr className="text-left bg-[#f8faf9]">
                  <th className="p-3 border border-[#083121]/10 w-64">
                    {currentLang === 'vi' ? 'Hạng mục' : 'Category'}
                  </th>
                  <th className="p-3 border border-[#083121]/10">
                    {currentLang === 'vi' ? 'Chi tiết' : 'Details'}
                  </th>
                </tr>
              </thead>
              <tbody className="text-[#4a5c52]">
                {currentLang === 'vi' ? (
                  <>
                    <tr>
                      <td className="p-3 border border-[#083121]/10">Base/Syrup/Topping</td>
                      <td className="p-3 border border-[#083121]/10">Nền ổn định, không tách lớp, chuẩn hóa dễ</td>
                    </tr>
                    <tr className="bg-[#f8faf9]/50">
                      <td className="p-3 border border-[#083121]/10">Signature flavors</td>
                      <td className="p-3 border border-[#083121]/10">3–5 hương vị riêng do quán "ký tên"</td>
                    </tr>
                    <tr>
                      <td className="p-3 border border-[#083121]/10">KPIs</td>
                      <td className="p-3 border border-[#083121]/10">Thời gian pha/ly, cost/ly, tỉ lệ lặp lại</td>
                    </tr>
                  </>
                ) : (
                  <>
                    <tr>
                      <td className="p-3 border border-[#083121]/10">Base/Syrup/Topping</td>
                      <td className="p-3 border border-[#083121]/10">Stable base, no separation, easy standardization</td>
                    </tr>
                    <tr className="bg-[#f8faf9]/50">
                      <td className="p-3 border border-[#083121]/10">Signature flavors</td>
                      <td className="p-3 border border-[#083121]/10">3–5 unique flavors "signed" by shop</td>
                    </tr>
                    <tr>
                      <td className="p-3 border border-[#083121]/10">KPIs</td>
                      <td className="p-3 border border-[#083121]/10">Brewing time/cup, cost/cup, repeat rate</td>
                    </tr>
                  </>
                )}
              </tbody>
            </table>
          </div>
          <div className="bg-white border border-[#083121]/10 p-6 mb-6">
            <h3 className="font-semibold text-[#083121] mb-2">
              {currentLang === 'vi' ? 'Bạn sẽ có' : 'You will have'}
            </h3>
            <ul className="list-disc pl-5 text-[#4a5c52] space-y-1">
              {currentLang === 'vi' ? (
                <>
                  <li>Base công thức ổn định</li>
                  <li>Set syrup/topping chuẩn</li>
                  <li>3–5 hương vị signature</li>
                </>
              ) : (
                <>
                  <li>Stable base formula</li>
                  <li>Standard syrup/topping set</li>
                  <li>3–5 signature flavors</li>
                </>
              )}
            </ul>
          </div>
          <div className="bg-white border border-[#083121]/10 p-6">
            <h3 className="font-semibold text-[#083121] mb-2">
              {currentLang === 'vi' ? 'Ví dụ mix‑flavor' : 'Mix‑flavor examples'}
            </h3>
            <ul className="list-disc pl-5 text-[#4a5c52] space-y-1">
              {currentLang === 'vi' ? (
                <>
                  <li>Milk tea x salted egg foam (phiên bản sạch)</li>
                  <li>Trà đen rang x caramel muối cân bằng</li>
                  <li>Trà ô long x phô mai nhẹ không tách lớp</li>
                </>
              ) : (
                <>
                  <li>Milk tea x salted egg foam (clean version)</li>
                  <li>Roasted black tea x balanced salted caramel</li>
                  <li>Oolong tea x light cheese no separation</li>
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
              ? 'Menu tốt cần tư duy vận hành tốt để sống khỏe lâu dài.'
              : 'Good menu needs good operational mindset to thrive long-term.'}
          </p>
          <ul className="list-disc pl-5 text-[#4a5c52] space-y-1">
            {currentLang === 'vi' ? (
              <>
                <li>Khách hàng & tệp signature của quán</li>
                <li>Nhân sự pha chế: training nhanh, kiểm soát tay nghề</li>
                <li>Hàng hóa: syrup/topping, vòng đời & kiểm soát cost</li>
                <li>Quy trình: tốc độ pha/ly, chất lượng đồng nhất</li>
                <li>Định vị thương hiệu qua hương vị signature</li>
              </>
            ) : (
              <>
                <li>Customers & shop signature base</li>
                <li>Brewing staff: quick training, skill control</li>
                <li>Inventory: syrup/topping, lifecycle & cost control</li>
                <li>Process: brewing speed/cup, consistent quality</li>
                <li>Brand positioning through signature flavors</li>
              </>
            )}
          </ul>
        </section>

        <section className="bg-[#083121] text-[#f8faf9] p-6 md:p-8">
          <div className="md:flex md:items-center md:justify-between gap-6">
            <div className="mb-4 md:mb-0">
              <h2 className="text-2xl font-bold mb-2">
                {currentLang === 'vi'
                  ? 'Đăng ký chương trình Trà sữa độc quyền'
                  : 'Register for Milk Tea Signature Program'}
              </h2>
              <p className="text-[#f8faf9]/80">
                {currentLang === 'vi'
                  ? 'Nhắn để nhận lộ trình & lịch học phù hợp với quán của bạn.'
                  : 'Message to receive roadmap & schedule suitable for your shop.'}
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
