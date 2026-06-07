'use client';

import { useState, useEffect } from 'react';
import { COURSE_SLUG_BANH_MI_SAI_GON } from '@/lib/registration-types';

const SLUG = COURSE_SLUG_BANH_MI_SAI_GON;

// ── Dữ liệu nội dung (bespoke marketing copy, VI-only) ──
const FORWHOM = [
  { t: 'Muốn mở tiệm bánh mì hoặc quầy đồ ăn Việt', d: 'Chưa biết bắt đầu từ đâu thì học từ nền tảng: công thức, quy trình chuẩn bị, cách tính giá và cách bán món đầu tiên.' },
  { t: 'Muốn bán bánh mì online tại nhà', d: 'Bắt đầu từ căn bếp tại nhà, nhận pre-order, làm theo ngày cố định và thử thị trường trước khi đầu tư lớn.' },
  { t: 'Chủ quán đang tìm menu mới', d: 'Cần công thức ổn định, tính được giá thành, ra sản phẩm đẹp.' },
  { t: 'Muốn thêm bánh mì vào thực đơn', d: 'Với công thức chuẩn chuyên nghiệp, phù hợp để kinh doanh lâu dài.' },
  { t: 'Muốn học bài bản, hiểu nguyên lý', d: 'Thay vì chỉ làm theo video — nắm vững kỹ thuật để tự sửa lỗi và cải thiện.' },
];

const OUTCOMES = [
  { n: '01', t: 'Công thức & kỹ thuật chuẩn', d: 'Nắm vững từng bước làm sốt, nhân, chà bông — ra sản phẩm đồng đều, ổn định mỗi mẻ, đủ chuẩn bán.' },
  { n: '02', t: 'Tài liệu, video & nguồn nguyên liệu UK', d: 'Công thức bằng văn bản, video xem lại, danh sách nhà cung cấp tại UK và hướng dẫn đáp ứng tiêu chuẩn vệ sinh an toàn thực phẩm.' },
  { n: '03', t: 'Tính giá, định giá & kiểm soát chi phí', d: 'Hiểu food cost, biết lãi thực tế trên từng ổ bánh và định giá để bán có lãi, không bán theo cảm tính.' },
  { n: '04', t: 'Đóng gói, chụp ảnh & mở bán đầu tiên', d: 'Biết cách đóng gói, chụp ảnh thật đẹp, lên bài quảng cáo, nhận đơn và bán tại nhà, chợ, sự kiện hoặc popup.' },
  { n: '05', t: 'Hỗ trợ sau khoá & phát triển lâu dài', d: 'Được add vào nhóm hỗ trợ sau khoá. Khi sẵn sàng mở bán, Bo hỗ trợ quảng cáo trên fanpage Bonu Cakes hơn 6000 followers và đồng hành khi mở rộng menu.' },
];

