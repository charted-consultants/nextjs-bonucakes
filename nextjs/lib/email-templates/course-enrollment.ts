// Email cho luồng đăng ký khoá học (vd: Khoá học Bánh Mì Sài Gòn).
// 2 template: gửi admin (thông báo lead mới) + gửi khách (xác nhận đã nhận).
// Màu thương hiệu: #083121 (primary), #fcc56c (secondary), #f8faf9 (light).

export interface CourseEnrollmentData {
  name: string;
  email: string;
  phone?: string | null;
  location?: string | null;
  format?: string | null;
  goal?: string | null;
}

export function courseEnrollmentAdminEmail(
  courseName: string,
  data: CourseEnrollmentData,
  dateStr: string
): string {
  return `
<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="font-family:Arial,sans-serif;background:#f8faf9;margin:0;padding:0;">
<div style="max-width:600px;margin:40px auto;background:#fff;border:2px solid #fcc56c;border-radius:8px;overflow:hidden;">
  <div style="background:#083121;padding:28px 30px;text-align:center;">
    <h1 style="margin:0;font-size:22px;font-family:Georgia,serif;color:#fcc56c;">Đăng ký khoá học mới</h1>
    <p style="margin:8px 0 0;color:#f8faf9;font-size:13px;">${courseName} - ${dateStr}</p>
  </div>
  <div style="padding:32px 30px;">
    <div style="background:#f8faf9;border-left:4px solid #fcc56c;padding:20px;border-radius:4px;margin-bottom:20px;">
      <div style="margin-bottom:10px;"><strong style="color:#4a5c52;">Họ tên:</strong> <span style="color:#083121;">${data.name}</span></div>
      <div style="margin-bottom:10px;"><strong style="color:#4a5c52;">Email:</strong> <a href="mailto:${data.email}" style="color:#083121;">${data.email}</a></div>
      ${data.phone ? `<div style="margin-bottom:10px;"><strong style="color:#4a5c52;">Điện thoại / WhatsApp:</strong> <a href="tel:${data.phone}" style="color:#083121;">${data.phone}</a></div>` : ''}
      ${data.location ? `<div style="margin-bottom:10px;"><strong style="color:#4a5c52;">Địa điểm:</strong> <span style="color:#083121;">${data.location}</span></div>` : ''}
      ${data.format ? `<div style="margin-bottom:0;"><strong style="color:#4a5c52;">Hình thức học:</strong> <span style="color:#083121;">${data.format}</span></div>` : ''}
    </div>
    ${data.goal ? `
    <div style="border:1px solid #fcc56c;border-radius:4px;padding:20px;margin-bottom:24px;">
      <p style="margin:0 0 8px;font-size:14px;font-weight:bold;color:#083121;">Mục tiêu của khách:</p>
      <p style="margin:0;color:#4a5c52;white-space:pre-wrap;">${data.goal}</p>
    </div>` : ''}
    <div style="text-align:center;">
      <a href="mailto:${data.email}"
         style="display:inline-block;background:#fcc56c;color:#083121;padding:12px 28px;text-decoration:none;border-radius:4px;font-weight:bold;">
        Liên hệ tư vấn cho ${data.name}
      </a>
    </div>
  </div>
  <div style="background:#f8faf9;padding:16px 30px;text-align:center;border-top:1px solid #fcc56c;">
    <p style="margin:0;color:#4a5c52;font-size:12px;">Gửi từ form đăng ký khoá học - bonucakes.com</p>
  </div>
</div>
</body></html>`.trim();
}

export function courseEnrollmentGuestEmail(name: string, courseName: string): string {
  return `
<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="font-family:Arial,sans-serif;background:#f8faf9;margin:0;padding:0;">
<div style="max-width:600px;margin:40px auto;background:#fff;border:2px solid #fcc56c;border-radius:8px;overflow:hidden;">
  <div style="background:#083121;padding:28px 30px;text-align:center;">
    <h1 style="margin:0;font-size:22px;font-family:Georgia,serif;color:#fcc56c;">Bonu Cakes 🌿</h1>
  </div>
  <div style="padding:36px 30px;">
    <p style="font-size:17px;color:#083121;margin:0 0 16px;">Xin chào <strong>${name}</strong>,</p>
    <p style="color:#4a5c52;line-height:1.7;margin:0 0 16px;">
      Cảm ơn bạn đã quan tâm và đăng ký <strong>${courseName}</strong>!
    </p>
    <p style="color:#4a5c52;line-height:1.7;margin:0 0 16px;">
      Bo đã nhận được thông tin của bạn và sẽ liên hệ lại sớm nhất để tư vấn lịch học phù hợp -
      không có áp lực, không cần quyết định ngay.
    </p>
    <p style="color:#4a5c52;line-height:1.7;margin:0 0 24px;">
      Trong lúc chờ, nếu bạn có câu hỏi gấp, cứ trả lời thẳng email này nhé.
    </p>
    <div style="text-align:center;">
      <a href="https://bonucakes.com/khoa-hoc-banh-mi-sai-gon"
         style="display:inline-block;background:#fcc56c;color:#083121;padding:12px 28px;text-decoration:none;border-radius:4px;font-weight:bold;">
        Xem lại nội dung khoá học
      </a>
    </div>
  </div>
  <div style="background:#f8faf9;padding:16px 30px;text-align:center;border-top:1px solid #fcc56c;">
    <p style="margin:0;color:#4a5c52;font-size:12px;">Bonu Cakes Ltd · Saundersfoot, Wales, UK · bonucakes.com</p>
  </div>
</div>
</body></html>`.trim();
}
