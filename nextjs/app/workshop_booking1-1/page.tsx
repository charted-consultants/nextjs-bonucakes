'use client';

import { useState } from 'react';
import ConsultationBooking from '@/components/ConsultationBooking';

const OTHER = '__other__';

// Lựa chọn cho từng câu hỏi (theo Google Form gốc)
const OPT_LOCATION = ['UK', 'Việt Nam'];
const OPT_STAGE = [
  'Chỉ thích hoặc mới có ý tưởng mở quán',
  'Đang tìm hiểu ngành F&B',
  'Đã từng bán online / takeaway / quán nhỏ',
  'Đang làm trong ngành F&B',
];
const OPT_MODEL = [
  'Coffee shop',
  'Bubble tea',
  'Đồ ăn Việt online',
  'Bánh mì / takeaway',
  'Dessert / bakery',
  'Chưa xác định rõ',
];
const OPT_MOTIVATION = [
  'Muốn tự chủ tài chính',
  'Muốn kiếm thêm thu nhập',
  'Thay thế công việc hiện tại',
  'Test ý tưởng trước khi đầu tư lớn',
  'Làm vì yêu thích là chính, lợi nhuận sau',
];
const OPT_BARRIERS = [
  'Không biết bắt đầu từ đâu',
  'Lo sợ không đủ vốn',
  'Sợ mất tiền , thất bại',
  'Tiếng Anh không giỏi',
  'Lo ngại về giấy phép thủ tục kinh doanh',
];
const OPT_DREAMED = ['Rất nhiều lần', 'Thỉnh thoảng', 'Chưa từng'];
const OPT_OVERTIME = ['Có, sẳn sàng', 'Phân vân', 'Chưa sẵn sàng'];
const OPT_REFERRAL = ['Fanpage BONU', 'Facebook cá nhân của BO'];

const inputClass =
  'w-full border border-primary/20 rounded-lg px-4 py-3 text-primary placeholder-muted focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary bg-white transition';

// ---- Field wrapper ----
function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-primary mb-2">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </label>
      {children}
    </div>
  );
}

// ---- Radio group (có option "Mục khác") ----
function RadioGroup({
  name, options, hasOther, required, value, otherText, onValue, onOther,
}: {
  name: string; options: string[]; hasOther?: boolean; required?: boolean;
  value: string; otherText: string; onValue: (v: string) => void; onOther: (v: string) => void;
}) {
  return (
    <div className="space-y-2">
      {options.map((opt, i) => (
        <label key={opt} className="flex items-start gap-3 cursor-pointer">
          <input
            type="radio" name={name} value={opt} required={required && i === 0}
            checked={value === opt} onChange={() => onValue(opt)}
            className="mt-1 accent-primary"
          />
          <span className="text-primary">{opt}</span>
        </label>
      ))}
      {hasOther && (
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 cursor-pointer whitespace-nowrap">
            <input
              type="radio" name={name} value={OTHER}
              checked={value === OTHER} onChange={() => onValue(OTHER)}
              className="accent-primary"
            />
            <span className="text-primary">Mục khác:</span>
          </label>
          <input
            type="text" value={otherText} disabled={value !== OTHER}
            onChange={(e) => onOther(e.target.value)}
            className="flex-1 border-b border-primary/30 focus:border-secondary outline-none px-1 py-1 text-primary disabled:opacity-40 bg-transparent"
          />
        </div>
      )}
    </div>
  );
}

// ---- Checkbox group (có option "Mục khác") ----
function CheckboxGroup({
  options, values, otherChecked, otherText, onToggle, onOtherToggle, onOther,
}: {
  options: string[]; values: string[]; otherChecked: boolean; otherText: string;
  onToggle: (opt: string) => void; onOtherToggle: () => void; onOther: (v: string) => void;
}) {
  return (
    <div className="space-y-2">
      {options.map((opt) => (
        <label key={opt} className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox" checked={values.includes(opt)} onChange={() => onToggle(opt)}
            className="mt-1 accent-primary"
          />
          <span className="text-primary">{opt}</span>
        </label>
      ))}
      <div className="flex items-center gap-3">
        <label className="flex items-center gap-2 cursor-pointer whitespace-nowrap">
          <input type="checkbox" checked={otherChecked} onChange={onOtherToggle} className="accent-primary" />
          <span className="text-primary">Mục khác:</span>
        </label>
        <input
          type="text" value={otherText} disabled={!otherChecked}
          onChange={(e) => onOther(e.target.value)}
          className="flex-1 border-b border-primary/30 focus:border-secondary outline-none px-1 py-1 text-primary disabled:opacity-40 bg-transparent"
        />
      </div>
    </div>
  );
}