const SESSIONS = [
  {
    title: 'Chuẩn bị sơ chế nguyên liệu',
    subtitle: '',
    desc: 'Trước khi động tay làm bánh, bạn cần hiểu nguyên liệu mình đang dùng. Phần này dạy bạn cách chọn đúng nguyên liệu tại UK — từ bột mì, thịt heo đến rau củ — và cách sơ chế chuẩn để mỗi mẻ ra lò đều ổn định. Bạn cũng học cách tính lượng nguyên liệu theo số đơn, tránh lãng phí và tối ưu chi phí ngay từ khâu đầu tiên.',
    tags: ['Sơ chế thịt heo', 'Rau củ & đồ chua thô', 'Tính định lượng theo đơn', 'Bảo quản nguyên liệu', 'Nhà cung cấp tin cậy'],
  },
  {
    title: '8 loại nhân thịt & Pâté',
    subtitle: 'Linh hồn của ổ bánh mì — phối vị đúng để khách ăn là nhớ',
    desc: 'Học pâté gan tự làm mịn, béo, đậm vị cùng các nhóm nhân thịt: giò lụa, chả thập cẩm, xá xíu, thịt nướng, bò nướng, gà quay và thịt nguội. Quan trọng nhất là biết phối vị để ổ bánh ăn hài hoà, không bị khô, không bị ngấy.',
    tags: ['Pâté gan', 'Giò lụa', 'Xá xíu', 'Thịt nướng', 'Bò nướng', 'Gà quay', 'Phối vị chuẩn'],
  },
  {
    title: 'Rau củ, đồ chua & 5 loại sốt',
    subtitle: 'Những yếu tố nhỏ tạo nên sự khác biệt lớn trong từng ổ bánh',
    desc: 'Cách làm đồ chua cà rốt, củ cải theo tỷ lệ chuẩn, hành phi giòn, mỡ heo và các loại sốt đặc trưng: bơ trứng, nước mắm ớt, dầu gừng, sốt thịt bầm đặc biệt. Bạn học cách bảo quản từng phần để bán trong ngày mà vẫn giữ được độ tươi ngon.',
    tags: ['Đồ chua', 'Hành phi', 'Bơ trứng', 'Nước mắm ớt', 'Sốt thịt bầm đặc biệt', 'Bảo quản'],
  },
  {
    title: 'Sản xuất, đóng gói & giao hàng',
    subtitle: 'Kẹp bánh đẹp, đóng gói đúng — khách mở ra là muốn đặt lại',
    desc: 'Học cách nấu số lượng lớn, chia mẻ, đóng gói, bảo quản và chuẩn bị đơn online. Bạn biết cách đóng gói để bánh mì không bị hấp hơi, không mềm ỉu và vẫn đẹp khi đến tay khách.',
    tags: ['Đóng gói', 'Nấu số lượng lớn', 'Pickup', 'Delivery', 'Đơn online'],
  },
  {
    title: 'Mở quán, chụp ảnh & vận hành',
    subtitle: 'Từ bếp nhà đến đơn hàng đầu tiên — bước qua trong tuần đầu tiên',
    desc: 'Tổng hợp toàn bộ quy trình để mở bán: chụp ảnh món ăn, lên menu, định giá, sắp xếp quầy, lịch chuẩn bị hằng ngày, quản lý nguyên liệu và phục vụ khách. Bạn cũng học cách xử lý phản hồi để giữ uy tín lâu dài.',
    tags: ['Menu bán hàng', 'Chụp ảnh món ăn', 'Pre-order', 'Quản lý nguyên liệu', 'Chăm khách'],
  },
];

const BONUS = [
  { t: 'Chỗ ở tại Saundersfoot', d: 'Được sắp xếp chỗ ở trong suốt 3 ngày học tại Saundersfoot, Wales — không cần lo tìm khách sạn hay di chuyển xa.' },
  { t: 'Toàn bộ nguyên liệu & dụng cụ', d: 'Mọi nguyên liệu thực hành trong 3 ngày đều được chuẩn bị sẵn. Bạn chỉ cần đến và học.' },
  { t: 'Tài liệu công thức bản in & PDF', d: 'Toàn bộ công thức, quy trình và danh sách nguyên liệu được đóng thành tập tài liệu để bạn mang về và dùng luôn khi mở bán.' },
  { t: 'Danh sách nhà cung cấp tại UK', d: 'Danh sách nguồn nguyên liệu chuẩn tại UK đã được Bo kiểm chứng qua nhiều năm — tiết kiệm hàng chục giờ tự tìm kiếm.' },
  { t: 'Hỗ trợ sau khoá qua điện thoại & video call', d: 'Bo theo sát sau khoá để giúp bạn sửa lỗi khi làm thật — cho đến khi bạn làm ra combo nhân đạt chuẩn để bán.' },
  { t: 'Hỗ trợ quảng cáo khi mở bán', d: 'Khi bạn sẵn sàng mở bán, Bo có thể hỗ trợ đăng bài trên fanpage Bonu Cakes với hơn 6,000 followers cộng đồng người Việt tại UK.' },
];

