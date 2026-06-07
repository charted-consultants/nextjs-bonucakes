// Email "30 phút nữa workshop diễn ra" - gửi manual từ trang admin.
// Nội dung do chủ dự án duyệt; QR dùng URL public đã host trong public/whatsapp-qr.png.

const QR_URL = "https://bonucakes.com/whatsapp-qr.png";
const WHATSAPP_LINK = "https://chat.whatsapp.com/DdjyY3ZPExaKPLFXFP6ZoG?mode=gi_t";
const ZOOM_LINK =
  "https://us06web.zoom.us/j/5514770716?pwd=ejVvZVdEdzVBQnh5TFpDQVBqRzFYUT09";

export const WORKSHOP_REMINDER_SUBJECT =
  '[30 PHÚT NỮA] WORKSHOP "GHÉT AI THÌ XÚI NGƯỜI ĐÓ MỞ QUÁN" CHÍNH THỨC DIỄN RA';

export function workshopReminderHtml(): string {
  return `<!DOCTYPE html>
<html lang="vi">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Workshop Bonucakes - Lời mời tham gia</title>
</head>
<body style="margin:0;padding:0;background:#f8faf9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#083121;">
  <div style="max-width:600px;margin:0 auto;padding:24px 16px;">
    <div style="background:#ffffff;border-radius:16px;padding:32px 28px;font-size:15px;line-height:1.75;color:#083121;box-shadow:0 2px 12px rgba(8,49,33,.06);">

      <h1 style="font-weight:800;font-size:20px;line-height:1.45;margin:0 0 22px;color:#083121;">
        [30 PHÚT NỮA] WORKSHOP "GHÉT AI THÌ XÚI NGƯỜI ĐÓ MỞ QUÁN" CHÍNH THỨC DIỄN RA
      </h1>

      <p style="margin:0 0 24px;">
        Khởi động hành trình kiếm tiền từ kinh doanh F&amp;B và tìm hiểu bí quyết để không trở thành một trong số 80% quán phải đóng cửa chỉ sau 6 tháng hoạt động.
      </p>

      <div style="background:#f8faf9;border-left:4px solid #fcc56c;border-radius:8px;padding:16px 20px;margin:0 0 24px;">
        <p style="margin:0 0 8px;"><strong>Thời gian:</strong> 9:00 PM | giờ UK | Chủ Nhật - Ngày 07/06/2026</p>
        <p style="margin:0 0 8px;padding-left:78px;">3:00 AM | giờ VN | Thứ Hai - Ngày 08/06/2026</p>
        <p style="margin:0;"><strong>Hình thức:</strong> Online qua Zoom</p>
      </div>

      <p style="margin:0 0 18px;">Minh Uyen - bonucakes@gmail.com is inviting you to a scheduled Zoom meeting.</p>

      <div style="background:#f8faf9;border-radius:8px;padding:16px 20px;margin:0 0 24px;">
        <p style="margin:0 0 10px;">Topic: Minh Uyen - bonucakes@gmail.com's Personal Meeting Room</p>
        <p style="margin:0 0 6px;">Join Zoom Meeting</p>
        <p style="margin:0 0 16px;word-break:break-all;">
          <a href="${ZOOM_LINK}" style="color:#1a73e8;">${ZOOM_LINK}</a>
        </p>
        <p style="margin:0 0 4px;">Meeting ID: <strong>551 477 0716</strong></p>
        <p style="margin:0;">Passcode: <strong>smartbee</strong></p>
      </div>

      <div style="margin:0 0 24px;">
        <p style="margin:0 0 10px;font-weight:700;">LƯU Ý:</p>
        <p style="margin:0 0 10px;">Tải App Zoom để sử dụng tốt nhất (hoặc copy link mở bằng trình duyệt Chrome).</p>
        <p style="margin:0 0 10px;">(1) Khuyến khích Anh/ chị vào trước 15 phút để chuẩn bị và ổn định đường truyền.</p>
        <p style="margin:0 0 10px;">(2) Nếu sử dụng PC/Laptop, Anh/ chị có thể chọn "Tham gia bằng trình duyệt" nếu chưa cài sẵn phần mềm Zoom.</p>
        <p style="margin:0;">(3) Nếu tham gia bằng điện thoại, vui lòng tải App Zoom để sử dụng tốt nhất (hoặc copy link mở bằng trình duyệt Chrome).</p>
      </div>

      <p style="margin:0 0 28px;">
        Hẹn gặp Anh/ chị sau 30 phút nữa để cùng bắt đầu hành trình tìm hiểu về việc mở quán cafe trà sữa, bánh mì tại Anh (UK)
      </p>

      <div style="border-top:1px solid #eef2f0;padding-top:24px;text-align:center;">
        <p style="margin:0 0 12px;font-weight:700;font-size:17px;color:#083121;">📱 Tham gia nhóm WhatsApp của Workshop</p>
        <p style="margin:0 0 20px;line-height:1.75;color:#4a5c52;">
          Để Anh/Chị không bỏ lỡ buổi học, Bonucakes đã lập một nhóm WhatsApp riêng cho các học viên.
          Tham gia nhóm ngay để nhận <strong style="color:#083121;">link Zoom, nhắc lịch trước giờ học, tài liệu và hỗ trợ giải đáp thắc mắc</strong> nhanh nhất nhé.
          Rất mong được đồng hành cùng Anh/Chị! 🌿
        </p>
        <a href="${WHATSAPP_LINK}"
           style="display:inline-block;background:#25D366;color:#ffffff;text-decoration:none;font-weight:700;font-size:16px;padding:13px 32px;border-radius:999px;margin:0 0 18px;">
          Bấm vào đây để tham gia nhóm
        </a>
        <p style="margin:0 0 14px;color:#4a5c52;font-size:14px;">Hoặc dùng camera điện thoại quét mã QR bên dưới:</p>
        <div style="display:inline-block;background:#ffffff;border:1px solid #eef2f0;padding:14px;border-radius:12px;">
          <img src="${QR_URL}" alt="QR nhóm WhatsApp" width="200" height="200" style="display:block;">
        </div>
      </div>

    </div>
  </div>
</body>
</html>`;
}
