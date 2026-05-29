'use client';

import { useLanguage } from '@/components/LanguageToggle';
import Link from 'next/link';
import { useEffect } from 'react';

export default function SaltedEggSpongeCakePage() {
  const currentLang = useLanguage();

  useEffect(() => {
    document.title = 'Bông lan trứng muối - Signature Combo | Bonu F&B';
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute(
        'content',
        'Cốt bánh mềm mịn, để tủ 1 tuần vẫn ngon. Trứng muối nướng bùi thơm, chà bông chuẩn, 4 loại sốt đặc biệt. Học xong bán được ngay.'
      );
    }
  }, []);

  return (
    <>
      {/* Hero */}
      <header className="pt-24 md:pt-28 pb-10 bg-[#f8faf9] border-b border-[#083121]/10">
        <div className="max-w-5xl mx-auto px-6">
          <p className="text-[#fcc56c] uppercase tracking-widest text-sm mb-3 font-medium">
            Signature • {currentLang === 'vi' ? 'Trọn gói' : 'Full package'}
          </p>
          <h1 className="text-3xl md:text-5xl font-bold text-[#083121] mb-4">
            {currentLang === 'vi'
              ? 'Bông lan trứng muối – Signature Combo'
              : 'Salted Egg Sponge Cake – Signature Combo'}
          </h1>
          <p className="text-lg text-[#4a5c52] max-w-3xl">
            {currentLang === 'vi'
              ? 'Cốt bánh mềm mịn tan trong miệng, để qua đêm vẫn ngon, để tủ 1 tuần vẫn ổn (không chất bảo quản). Trứng muối nướng bùi thơm. Chà bông chuẩn. 4 loại sốt đặc biệt. Học xong bán được ngay.'
              : 'Soft sponge melts in mouth, stays delicious overnight, lasts 1 week in fridge (no preservatives). Roasted salted egg with rich aroma. Premium pork floss. 4 special sauces. Ready to sell after learning.'}
          </p>
          <div className="mt-6 flex flex-wrap gap-3 text-sm text-[#4a5c52]/80">
            <span className="px-3 py-1 bg-[#f8faf9] border border-[#083121]/10">
              {currentLang === 'vi' ? 'Công thức ổn định' : 'Stable formula'}
            </span>
            <span className="px-3 py-1 bg-[#f8faf9] border border-[#083121]/10">
              {currentLang === 'vi' ? 'Ăn lạnh vẫn ngon' : 'Delicious when cold'}
            </span>
            <span className="px-3 py-1 bg-[#f8faf9] border border-[#083121]/10">
              {currentLang === 'vi' ? 'Không chất bảo quản' : 'No preservatives'}
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12">
        {/* What you learn */}
        <section className="space-y-8 mb-10">
          <div className="bg-white border border-[#083121]/10 p-6">
            <h2 className="text-2xl font-bold text-[#083121] mb-4">
              {currentLang === 'vi' ? 'Bạn sẽ học' : 'What you will learn'}
            </h2>
            <ul className="space-y-3 text-[#4a5c52]">
              {currentLang === 'vi' ? (
                <>
                  <li>• Cốt bánh: kỹ thuật đánh trứng, phối bột, nướng chuẩn để đạt cấu trúc mềm mịn, đứng form.</li>
                  <li>• Bảo quản: giữ ẩm – giữ form để qua đêm/1 tuần tủ lạnh vẫn ngon.</li>
                  <li>• Trứng muối nướng: xử lý mùi, nướng chuẩn độ bùi, không hắc.</li>
                  <li>• Chà bông chuẩn: cách làm/chuẩn bị để topping không ỉu.</li>
                  <li>• 4 loại sốt đặc biệt: cân bằng vị mặn – béo – ngọt – umami.</li>
                  <li>• Set‑up quy trình: từ prep đến hoàn thiện, đóng gói bán.</li>
                </>
              ) : (
                <>
                  <li>• Sponge base: egg-beating technique, flour mixing, precise baking for soft structure that holds shape.</li>
                  <li>• Storage: maintaining moisture and form for overnight/1 week refrigeration.</li>
                  <li>• Roasted salted egg: removing smell, roasting to perfect richness, no bitterness.</li>
                  <li>• Premium pork floss: preparation to keep topping crispy.</li>
                  <li>• 4 special sauces: balancing salty – rich – sweet – umami.</li>
                  <li>• Process setup: from prep to finishing, packaging for sale.</li>
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
                  <li>• Remote: gửi ảnh/nguyên liệu địa phương, nhận video hướng dẫn chi tiết, hỗ trợ tới khi ra thành phẩm.</li>
                  <li>• Trực tiếp/on‑site: học thực chiến tại bếp của Bo hoặc Bo đến đào tạo đội ngũ tại chỗ.</li>
                  <li>• Lịch lớp: theo lịch hẹn; có gói video quay sẵn để ôn luyện.</li>
                </>
              ) : (
                <>
                  <li>• Remote: send photos/local ingredients, receive detailed video guide, support until finished product.</li>
                  <li>• Direct/on‑site: hands-on learning at Bo's kitchen or Bo comes to train your team on-site.</li>
                  <li>• Schedule: by appointment; video package available for practice.</li>
                </>
              )}
            </ul>
            <p className="text-[#4a5c52]/70 mt-3 text-sm">
              {currentLang === 'vi'
                ? 'Chi phí tùy theo mức tuỳ chỉnh và địa điểm (on‑site tính thêm di chuyển/lưu trú).'
                : 'Cost depends on customization level and location (on‑site includes travel/accommodation).'}
            </p>
          </div>
        </section>

        {/* Proof & outcomes */}
        <section className="grid md:grid-cols-3 gap-6 mb-10">
          <div className="bg-[#083121] text-[#f8faf9] p-6">
            <p className="text-3xl font-bold text-[#fcc56c] mb-1">10+</p>
            <p className="text-[#f8faf9]/80 text-sm">
              {currentLang === 'vi' ? 'Năm kinh nghiệm & triển khai' : 'Years of experience & implementation'}
            </p>
          </div>
          <div className="bg-[#f8faf9] border border-[#083121]/10 p-6">
            <p className="text-[#083121] font-bold mb-1">
              {currentLang === 'vi' ? 'Ổn định chất lượng' : 'Stable quality'}
            </p>
            <p className="text-[#4a5c52]/80 text-sm">
              {currentLang === 'vi' ? 'Ăn lạnh vẫn ngon, giao hàng an tâm' : 'Delicious when cold, reliable delivery'}
            </p>
          </div>
          <div className="bg-[#f8faf9] border border-[#083121]/10 p-6">
            <p className="text-[#083121] font-bold mb-1">
              {currentLang === 'vi' ? 'Sẵn sàng bán' : 'Ready to sell'}
            </p>
            <p className="text-[#4a5c52]/80 text-sm">
              {currentLang === 'vi' ? 'Quy trình chuẩn hóa để ra doanh thu nhanh' : 'Standardized process for quick revenue'}
            </p>
          </div>
        </section>

        {/* Syllabus */}
        <section className="bg-white border border-[#083121]/10 p-6 md:p-8 mb-10">
          <h2 className="text-2xl font-bold text-[#083121] mb-4">
            {currentLang === 'vi' ? 'Syllabus chi tiết' : 'Detailed syllabus'}
          </h2>
          {/* Mobile stacked */}
          <div className="md:hidden space-y-3">
            {currentLang === 'vi' ? (
              <>
                <div className="border border-[#083121]/10 p-3">
                  <p className="text-[#4a5c52]">
                    <span className="font-semibold">Bước 1:</span> Chuẩn bị nguyên liệu & dụng cụ, tiêu chuẩn kiểm tra.
                  </p>
                </div>
                <div className="border border-[#083121]/10 p-3">
                  <p className="text-[#4a5c52]">
                    <span className="font-semibold">Bước 2:</span> Kỹ thuật cốt bánh: demo + thực hành + sai thường gặp.
                  </p>
                </div>
                <div className="border border-[#083121]/10 p-3">
                  <p className="text-[#4a5c52]">
                    <span className="font-semibold">Bước 3:</span> Trứng muối nướng & xử lý mùi, độ bùi, độ ẩm.
                  </p>
                </div>
                <div className="border border-[#083121]/10 p-3">
                  <p className="text-[#4a5c52]">
                    <span className="font-semibold">Bước 4:</span> Chà bông & 4 sốt đặc biệt: công thức + bảo quản.
                  </p>
                </div>
                <div className="border border-[#083121]/10 p-3">
                  <p className="text-[#4a5c52]">
                    <span className="font-semibold">Bước 5:</span> Hoàn thiện thành phẩm, đóng gói & bảo quản.
                  </p>
                </div>
                <div className="border border-[#083121]/10 p-3">
                  <p className="text-[#4a5c52]">
                    <span className="font-semibold">Bước 6:</span> Quy trình vận hành nhỏ gọn để bán online/offline.
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="border border-[#083121]/10 p-3">
                  <p className="text-[#4a5c52]">
                    <span className="font-semibold">Step 1:</span> Prepare ingredients & tools, quality standards.
                  </p>
                </div>
                <div className="border border-[#083121]/10 p-3">
                  <p className="text-[#4a5c52]">
                    <span className="font-semibold">Step 2:</span> Sponge technique: demo + practice + common mistakes.
                  </p>
                </div>
                <div className="border border-[#083121]/10 p-3">
                  <p className="text-[#4a5c52]">
                    <span className="font-semibold">Step 3:</span> Roasted salted egg & odor treatment, richness, moisture.
                  </p>
                </div>
                <div className="border border-[#083121]/10 p-3">
                  <p className="text-[#4a5c52]">
                    <span className="font-semibold">Step 4:</span> Pork floss & 4 special sauces: formula + storage.
                  </p>
                </div>
                <div className="border border-[#083121]/10 p-3">
                  <p className="text-[#4a5c52]">
                    <span className="font-semibold">Step 5:</span> Finishing product, packaging & storage.
                  </p>
                </div>
                <div className="border border-[#083121]/10 p-3">
                  <p className="text-[#4a5c52]">
                    <span className="font-semibold">Step 6:</span> Compact operation process for online/offline sales.
                  </p>
                </div>
              </>
            )}
          </div>
          {/* Desktop table */}
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
                      <td className="p-3 border border-[#083121]/10">Chuẩn bị nguyên liệu & dụng cụ, tiêu chuẩn kiểm tra.</td>
                    </tr>
                    <tr className="bg-[#f8faf9]/50">
                      <td className="p-3 border border-[#083121]/10">2</td>
                      <td className="p-3 border border-[#083121]/10">Kỹ thuật cốt bánh: demo + thực hành + sai thường gặp.</td>
                    </tr>
                    <tr>
                      <td className="p-3 border border-[#083121]/10">3</td>
                      <td className="p-3 border border-[#083121]/10">Trứng muối nướng & xử lý mùi, độ bùi, độ ẩm.</td>
                    </tr>
                    <tr className="bg-[#f8faf9]/50">
                      <td className="p-3 border border-[#083121]/10">4</td>
                      <td className="p-3 border border-[#083121]/10">Chà bông & 4 sốt đặc biệt: công thức + bảo quản.</td>
                    </tr>
                    <tr>
                      <td className="p-3 border border-[#083121]/10">5</td>
                      <td className="p-3 border border-[#083121]/10">Hoàn thiện thành phẩm, đóng gói & bảo quản.</td>
                    </tr>
                    <tr className="bg-[#f8faf9]/50">
                      <td className="p-3 border border-[#083121]/10">6</td>
                      <td className="p-3 border border-[#083121]/10">Quy trình vận hành nhỏ gọn để bán online/offline.</td>
                    </tr>
                  </>
                ) : (
                  <>
                    <tr>
                      <td className="p-3 border border-[#083121]/10">1</td>
                      <td className="p-3 border border-[#083121]/10">Prepare ingredients & tools, quality standards.</td>
                    </tr>
                    <tr className="bg-[#f8faf9]/50">
                      <td className="p-3 border border-[#083121]/10">2</td>
                      <td className="p-3 border border-[#083121]/10">Sponge technique: demo + practice + common mistakes.</td>
                    </tr>
                    <tr>
                      <td className="p-3 border border-[#083121]/10">3</td>
                      <td className="p-3 border border-[#083121]/10">Roasted salted egg & odor treatment, richness, moisture.</td>
                    </tr>
                    <tr className="bg-[#f8faf9]/50">
                      <td className="p-3 border border-[#083121]/10">4</td>
                      <td className="p-3 border border-[#083121]/10">Pork floss & 4 special sauces: formula + storage.</td>
                    </tr>
                    <tr>
                      <td className="p-3 border border-[#083121]/10">5</td>
                      <td className="p-3 border border-[#083121]/10">Finishing product, packaging & storage.</td>
                    </tr>
                    <tr className="bg-[#f8faf9]/50">
                      <td className="p-3 border border-[#083121]/10">6</td>
                      <td className="p-3 border border-[#083121]/10">Compact operation process for online/offline sales.</td>
                    </tr>
                  </>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Founder note / narrative */}
        <section className="bg-[#f8faf9] border border-[#083121]/10 p-6 md:p-8 mb-10">
          <h2 className="text-2xl font-bold text-[#083121] mb-4">
            {currentLang === 'vi' ? 'Vì sao combo này hiệu quả?' : 'Why is this combo effective?'}
          </h2>
          <p className="text-[#4a5c52] mb-3">
            {currentLang === 'vi'
              ? 'Bo đã bán bánh online nhiều năm trước khi mở tiệm đầu tiên ở London. Những lần giao xa, bảo quản qua đêm hay để tủ lạnh đều buộc công thức phải ổn định, ăn lạnh vẫn ngon. Bộ công thức này được mài dũa từ bối cảnh thật như vậy – nên khi bạn triển khai bán, tỉ lệ ổn định rất cao.'
              : 'Bo sold cakes online for many years before opening the first shop in London. Long-distance delivery, overnight storage, and refrigeration all required a stable formula that tastes good when cold. This recipe set was refined from such real contexts – so when you implement sales, the success rate is very high.'}
          </p>
          <p className="text-[#4a5c52]">
            {currentLang === 'vi'
              ? 'Mục tiêu không chỉ là làm được một chiếc bánh ngon, mà là làm được đều để biến kiến thức thành dòng tiền bền vững.'
              : 'The goal is not just to make one delicious cake, but to make it consistently to turn knowledge into sustainable cash flow.'}
          </p>
        </section>

        {/* Outcomes */}
        <section className="grid md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white border border-[#083121]/10 p-6">
            <h3 className="font-semibold text-[#083121] mb-2">
              {currentLang === 'vi' ? 'Kết quả mong đợi (2–4 tuần)' : 'Expected results (2–4 weeks)'}
            </h3>
            <ul className="list-disc pl-5 text-[#4a5c52] space-y-1">
              {currentLang === 'vi' ? (
                <>
                  <li>Ra thành phẩm đạt chuẩn cảm quan</li>
                  <li>Quy trình hóa từ prep đến hoàn thiện</li>
                  <li>Checklist bảo quản và giao hàng</li>
                </>
              ) : (
                <>
                  <li>Finished product meets sensory standards</li>
                  <li>Process from prep to completion</li>
                  <li>Storage and delivery checklist</li>
                </>
              )}
            </ul>
          </div>
          <div className="bg-white border border-[#083121]/10 p-6">
            <h3 className="font-semibold text-[#083121] mb-2">
              {currentLang === 'vi' ? 'Khi scale up' : 'When scaling up'}
            </h3>
            <ul className="list-disc pl-5 text-[#4a5c52] space-y-1">
              {currentLang === 'vi' ? (
                <>
                  <li>Batch lớn giữ form – giữ ẩm ổn định</li>
                  <li>Kiểm soát cost/từng thành phần</li>
                  <li>Thiết lập tiêu chuẩn QA nhanh</li>
                </>
              ) : (
                <>
                  <li>Large batches maintain form and moisture</li>
                  <li>Control cost per component</li>
                  <li>Quick QA standard setup</li>
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
                  <li>Na Uy: tối ưu lò gia dụng → form đứng hơn</li>
                  <li>Mỹ: điều chỉnh bột khác protein → mềm mịn</li>
                  <li>Pháp: giao lạnh 24h vẫn giữ cấu trúc</li>
                </>
              ) : (
                <>
                  <li>Norway: optimize home oven → better shape retention</li>
                  <li>USA: adjust flour protein → softer texture</li>
                  <li>France: 24h cold delivery maintains structure</li>
                </>
              )}
            </ul>
          </div>
        </section>

        {/* Mini FAQ */}
        <section className="bg-white border border-[#083121]/10 p-6 md:p-8 mb-10">
          <h2 className="text-2xl font-bold text-[#083121] mb-4">
            {currentLang === 'vi' ? 'FAQ ngắn' : 'Quick FAQ'}
          </h2>
          <details className="mb-3">
            <summary className="font-semibold text-[#083121] cursor-pointer">
              {currentLang === 'vi' ? 'Dùng lò gia dụng có được không?' : 'Can I use a home oven?'}
            </summary>
            <p className="text-[#4a5c52] mt-2">
              {currentLang === 'vi'
                ? 'Được. Bo sẽ hiệu chỉnh profile nhiệt cho lò của bạn.'
                : 'Yes. Bo will adjust the heat profile for your oven.'}
            </p>
          </details>
          <details className="mb-3">
            <summary className="font-semibold text-[#083121] cursor-pointer">
              {currentLang === 'vi' ? 'Ăn lạnh có bị khô?' : 'Does it dry out when cold?'}
            </summary>
            <p className="text-[#4a5c52] mt-2">
              {currentLang === 'vi'
                ? 'Công thức này tối ưu độ ẩm – ăn lạnh vẫn mềm, không bở.'
                : 'This formula optimizes moisture – stays soft when cold, not mushy.'}
            </p>
          </details>
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
              ? 'Khi bạn học với Bo, bạn không chỉ nhận công thức. Bạn còn được hướng dẫn tư duy làm nghề F&B để triển khai bền vững – dù là bán online hay vận hành nhà hàng.'
              : "When you learn with Bo, you don't just get recipes. You also get F&B professional mindset guidance for sustainable implementation – whether selling online or operating a restaurant."}
          </p>
          <ul className="list-disc pl-5 text-[#4a5c52] space-y-1">
            {currentLang === 'vi' ? (
              <>
                <li>Hiểu khách hàng của bạn, xây tệp khách trung thành</li>
                <li>Quản lý và tạo động lực cho nhân sự</li>
                <li>Quản trị hàng hóa/nguyên liệu, kiểm soát chi phí</li>
                <li>Thiết lập quy trình vận hành (SOP) gọn và đo lường được</li>
                <li>Mỗi món "nói" điều gì về thương hiệu – cách kể câu chuyện bằng sản phẩm</li>
              </>
            ) : (
              <>
                <li>Understand your customers, build loyal customer base</li>
                <li>Manage and motivate staff</li>
                <li>Manage inventory/ingredients, control costs</li>
                <li>Establish compact and measurable operating procedures (SOP)</li>
                <li>What each dish "says" about the brand – storytelling through products</li>
              </>
            )}
          </ul>
        </section>

        {/* Questions to scope */}
        <section className="bg-[#f8faf9] border border-[#083121]/10 p-6 md:p-8 mb-10">
          <h2 className="text-2xl font-bold text-[#083121] mb-4">
            {currentLang === 'vi' ? 'Câu hỏi để chốt lộ trình' : 'Questions to determine roadmap'}
          </h2>
          <ul className="list-disc pl-6 text-[#4a5c52] space-y-2">
            {currentLang === 'vi' ? (
              <>
                <li>Mục tiêu 3–6 tháng (doanh thu/sản phẩm/hệ thống)?</li>
                <li>Thị trường & nguyên liệu địa phương của bạn?</li>
                <li>Khối lượng sản xuất/ngày và hình thức bán?</li>
                <li>Thiết bị/nhân sự hiện có? Cần bổ sung gì?</li>
              </>
            ) : (
              <>
                <li>3–6 month goals (revenue/product/system)?</li>
                <li>Your market & local ingredients?</li>
                <li>Daily production volume and sales format?</li>
                <li>Current equipment/staff? What needs to be added?</li>
              </>
            )}
          </ul>
        </section>

        {/* CTA */}
        <section id="cta" className="bg-[#083121] text-[#f8faf9] p-6 md:p-8">
          <div className="md:flex md:items-center md:justify-between gap-6">
            <div className="mb-4 md:mb-0">
              <h2 className="text-2xl font-bold mb-2">
                {currentLang === 'vi'
                  ? 'Đăng ký học Bông lan trứng muối'
                  : 'Register for Salted Egg Sponge Cake'}
              </h2>
              <p className="text-[#f8faf9]/80">
                {currentLang === 'vi'
                  ? 'Nhắn để nhận lịch sớm nhất và lộ trình phù hợp nguyên liệu nơi bạn sống.'
                  : 'Message to receive earliest schedule and roadmap suitable for your local ingredients.'}
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