const FAQS = [
  { q: 'Tôi chưa biết làm bánh mì, có học được không?', a: 'Được. Khoá này tập trung vào nhân và sốt, không học làm vỏ bánh mì, nên bạn không cần có kinh nghiệm làm bánh trước đó.' },
  { q: 'Tôi cần chuẩn bị gì trước khi học?', a: 'Bạn cần chuẩn bị tinh thần thực hành liên tục, vì làm nhân và sốt cần luyện tay để ổn định vị. Quan trọng là biết sửa lỗi, làm lại và đi đúng quy trình.' },
  { q: 'Học xong có thể bán ngay không?', a: 'Có. Ngoài công thức bánh mì, bạn còn học cách định giá, đóng gói, đăng bài quảng cáo, nhận đơn đầu tiên và vận hành mô hình bán online tại nhà. Nếu sau này muốn mở tiệm hoặc quầy bánh mì, những phần này vẫn là nền tảng rất quan trọng.' },
  { q: 'Nếu về nhà làm bánh mì bị lỗi, có được Bo theo sát không?', a: 'Có. Bo theo sát sau khoá để bạn biết lỗi nằm ở nhân, sốt hay khâu chuẩn bị nào, cho đến khi bạn làm ra combo nhân đạt chuẩn để bán.' },
  { q: 'Tôi mới bắt đầu, chưa tự tin. Nếu đầu tư học phí cao mà không biết bao giờ hoàn vốn thì sao?', a: 'Đây là nỗi lo rất thật. Vì vậy khoá học không dừng ở công thức, mà còn chỉ bạn cách mở bán, nhận đơn và tính giá cho từng ổ bánh mì. Nếu làm đều, chăm khách nghiêm túc và đi đúng hướng, mục tiêu hoàn vốn sau 1 tháng mở bán là có thể đạt được.' },
  { q: 'Học phí bao gồm những gì?', a: 'Học phí bao gồm chỗ ở tại Saundersfoot, toàn bộ nguyên liệu, dụng cụ, tài liệu công thức, danh sách nhà cung cấp, hướng dẫn thiết bị khi mở quán và hỗ trợ sau khoá qua điện thoại hoặc video call.' },
  { q: 'Lịch học 3 ngày diễn ra như thế nào?', a: 'Ngày 1 tập trung vào chọn nguyên liệu, sơ chế và nền tảng sản xuất. Ngày 2 làm toàn bộ các phần chính: nhân thịt, pâté, đồ chua và nước sốt. Ngày 3 tổng hợp quy trình, chụp ảnh món ăn, đóng gói, lên menu và chuẩn bị kế hoạch mở bán.' },
  { q: 'Có thể học online thay vì trực tiếp không?', a: 'Khoá học được thiết kế để học trực tiếp 1-1 tại bếp Mémoire Saigon vì bạn cần thực hành tay trên nguyên liệu thật. Tuy nhiên nếu bạn ở xa và cần trao đổi trước, Bo có thể sắp xếp buổi tư vấn online để bàn thêm về lộ trình phù hợp.' },
];

const CHECKS = [
  'Tôi muốn có thêm thu nhập từ việc bán bánh mì nhưng chưa biết bắt đầu từ đâu.',
  'Tôi muốn bán bánh mì online tại nhà, không muốn đầu tư mặt bằng hay ôm vốn quá lớn ngay từ đầu.',
  'Tôi chưa tự tin vì sợ nhân chưa đúng vị, sốt chưa đạt chuẩn hoặc không biết cách phối để ổ bánh ngon để bán.',
  'Tôi sợ bỏ tiền học xong nhưng không biết cách hoàn vốn, không biết làm sao để có đơn hàng đầu tiên.',
  'Tôi muốn được chỉ cả cách định giá, đóng gói, quảng cáo và nhận đơn bánh mì, chứ không chỉ học công thức.',
  'Tôi cần người theo sát sau khoá học để sửa lỗi cho đến khi làm ra ổ bánh mì đạt chuẩn.',
  'Tôi muốn học mô hình bán bánh mì online tại nhà hoặc chuẩn bị vận hành tiệm bánh mì một cách bài bản.',
];

const FORMAT_OPTIONS = ['Trực tiếp tại bếp (UK)', 'Online', 'Hybrid, cả hai'];

function fmtPrice(n: number) {
  return '£' + n.toLocaleString('en-GB');
}

interface CourseInfo {
  price: number;
  duration: number;
  durationUnit: string;
  location: string | null;
  enrollmentOpen: boolean;
}

// Helper UI ────────────────────────────────────────────────
function SectionLabel({ children, light }: { children: React.ReactNode; light?: boolean }) {
  return (
    <p className={`uppercase tracking-[0.18em] text-xs font-semibold mb-3 ${light ? 'text-secondary' : 'text-secondary'}`}>
      {children}
    </p>
  );
}
function GoldLine() {
  return <div className="w-12 h-[3px] bg-secondary rounded-full mb-6" />;
}

