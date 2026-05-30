// ============================================================================
// Tên workshop (giá trị `workshopName` lưu vào bảng workshop_registrations).
// IMPORT từ đây trong route POST và admin pages — đừng hardcode chuỗi rời rạc.
// Đổi tên ở đây sẽ tự đồng bộ mọi nơi.
// ============================================================================

/** Form đăng ký workshop chính (`/workshop_booking1-1`) */
export const WORKSHOP_NAME_REGISTRATION = 'Workshop Bếp Bà Bo';

/** Form booking 1-1 cùng Bonu. Lưu ý: chuỗi giá trị giữ "với chị Bo" để khớp
 *  record cũ trong DB (filter `r.workshopName === BOOKING_NAME` ở admin). */
export const WORKSHOP_NAME_BOOKING_1ON1 = 'Tư vấn 1-1 với chị Bo';

/** Form pre-order Bánh Bông Lan Trứng Muối */
export const WORKSHOP_NAME_PREORDER_BLTM = 'Pre-Order BLTM';

// ============================================================================
// Shared TypeScript types cho các trang admin.
// ============================================================================

export interface AdminCustomer {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  tags: string[];
  marketingConsent: boolean;
}

export interface AdminRegistration {
  id: number;
  customerId: number | null;
  workshopName: string;
  workshopDate: string | null;
  registrationDate: string;
  age: string | null;
  location: string | null;
  phone: string | null;
  facebookLink: string | null;
  fbExperience: string | null;
  barriers: string[];
  goals: string | null;
  specificQuestions: string | null;
  availability: string | null;
  referralSource: string | null;
  otherNotes: string | null;
  preorderQuantity: number | null;
  attended: boolean;
  attendanceDate: string | null;
  deletedAt: string | null;
  customer: AdminCustomer | null;
}
