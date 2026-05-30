// ============================================================================
// ⚙️  KHUNG GIỜ TƯ VẤN 1-1 CÙNG BONU — CHỈNH Ở ĐÂY
// ----------------------------------------------------------------------------
// Khung giờ lặp lại hàng tuần. Khách chọn khung phù hợp; Bonu sẽ liên hệ
// xác nhận NGÀY cụ thể khi gọi lại. Muốn đổi giờ/ngày → sửa mảng bên dưới.
// ============================================================================

/** Nhãn múi giờ hiển thị kèm mỗi slot. Đổi thành 'giờ UK' nếu cần. */
export const CONSULTATION_TIMEZONE_LABEL = 'giờ VN';

export type ConsultationDay = {
  /** Tên ngày hiển thị cho khách */
  label: string;
  /** Các khung giờ trong ngày, định dạng "HH:mm" */
  times: string[];
};

/** Lịch tư vấn 1-1 cố định theo tuần */
export const CONSULTATION_SLOTS: ConsultationDay[] = [
  { label: 'Thứ 2', times: ['20:00', '21:00'] },
  { label: 'Thứ 3', times: ['20:00', '21:00'] },
  { label: 'Thứ 4', times: ['20:00', '21:00'] },
  { label: 'Thứ 5', times: ['20:00', '21:00'] },
  { label: 'Thứ 6', times: ['20:00', '21:00'] },
  { label: 'Thứ 7', times: ['09:30', '14:00', '20:00'] },
  { label: 'Chủ nhật', times: ['09:30', '14:00'] },
];

/** Tạo chuỗi hiển thị cho 1 slot, ví dụ: "Thứ 2 — 20:00 (giờ VN)" */
export function formatSlot(day: string, time: string): string {
  return `${day} — ${time} (${CONSULTATION_TIMEZONE_LABEL})`;
}

/** Danh sách phẳng tất cả slot hợp lệ (dùng để validate ở API) */
export const CONSULTATION_SLOT_OPTIONS: string[] = CONSULTATION_SLOTS.flatMap((d) =>
  d.times.map((t) => formatSlot(d.label, t)),
);