export default function KhoaHocBanhMiPage() {
  const [info, setInfo] = useState<CourseInfo>({
    price: 5000,
    duration: 3,
    durationUnit: 'days',
    location: 'Brewery Terrace, SA69 9HG, Saundersfoot, UK',
    enrollmentOpen: true,
  });
  const [openSession, setOpenSession] = useState<number | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [checked, setChecked] = useState<boolean[]>(() => CHECKS.map(() => false));

  const [form, setForm] = useState({ name: '', email: '', phone: '', location: '', format: '', goal: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Đọc field "động" (giá/lịch/trạng thái) từ admin/courses qua API. Lỗi thì giữ mặc định.
  useEffect(() => {
    fetch(`/api/courses/${SLUG}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.course) {
          setInfo({
            price: d.course.price ?? 5000,
            duration: d.course.duration ?? 3,
            durationUnit: d.course.durationUnit ?? 'days',
            location: d.course.location,
            enrollmentOpen: d.course.enrollmentOpen ?? true,
          });
        }
      })
      .catch(() => {});
  }, []);

  const checkedCount = checked.filter(Boolean).length;
  const durationLabel = `${info.duration} ${info.durationUnit === 'days' ? 'ngày' : info.durationUnit === 'hours' ? 'giờ' : info.durationUnit}`;

  let scoreLabel = '', scoreTitle = '', scoreDesc = '', showScoreCta = false;
  if (checkedCount > 0) {
    if (checkedCount <= 2) {
      scoreLabel = `${checkedCount}/${CHECKS.length} · Đang cân nhắc`;
      scoreTitle = 'Bạn đang có những nỗi lo rất bình thường của người mới.';
      scoreDesc = 'Nếu còn sợ bánh mì làm ra chưa đạt, sợ học xong chưa biết bán thế nào hoặc chưa rõ cách hoàn vốn, bạn có thể nhắn cho Bo để nói chuyện trước.';
    } else if (checkedCount <= 4) {
      scoreLabel = `${checkedCount}/${CHECKS.length} · Đã có hướng đi`;
      scoreTitle = 'Bạn đã biết mình muốn gì, chỉ cần có người chỉ đúng cách.';
      scoreDesc = 'Bạn không chỉ cần công thức bánh mì, mà cần cách định giá, đóng gói, quảng cáo, nhận đơn và sửa lỗi khi làm thật.';
      showScoreCta = true;
    } else {
      scoreLabel = `${checkedCount}/${CHECKS.length} · Rất phù hợp`;
      scoreTitle = 'Bạn đã sẵn sàng bắt đầu nghiêm túc.';
      scoreDesc = 'Điều bạn cần lúc này là công thức bánh mì ổn định, cách bán rõ ràng, người theo sát sau khoá và một điểm tựa để tự tin mở đơn đầu tiên.';
      showScoreCta = true;
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch(`/api/courses/${SLUG}/enroll`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Có lỗi xảy ra, vui lòng thử lại.');
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const inputCls =
    'w-full border border-primary/20 rounded-lg px-4 py-3 text-primary placeholder-muted/70 focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary bg-white transition';

  return (
    <main className="bg-light text-primary">
      {/* ── HERO ── */}
      <section className="bg-primary text-white px-6 pt-20 pb-24 md:pt-28 md:pb-32 text-center">
        <div className="max-w-4xl mx-auto">
          <span className="inline-block border border-secondary/40 text-secondary text-xs md:text-sm tracking-wide rounded-full px-4 py-1.5 mb-8">
            Khoá truyền nghề bánh mì Sài Gòn cho người muốn kinh doanh tại UK
          </span>
          <h1 className="font-serif text-5xl md:text-7xl font-bold leading-tight mb-6">
            Bánh Mì <span className="text-secondary italic">Sài Gòn</span>
          </h1>
          <p className="text-white/80 text-lg max-w-2xl mx-auto mb-12">
            Học nhân, học cách bán và vận hành đơn hàng bài bản — từ người đã tự mở 3 nhà hàng tại Anh.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-white/10 rounded-xl overflow-hidden max-w-3xl mx-auto mb-12">
            {[
              { l: 'Học phí', v: fmtPrice(info.price) },
              { l: 'Thời gian', v: durationLabel },
              { l: 'Hình thức', v: 'Học trực tiếp 1-1' },
              { l: 'Địa điểm', v: info.location || 'Saundersfoot, UK' },
            ].map((s) => (
              <div key={s.l} className="bg-primary px-4 py-5">
                <div className="text-secondary/70 text-[11px] uppercase tracking-wider mb-1">{s.l}</div>
                <div className="text-secondary font-semibold text-sm leading-snug">{s.v}</div>
              </div>
            ))}
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="#dang-ky" className="bg-secondary text-primary font-bold px-8 py-3.5 rounded-lg hover:brightness-105 transition">
              Đăng ký khoá học
            </a>
            <a href="#chuong-trinh" className="border border-white/30 text-white px-8 py-3.5 rounded-lg hover:bg-white/10 transition">
              Xem chương trình
            </a>
          </div>
        </div>
      </section>

      {/* ── STORY ── */}
      <section className="px-6 py-20 md:py-28">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div className="bg-primary text-white rounded-2xl p-8 md:p-10">
            <div className="grid grid-cols-3 gap-4 mb-8 text-center">
              {[
                { n: '3', l: 'Nhà hàng đã tự mở tại UK' },
                { n: '8+', l: 'Loại nhân bánh mì trong khoá học' },
                { n: '3', l: 'Ngày học · trực tiếp 1-1' },
              ].map((s) => (
                <div key={s.l}>
                  <div className="text-secondary text-3xl font-bold">{s.n}</div>
                  <div className="text-white/70 text-xs mt-1">{s.l}</div>
                </div>
              ))}
            </div>
            <div className="text-xl font-semibold leading-snug mb-3">
              Học từ người thật, việc thật, đã thành công từ bán online cho đến mở nhà hàng.
            </div>
            <p className="text-white/60 text-sm">Không phải lý thuyết từ lớp học. Mà là kinh nghiệm từ bếp thật.</p>
          </div>
          <div>
            <SectionLabel>Tại sao khoá học này</SectionLabel>
            <GoldLine />
            <p className="font-serif text-2xl md:text-3xl font-bold mb-4">Học xong làm được ngay.</p>
            <p className="text-muted leading-relaxed mb-4">
              Tại nhà hàng Bo bán như thế nào là dạy bạn <strong className="text-primary">y chang như vậy</strong>. Không giấu nghề — bạn tự tay làm hết tất cả từ A đến Z theo <strong className="text-primary">công thức chuẩn</strong>.
            </p>
            <p className="text-muted leading-relaxed mb-4">
              Trong 3 ngày học 1-1, bạn làm từ những phần quan trọng nhất: <strong className="text-primary">pâté gan, giò lụa, chả thập cẩm, xá xíu, thịt nướng, bò nướng, gà quay</strong>, đồ chua, bơ trứng, nước mắm ớt, dầu gừng và sốt thịt bầm đặc biệt.
            </p>
            <p className="text-sm text-muted bg-secondary/10 border-l-4 border-secondary rounded-r-lg p-4">
              Học phí đã bao gồm chỗ ở tại Saundersfoot, toàn bộ nguyên liệu, dụng cụ, tài liệu công thức, danh sách nhà cung cấp và hỗ trợ sau khoá qua điện thoại hoặc video call.
            </p>
          </div>
        </div>
      </section>

      {/* ── INSTRUCTOR ── */}
      <section id="giang-vien" className="px-6 py-20 md:py-28 bg-white">
        <div className="max-w-6xl mx-auto grid md:grid-cols-[340px_1fr] gap-12 items-start">
          <div className="bg-light border border-primary/10 rounded-2xl p-8 text-center">
            <div className="w-24 h-24 rounded-full bg-primary text-secondary font-serif text-4xl font-bold flex items-center justify-center mx-auto mb-5">B</div>
            <div className="text-xl font-bold">Bo — Uyen Nguyen</div>
            <div className="text-muted text-sm mb-6">Giảng viên & Chủ bếp</div>
            <div className="space-y-3 text-left">
              {[
                'Diplôme de Pâtisserie · Le Cordon Bleu London',
                'RSPH Level 4 · Managing Food Safety & Hygiene',
                'Chủ Mémoire Saigon · Saundersfoot, Wales',
                'Sáng lập Bonu Cakes Ltd · F&B Consultant UK',
              ].map((c) => (
                <div key={c} className="flex items-start gap-3 text-sm text-muted">
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary mt-2 shrink-0" />
                  <span>{c}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <SectionLabel>Giảng viên</SectionLabel>
            <GoldLine />
            <h3 className="font-serif text-2xl md:text-3xl font-bold mb-4">
              Không học từ sách. <span className="italic text-primary/80">Học từ người đã trả giá thật.</span>
            </h3>
            <p className="text-muted leading-relaxed mb-3">
              Bo đã tự mở 3 mô hình nhà hàng tại UK: Bonu Cakes tại London, Wow Bánh Mì tại Manchester và hiện đang vận hành Mémoire Saigon — nhà hàng Việt tại Saundersfoot, Wales. Bo không chỉ dạy công thức, mà dạy cách vận hành bếp thật, tính giá thật và bán hàng thật trong môi trường UK.
            </p>
            <p className="text-muted leading-relaxed mb-6">
              Tốt nghiệp Le Cordon Bleu London và đạt chứng chỉ quản lý vệ sinh an toàn thực phẩm RSPH Level 4, Bo hiểu cả hai phía: nghề bếp chuyên nghiệp và thực tế kinh doanh F&B của người Việt tại Anh.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { n: '10+', l: 'Năm kinh nghiệm F&B tại UK & VN' },
                { n: '3', l: 'Thương hiệu F&B tự xây dựng' },
                { n: '6,000+', l: 'Followers cộng đồng Bonu Cakes' },
                { n: 'LCB', l: 'Diplôme Pâtisserie' },
              ].map((h) => (
                <div key={h.l} className="bg-light rounded-xl p-4 text-center">
                  <div className="text-secondary text-2xl font-bold">{h.n}</div>
                  <div className="text-muted text-xs mt-1">{h.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FOR WHOM ── */}
      <section className="px-6 py-20 md:py-28">
        <div className="max-w-6xl mx-auto">
          <SectionLabel>Khoá học này dành cho ai</SectionLabel>
          <GoldLine />
          <h2 className="font-serif text-3xl md:text-4xl font-bold mb-12">
            Dành cho người muốn <span className="italic text-primary/80">kinh doanh thật sự.</span>
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FORWHOM.map((c) => (
              <div key={c.t} className="bg-white border border-primary/10 rounded-xl p-6 hover:shadow-md transition">
                <div className="font-bold mb-2">{c.t}</div>
                <div className="text-muted text-sm leading-relaxed">{c.d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── OUTCOMES (green) ── */}
      <section id="ket-qua" className="px-6 py-20 md:py-28 bg-primary text-white">
        <div className="max-w-6xl mx-auto">
          <SectionLabel light>Học xong bạn có gì</SectionLabel>
          <GoldLine />
          <h2 className="font-serif text-2xl md:text-3xl font-bold mb-12 max-w-4xl leading-snug">
            Không chỉ biết cách làm ra <span className="italic text-secondary">ổ bánh mì tròn vị chuẩn Sài Gòn</span> — bạn còn biết cách <span className="italic text-secondary">vận hành kinh doanh bài bản</span> đúng với mô hình của bạn.
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-white/10 rounded-2xl overflow-hidden">
            {OUTCOMES.map((o) => (
              <div key={o.n} className="bg-primary p-7">
                <div className="text-secondary/50 font-serif text-3xl font-bold mb-3">{o.n}</div>
                <div className="font-semibold mb-2">{o.t}</div>
                <div className="text-white/65 text-sm leading-relaxed">{o.d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SCHEDULE (accordion) ── */}
      <section id="chuong-trinh" className="px-6 py-20 md:py-28">
        <div className="max-w-5xl mx-auto">
          <SectionLabel>Chương trình khóa học</SectionLabel>
          <GoldLine />
          <h2 className="font-serif text-3xl md:text-4xl font-bold mb-3">
            Học theo quy trình chuẩn <span className="italic text-primary/80">để làm bánh mì bán được.</span>
          </h2>
          <p className="text-muted mb-10 max-w-2xl">
            Từng phần đi theo đúng quy trình chuẩn: nhân, sốt, đóng gói, bảo quản, lên đơn và chăm sóc khách hàng sau khi bán.
          </p>
          <div className="space-y-4">
            {SESSIONS.map((s, i) => {
              const open = openSession === i;
              return (
                <div key={i} className="bg-white border border-primary/10 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setOpenSession(open ? null : i)}
                    className="w-full flex items-center gap-4 p-5 text-left"
                  >
                    <span className="w-9 h-9 shrink-0 rounded-full bg-primary text-secondary font-bold flex items-center justify-center">{i + 1}</span>
                    <span className="flex-1">
                      <span className="block font-semibold">{s.title}</span>
                      {s.subtitle && <span className="block text-muted text-sm mt-0.5">{s.subtitle}</span>}
                    </span>
                    <span className={`text-secondary text-2xl transition-transform ${open ? 'rotate-45' : ''}`}>+</span>
                  </button>
                  {open && (
                    <div className="px-5 pb-6 pl-[4.25rem]">
                      <p className="text-muted text-sm leading-relaxed mb-4">{s.desc}</p>
                      <div className="flex flex-wrap gap-2">
                        {s.tags.map((t) => (
                          <span key={t} className="text-xs bg-secondary/15 text-primary rounded-full px-3 py-1">{t}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── BONUS ── */}
      <section className="px-6 py-20 md:py-28 bg-white">
        <div className="max-w-6xl mx-auto">
          <SectionLabel>Đi kèm khoá học</SectionLabel>
          <GoldLine />
          <h2 className="font-serif text-3xl md:text-4xl font-bold mb-12">
            Học phí {fmtPrice(info.price)} bao gồm <span className="italic text-primary/80">tất cả những điều này.</span>
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {BONUS.map((b) => (
              <div key={b.t} className="bg-light border border-primary/10 rounded-xl p-6">
                <div className="font-bold mb-2">{b.t}</div>
                <div className="text-muted text-sm leading-relaxed">{b.d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ (accordion) ── */}
      <section className="px-6 py-20 md:py-28">
        <div className="max-w-3xl mx-auto">
          <SectionLabel>Câu hỏi thường gặp</SectionLabel>
          <GoldLine />
          <h2 className="font-serif text-3xl md:text-4xl font-bold mb-10">
            Bạn đang <span className="italic text-primary/80">thắc mắc điều gì?</span>
          </h2>
          <div className="space-y-3">
            {FAQS.map((f, i) => {
              const open = openFaq === i;
              return (
                <div key={i} className="bg-white border border-primary/10 rounded-xl overflow-hidden">
                  <button onClick={() => setOpenFaq(open ? null : i)} className="w-full flex items-center justify-between gap-4 p-5 text-left">
                    <span className="font-medium">{f.q}</span>
                    <span className={`text-secondary text-2xl transition-transform shrink-0 ${open ? 'rotate-45' : ''}`}>+</span>
                  </button>
                  {open && <div className="px-5 pb-5 text-muted text-sm leading-relaxed">{f.a}</div>}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── SCORECARD ── */}
      <section className="px-6 py-20 md:py-28 bg-white">
        <div className="max-w-3xl mx-auto">
          <SectionLabel>Tự đánh giá</SectionLabel>
          <GoldLine />
          <h2 className="font-serif text-3xl md:text-4xl font-bold mb-3">
            Khoá học này <span className="italic text-primary/80">có phù hợp với bạn không?</span>
          </h2>
          <p className="text-muted mb-8">Tick vào những câu giống tình trạng của bạn, kết quả sẽ hiện ngay bên dưới.</p>
          <ul className="space-y-3">
            {CHECKS.map((c, i) => (
              <li
                key={i}
                onClick={() => setChecked((arr) => arr.map((v, idx) => (idx === i ? !v : v)))}
                className={`flex items-start gap-3 cursor-pointer rounded-xl border p-4 transition ${checked[i] ? 'border-secondary bg-secondary/10' : 'border-primary/10 bg-light hover:border-secondary/40'}`}
              >
                <span className={`w-5 h-5 shrink-0 rounded border-2 flex items-center justify-center mt-0.5 ${checked[i] ? 'bg-secondary border-secondary text-primary' : 'border-primary/30'}`}>
                  {checked[i] && '✓'}
                </span>
                <span className="text-sm text-primary">{c}</span>
              </li>
            ))}
          </ul>
          {checkedCount > 0 && (
            <div className="mt-8 bg-primary text-white rounded-2xl p-7">
              <div className="h-1.5 bg-white/15 rounded-full overflow-hidden mb-4">
                <div className="h-full bg-secondary transition-all" style={{ width: `${(checkedCount / CHECKS.length) * 100}%` }} />
              </div>
              <div className="text-secondary text-sm font-semibold mb-2">{scoreLabel}</div>
              <div className="font-serif text-xl font-bold mb-2">{scoreTitle}</div>
              <p className="text-white/70 text-sm leading-relaxed mb-5">{scoreDesc}</p>
              {showScoreCta && (
                <a href="#dang-ky" className="inline-block bg-secondary text-primary font-bold px-6 py-3 rounded-lg hover:brightness-105 transition">
                  Đăng ký khoá học →
                </a>
              )}
            </div>
          )}
        </div>
      </section>

      {/* ── CONTACT / REGISTER ── */}
      <section id="dang-ky" className="px-6 py-20 md:py-28 bg-primary text-white">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-start">
          <div>
            <SectionLabel light>Đăng ký khoá học</SectionLabel>
            <GoldLine />
            <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4">
              Để lại thông tin <span className="italic text-secondary">Bo sẽ liên hệ lại sớm nhất.</span>
            </h2>
            <p className="text-white/75 leading-relaxed mb-8">
              Bo sẽ xem thông tin của bạn và liên hệ lại để tư vấn lịch học bánh mì phù hợp — không có áp lực, không cần quyết định ngay.
            </p>
            <div className="space-y-4 text-sm">
              {[
                { l: 'Website', v: 'bonucakes.com' },
                { l: 'Địa điểm', v: info.location || 'Brewery Terrace, SA69 9HG, Saundersfoot, UK' },
                { l: 'WhatsApp', v: 'Nhắn qua form — Bo gửi số sau khi xác nhận lịch' },
              ].map((r) => (
                <div key={r.l} className="flex gap-4 border-b border-white/10 pb-3">
                  <span className="text-secondary/70 w-24 shrink-0">{r.l}</span>
                  <span className="text-white/85">{r.v}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white text-primary rounded-2xl p-7 md:p-8">
            {submitted ? (
              <div className="text-center py-12">
                <div className="text-5xl mb-4">🌿</div>
                <h3 className="font-serif text-2xl font-bold mb-2">Đã gửi đăng ký!</h3>
                <p className="text-muted">Cảm ơn bạn. Bo đã nhận thông tin và sẽ liên hệ lại sớm nhất.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Họ và tên <span className="text-red-500">*</span></label>
                  <input type="text" required value={form.name} onChange={set('name')} placeholder="Tên của bạn" className={inputCls} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Email <span className="text-red-500">*</span></label>
                  <input type="email" required value={form.email} onChange={set('email')} placeholder="email@example.com" className={inputCls} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Số điện thoại / WhatsApp</label>
                  <input type="tel" value={form.phone} onChange={set('phone')} placeholder="+44 hoặc +84..." className={inputCls} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Bạn đang ở đâu?</label>
                  <input type="text" value={form.location} onChange={set('location')} placeholder="Thành phố, Quốc gia" className={inputCls} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Hình thức học</label>
                  <select value={form.format} onChange={set('format')} className={inputCls}>
                    <option value="">Chọn hình thức</option>
                    {FORMAT_OPTIONS.map((o) => (
                      <option key={o} value={o}>{o}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Mục tiêu của bạn</label>
                  <textarea value={form.goal} onChange={set('goal')} rows={3} placeholder="Bạn muốn bán bánh mì online, mở tiệm, hay mục tiêu khác..." className={inputCls} />
                </div>
                {error && <p className="text-red-600 text-sm">{error}</p>}
                <button type="submit" disabled={submitting} className="w-full bg-secondary text-primary font-bold py-3.5 rounded-lg hover:brightness-105 transition disabled:opacity-60">
                  {submitting ? 'Đang gửi...' : 'Gửi đăng ký →'}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
