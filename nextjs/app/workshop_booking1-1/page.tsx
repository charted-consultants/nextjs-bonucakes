'use client';

import { useState } from 'react';
import ConsultationBooking from '@/components/ConsultationBooking';

const OTHER = '__other__';

// Lựa chọn cho từng câu hỏi
const OPT_LOCATION = ['UK', 'Việt Nam'];
const OPT_STAGE = [
  'Chỉ mới có ý tưởng mở quán',
  'Đang chuẩn bị mở quán',
  'Đã mở quán dưới 1 năm',
  'Đã kinh doanh từ 1–3 năm',
  'Đã kinh doanh trên 3 năm',
  'Đang làm quản lý/nhân viên F&B',
];
const OPT_MODEL = [
  'Coffee Shop',
  'Bubble Tea',
  'Đồ ăn Việt',
  'Bánh mì / Takeaway',
  'Dessert / Bakery',
  'Nhà hàng',
];
const OPT_PAIN_POINTS = [
  'Khách đông nhưng lợi nhuận thấp',
  'Chủ quán phải làm tất cả mọi việc',
  'Không quản lý được nhân viên',
  'Không có quy trình vận hành',
  'Chi phí tăng liên tục',
  'Doanh thu không ổn định',
  'Không biết đọc các chỉ số kinh doanh',
  'Chưa biết cách mở rộng',
];
const OPT_TIME_SPENT = ['Dưới 4 tiếng', '4–8 tiếng', '8–12 tiếng', 'Trên 12 tiếng', 'Chưa mở quán'];
const OPT_SINGLE_PROBLEM = [
  'Tăng lợi nhuận',
  'Có hệ thống vận hành',
  'Quản lý nhân sự',
  'Tiết kiệm chi phí',
  'Có nhiều thời gian cho bản thân',
  'Mở thêm chi nhánh',
];
const OPT_THOUGHT = ['Rất nhiều lần', 'Thỉnh thoảng', 'Chưa từng'];
const OPT_REFERRAL = ['Fanpage BONU', 'Facebook cá nhân của Ms. Bo', 'Bạn bè giới thiệu', 'Group Facebook', 'TikTok'];

const inputClass =
  'w-full border border-primary/20 rounded-lg px-4 py-3 text-primary placeholder-muted focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary bg-white transition';

// ---- Field wrapper ----
function Field({ label, required, hint, children }: { label: string; required?: boolean; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-primary mb-2">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </label>
      {hint && <p className="text-xs text-muted mb-2">{hint}</p>}
      {children}
    </div>
  );
}