const initialForm = {
  name: '', email: '', age: '',
  location: '', locationOther: '',
  phone: '',
  stage: '', stageOther: '',
  model: '', modelOther: '',
  motivation: '', motivationOther: '',
  barriers: [] as string[], barriersOther: '', barriersOtherChecked: false,
  dreamed: '',
  willingOvertime: '',
  wantToHear: '',
  questions: '',
  referral: '', referralOther: '',
};

export default function WorkshopPage() {
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const set = (patch: Partial<typeof initialForm>) => setForm((prev) => ({ ...prev, ...patch }));

  const resolveOther = (value: string, other: string) => (value === OTHER ? other.trim() : value);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Gom đáp án "Mục khác"
    const location = resolveOther(form.location, form.locationOther);
    const stage = resolveOther(form.stage, form.stageOther);
    const model = resolveOther(form.model, form.modelOther);
    const motivation = resolveOther(form.motivation, form.motivationOther);
    const referral = resolveOther(form.referral, form.referralOther);
    const barriers = [
      ...form.barriers,
      ...(form.barriersOtherChecked && form.barriersOther.trim() ? [form.barriersOther.trim()] : []),
    ];

    // Validate các câu bắt buộc mà trình duyệt không tự bắt được
    if (!location) return setErr('Vui lòng chọn nơi bạn đang sống (câu 4).');
    if (!stage) return setErr('Vui lòng chọn giai đoạn của bạn (câu 6).');
    if (!model) return setErr('Vui lòng chọn mô hình bạn quan tâm (câu 7).');
    if (!motivation) return setErr('Vui lòng chọn động lực của bạn (câu 8).');
    if (barriers.length === 0) return setErr('Vui lòng chọn ít nhất một điều đang ngăn cản bạn (câu 9).');
    if (!referral) return setErr('Vui lòng cho biết bạn biết đến WS qua đâu (câu 14).');

    setStatus('loading');
    setErrorMsg('');
    try {
      const res = await fetch('/api/workshop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name, email: form.email, age: form.age, location, phone: form.phone,
          stage, model, motivation, barriers, dreamed: form.dreamed,
          willingOvertime: form.willingOvertime, wantToHear: form.wantToHear,
          questions: form.questions, referral,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Có lỗi xảy ra, vui lòng thử lại.');
      setStatus('success');
    } catch (err: any) {
      setErrorMsg(err.message || 'Có lỗi xảy ra, vui lòng thử lại.');
      setStatus('error');
    }
  };

  const setErr = (msg: string) => {
    setErrorMsg(msg);
    setStatus('error');
  };

  const toggleBarrier = (opt: string) =>
    set({ barriers: form.barriers.includes(opt) ? form.barriers.filter((b) => b !== opt) : [...form.barriers, opt] });

  return (
    <div className="min-h-screen bg-light">
      {/* Hero */}
      <header className="bg-light pt-32 pb-12 border-b border-primary/10">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <p className="text-secondary uppercase tracking-widest text-sm mb-4 font-medium">Workshop miễn phí</p>
          <h1 className="text-3xl md:text-4xl font-bold text-primary mb-5 font-serif">
            “Ghét Ai Thì Xúi Người Đó Mở Quán?”
          </h1>
          <p className="text-muted leading-relaxed">
            Workshop chia sẻ góc nhìn thực tế về mở quán cafe, bubble tea &amp; bán đồ ăn Việt Nam tại UK cùng Ms. Bo.
          </p>
          <div className="mt-5 text-sm text-primary/80 space-y-1">
            <p>💻 Hình thức: Online Zoom</p>
            <p>📅 Dự kiến: 07/06/2026</p>
            <p>🕒 Thời gian: 21:00 (UK) – 3:00 sáng (VN)</p>
          </div>
          <p className="mt-6 text-muted text-sm">
            Vui lòng dành 5–7 phút điền form để giúp Bo hiểu rõ hơn về bạn (mọi thông tin được bảo mật hoàn toàn). ❤️
          </p>
        </div>
      </header>

      {/* Form */}
      <section className="py-14 md:py-20">
        <div className="max-w-xl mx-auto px-6">
          {status === 'success' ? (
            <div className="text-center py-16">
              <div className="text-5xl mb-6">🌿</div>
              <h2 className="text-2xl font-bold text-primary font-serif mb-4">Bonu đã nhận được rồi! 🌿</h2>
              <p className="text-muted text-lg">
                Cảm ơn bạn đã đăng ký. Bonu sẽ liên hệ và gửi thông tin tham gia workshop cho bạn nhé.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-7">
              <Field label="1. Tên của bạn?" required>
                <input className={inputClass} required value={form.name} onChange={(e) => set({ name: e.target.value })} placeholder="Nguyễn Thị Lan" />
              </Field>

              <Field label="2. Email của bạn?" required>
                <input className={inputClass} required type="email" value={form.email} onChange={(e) => set({ email: e.target.value })} placeholder="lan@gmail.com" />
              </Field>

              <Field label="3. Độ tuổi / năm sinh?" required>
                <input className={inputClass} required value={form.age} onChange={(e) => set({ age: e.target.value })} placeholder="1995" />
              </Field>

              <Field label="4. Bạn đang sống ở đâu?" required>
                <RadioGroup name="location" options={OPT_LOCATION} hasOther required
                  value={form.location} otherText={form.locationOther}
                  onValue={(v) => set({ location: v })} onOther={(v) => set({ locationOther: v })} />
              </Field>

              <Field label="5. Số điện thoại WhatsApp / Zalo? (Để có thể được add vào nhóm thông báo và nhận hỗ trợ khi tham gia Workshop)" required>
                <input className={inputClass} required type="tel" value={form.phone} onChange={(e) => set({ phone: e.target.value })} placeholder="+44 ... / 0912 345 678" />
              </Field>

              <Field label="6. Hiện tại bạn đang ở giai đoạn nào trên hành trình kinh doanh F&B?" required>
                <RadioGroup name="stage" options={OPT_STAGE} hasOther required
                  value={form.stage} otherText={form.stageOther}
                  onValue={(v) => set({ stage: v })} onOther={(v) => set({ stageOther: v })} />
              </Field>

              <Field label="7. Bạn quan tâm mô hình nào nhất?" required>
                <RadioGroup name="model" options={OPT_MODEL} hasOther required
                  value={form.model} otherText={form.modelOther}
                  onValue={(v) => set({ model: v })} onOther={(v) => set({ modelOther: v })} />
              </Field>

              <Field label="8. Điều khiến bạn muốn kinh doanh F&B nhất là gì?" required>
                <RadioGroup name="motivation" options={OPT_MOTIVATION} hasOther required
                  value={form.motivation} otherText={form.motivationOther}
                  onValue={(v) => set({ motivation: v })} onOther={(v) => set({ motivationOther: v })} />
              </Field>

              <Field label="9. Nếu chưa từng bắt đầu, điều gì đang ngăn cản bạn?" required>
                <CheckboxGroup options={OPT_BARRIERS}
                  values={form.barriers} otherChecked={form.barriersOtherChecked} otherText={form.barriersOther}
                  onToggle={toggleBarrier}
                  onOtherToggle={() => set({ barriersOtherChecked: !form.barriersOtherChecked })}
                  onOther={(v) => set({ barriersOther: v })} />
              </Field>

              <Field label="10. Bạn đã từng nghĩ: “Nếu có một quán nhỏ của riêng mình thì chắc mình sẽ hạnh phúc hơn”?" required>
                <RadioGroup name="dreamed" options={OPT_DREAMED} required
                  value={form.dreamed} otherText="" onValue={(v) => set({ dreamed: v })} onOther={() => {}} />
              </Field>

              <Field label="11. Bạn có sẵn sàng làm việc thêm giờ và chịu áp lực liên tục nếu theo ngành F&B?">
                <RadioGroup name="willingOvertime" options={OPT_OVERTIME}
                  value={form.willingOvertime} otherText="" onValue={(v) => set({ willingOvertime: v })} onOther={() => {}} />
              </Field>

              <Field label="12. Điều bạn muốn nghe nhất trong workshop này là gì?" required>
                <textarea className={inputClass + ' resize-none'} required rows={3} value={form.wantToHear} onChange={(e) => set({ wantToHear: e.target.value })} />
              </Field>

              <Field label="13. Bạn có CÂU HỎI hay điều gì khác muốn chia sẻ với Bo không?">
                <textarea className={inputClass + ' resize-none'} rows={3} value={form.questions} onChange={(e) => set({ questions: e.target.value })} />
              </Field>

              <Field label="14. Bạn biết đến WS này qua đâu?" required>
                <RadioGroup name="referral" options={OPT_REFERRAL} hasOther required
                  value={form.referral} otherText={form.referralOther}
                  onValue={(v) => set({ referral: v })} onOther={(v) => set({ referralOther: v })} />
              </Field>

              {status === 'error' && <p className="text-red-500 text-sm">{errorMsg}</p>}

              <button
                type="submit" disabled={status === 'loading'}
                className="w-full bg-primary text-light py-3 rounded-lg font-semibold hover:bg-primary/90 transition disabled:opacity-60"
              >
                {status === 'loading' ? 'Đang gửi...' : 'Đăng ký tham gia'}
              </button>
            </form>
          )}
        </div>
      </section>

      {/* Đặt lịch tư vấn 1-1 với chị Bo */}
      <ConsultationBooking />
    </div>
  );
}