// ---- Radio group (có option "Khác") ----
function RadioGroup({
  name, options, hasOther, otherLabel = 'Khác:', required, value, otherText, onValue, onOther,
}: {
  name: string; options: string[]; hasOther?: boolean; otherLabel?: string; required?: boolean;
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
            <span className="text-primary">{otherLabel}</span>
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

// ---- Checkbox group (có option "Khác") ----
function CheckboxGroup({
  options, values, hasOther = true, otherLabel = 'Khác:', otherChecked, otherText, onToggle, onOtherToggle, onOther,
}: {
  options: string[]; values: string[]; hasOther?: boolean; otherLabel?: string; otherChecked: boolean; otherText: string;
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
      {hasOther && (
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 cursor-pointer whitespace-nowrap">
            <input type="checkbox" checked={otherChecked} onChange={onOtherToggle} className="accent-primary" />
            <span className="text-primary">{otherLabel}</span>
          </label>
          <input
            type="text" value={otherText} disabled={!otherChecked}
            onChange={(e) => onOther(e.target.value)}
            className="flex-1 border-b border-primary/30 focus:border-secondary outline-none px-1 py-1 text-primary disabled:opacity-40 bg-transparent"
          />
        </div>
      )}
    </div>
  );
}

const initialForm = {
  name: '', email: '', phone: '',
  location: '', locationOther: '',
  stage: '',
  model: [] as string[], modelOther: '', modelOtherChecked: false,
  painPoints: [] as string[], painPointsOther: '', painPointsOtherChecked: false,
  timeSpent: '',
  singleProblem: '',
  thoughtAboutIt: '',
  failureReason: '',
  wantAfterWorkshop: '',
  questionForBo: '',
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

    const location = resolveOther(form.location, form.locationOther);
    const referral = resolveOther(form.referral, form.referralOther);
    const model = [
      ...form.model,
      ...(form.modelOtherChecked && form.modelOther.trim() ? [form.modelOther.trim()] : []),
    ];
    const painPoints = [
      ...form.painPoints,
      ...(form.painPointsOtherChecked && form.painPointsOther.trim() ? [form.painPointsOther.trim()] : []),
    ];

    // Validate các câu bắt buộc mà trình duyệt không tự bắt được
    if (!location) return setErr('Vui lòng chọn nơi bạn đang sống (câu 4).');
    if (!form.stage) return setErr('Vui lòng chọn giai đoạn của bạn (câu 5).');
    if (model.length === 0) return setErr('Vui lòng chọn ít nhất một mô hình kinh doanh (câu 6).');
    if (!referral) return setErr('Vui lòng cho biết bạn biết đến Workshop qua đâu (câu 14).');

    setStatus('loading');
    setErrorMsg('');
    try {
      const res = await fetch('/api/workshop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name, email: form.email, phone: form.phone, location,
          stage: form.stage, model, painPoints,
          timeSpent: form.timeSpent, singleProblem: form.singleProblem,
          thoughtAboutIt: form.thoughtAboutIt || undefined,
          failureReason: form.failureReason,
          wantAfterWorkshop: form.wantAfterWorkshop,
          questionForBo: form.questionForBo,
          referral,
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

  const toggleModel = (opt: string) =>
    set({ model: form.model.includes(opt) ? form.model.filter((m) => m !== opt) : [...form.model, opt] });

  const togglePainPoint = (opt: string) =>
    set({ painPoints: form.painPoints.includes(opt) ? form.painPoints.filter((p) => p !== opt) : [...form.painPoints, opt] });

  return (
    <div className="min-h-screen bg-light">
      {/* Hero */}
      <header className="bg-light pt-32 pb-12 border-b border-primary/10">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <p className="text-secondary uppercase tracking-widest text-sm mb-4 font-medium">Workshop miễn phí</p>
          <h1 className="text-3xl md:text-4xl font-bold text-primary mb-5 font-serif">
            “Càng Bán Càng Mệt”
          </h1>
          <p className="text-muted leading-relaxed">
            Xây dựng quy trình vận hành nhà hàng, thiết lập hệ thống để quán vận hành ổn định, tối ưu chi phí, nhân sự và lợi nhuận — cùng Ms. Bo.
          </p>
          <div className="mt-5 text-sm text-primary/80 space-y-1">
            <p>💻 Hình thức: Online Zoom</p>
            <p>📅 Dự kiến: 21/07/2026</p>
            <p>🕒 Thời gian: 21:00 (UK) – 3:00 sáng (VN)</p>
          </div>
          <p className="mt-6 text-muted text-sm">
            Vui lòng dành khoảng 5 phút để điền form. Mọi thông tin đều được bảo mật và chỉ phục vụ cho việc chuẩn bị nội dung Workshop.
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
              <Field label="1. Họ và tên" required>
                <input className={inputClass} required value={form.name} onChange={(e) => set({ name: e.target.value })} placeholder="Nguyễn Thị Lan" />
              </Field>

              <Field label="2. Email" required>
                <input className={inputClass} required type="email" value={form.email} onChange={(e) => set({ email: e.target.value })} placeholder="lan@gmail.com" />
              </Field>

              <Field label="3. Số điện thoại WhatsApp / Zalo" required hint="Dùng để gửi link Zoom và tài liệu Workshop.">
                <input className={inputClass} required type="tel" value={form.phone} onChange={(e) => set({ phone: e.target.value })} placeholder="+44 ... / 0912 345 678" />
              </Field>

              <Field label="4. Bạn hiện đang sinh sống ở đâu?" required>
                <RadioGroup name="location" options={OPT_LOCATION} hasOther otherLabel="Quốc gia khác:" required
                  value={form.location} otherText={form.locationOther}
                  onValue={(v) => set({ location: v })} onOther={(v) => set({ locationOther: v })} />
              </Field>

              <Field label="5. Hiện tại bạn đang ở giai đoạn nào?" required>
                <RadioGroup name="stage" options={OPT_STAGE} required
                  value={form.stage} otherText="" onValue={(v) => set({ stage: v })} onOther={() => {}} />
              </Field>

              <Field label="6. Bạn đang hoặc dự định kinh doanh mô hình nào?" required>
                <CheckboxGroup options={OPT_MODEL}
                  values={form.model} otherChecked={form.modelOtherChecked} otherText={form.modelOther}
                  onToggle={toggleModel}
                  onOtherToggle={() => set({ modelOtherChecked: !form.modelOtherChecked })}
                  onOther={(v) => set({ modelOther: v })} />
              </Field>

              <Field label='7. Điều khiến bạn cảm thấy "càng bán càng mệt" nhất hiện nay là gì?' hint="Có thể chọn nhiều đáp án.">
                <CheckboxGroup options={OPT_PAIN_POINTS}
                  values={form.painPoints} otherChecked={form.painPointsOtherChecked} otherText={form.painPointsOther}
                  onToggle={togglePainPoint}
                  onOtherToggle={() => set({ painPointsOtherChecked: !form.painPointsOtherChecked })}
                  onOther={(v) => set({ painPointsOther: v })} />
              </Field>

              <Field label="8. Hiện nay bạn dành bao nhiêu thời gian mỗi ngày cho việc vận hành quán?" required>
                <RadioGroup name="timeSpent" options={OPT_TIME_SPENT} required
                  value={form.timeSpent} otherText="" onValue={(v) => set({ timeSpent: v })} onOther={() => {}} />
              </Field>

              <Field label="9. Nếu bạn có thể giải quyết một vấn đề duy nhất, bạn muốn đó là gì?" required>
                <RadioGroup name="singleProblem" options={OPT_SINGLE_PROBLEM} required
                  value={form.singleProblem} otherText="" onValue={(v) => set({ singleProblem: v })} onOther={() => {}} />
              </Field>

              <Field label='10. Bạn đã từng nghĩ: "Mình đang nuôi quán hay để quán nuôi mình?"'>
                <RadioGroup name="thoughtAboutIt" options={OPT_THOUGHT}
                  value={form.thoughtAboutIt} otherText="" onValue={(v) => set({ thoughtAboutIt: v })} onOther={() => {}} />
              </Field>

              <Field label="11. Theo bạn, nguyên nhân lớn nhất khiến nhiều quán F&B thất bại là gì?" required hint="Câu trả lời ngắn">
                <input className={inputClass} required value={form.failureReason} onChange={(e) => set({ failureReason: e.target.value })} />
              </Field>

              <Field label="12. Điều bạn mong muốn nhận được sau Workshop là gì?" required hint="Ví dụ: biết cách xây quy trình, quản lý nhân viên, tăng lợi nhuận, kiểm soát chi phí, có nhiều thời gian hơn...">
                <textarea className={inputClass + ' resize-none'} required rows={3} value={form.wantAfterWorkshop} onChange={(e) => set({ wantAfterWorkshop: e.target.value })} />
              </Field>

              <Field label="13. Nếu được hỏi trực tiếp Ms. Bo một câu, bạn sẽ hỏi gì?" required hint="Câu trả lời dài">
                <textarea className={inputClass + ' resize-none'} required rows={4} value={form.questionForBo} onChange={(e) => set({ questionForBo: e.target.value })} />
              </Field>

              <Field label="14. Bạn biết đến Workshop qua đâu?" required>
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

      {/* Đặt lịch tư vấn 1-1 cùng Bonu */}
      <ConsultationBooking />
    </div>
  );
}
