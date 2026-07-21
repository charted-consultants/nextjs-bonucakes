import { PrismaClient } from '@prisma/client'
import { workshopReminderHtml, WORKSHOP_REMINDER_SUBJECT } from '../lib/email-templates/workshop-reminder'

const prisma = new PrismaClient()

// Khung email thương hiệu Bonu (xanh #083121 + vàng #fcc56c) cho các mẫu
// gửi thủ công từ admin (workshop / khoá học). Body truyền vào là HTML đoạn giữa.
function wrap(opts: {
  heading: string
  bodyHtml: string
  cta?: { label: string; url: string }
}): string {
  return `<!DOCTYPE html>
<html lang="vi">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f8faf9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#083121;">
  <div style="max-width:600px;margin:0 auto;padding:24px 16px;">
    <div style="text-align:center;margin-bottom:16px;">
      <span style="font-family:'Playfair Display',serif;font-style:italic;font-size:22px;font-weight:700;color:#083121;">Bonu Cakes</span>
    </div>
    <div style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 2px 12px rgba(8,49,33,.06);">
      <div style="background:linear-gradient(135deg,#083121 0%,#4a5c52 100%);padding:26px 28px;">
        <h1 style="margin:0;color:#ffffff;font-size:20px;line-height:1.4;font-weight:800;">${opts.heading}</h1>
      </div>
      <div style="padding:30px 28px;font-size:15px;line-height:1.75;color:#083121;">
        ${opts.bodyHtml}
        ${
          opts.cta
            ? `<div style="text-align:center;margin:28px 0 6px;"><a href="${opts.cta.url}" target="_blank" rel="noopener noreferrer" style="display:inline-block;background:#fcc56c;color:#083121;text-decoration:none;font-weight:700;font-size:15px;padding:13px 34px;border-radius:999px;">${opts.cta.label}</a></div>`
            : ''
        }
      </div>
      <div style="background:#f8faf9;padding:22px 28px;text-align:center;border-top:1px solid #eef2f0;">
        <p style="margin:0 0 6px;font-size:13px;color:#4a5c52;">Bonu Cakes - Đồ ăn Việt tại UK · Saundersfoot, Wales</p>
        <p style="margin:0;font-size:12px;color:#9ca3af;"><a href="https://bonucakes.com" style="color:#4a5c52;">bonucakes.com</a></p>
      </div>
    </div>
  </div>
</body>
</html>`
}

const templates = [
  {
    name: 'newsletter',
    displayName: 'Newsletter Template',
    description: 'Clean and professional newsletter template with Bonu Cakes branding',
    subject: 'Your Monthly Newsletter from Bonu Cakes',
    category: 'marketing',
    variables: ['name', 'content'],
    htmlContent: `<!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Arial', sans-serif; background-color: #f4f4f4;">
        <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f4f4f4; padding: 20px;">
          <tr>
            <td align="center">
              <table cellpadding="0" cellspacing="0" border="0" width="600" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <!-- Header -->
                <tr>
                  <td style="background-color: #D97706; padding: 30px 40px; text-align: center;">
                    <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">Bonu Cakes</h1>
                  </td>
                </tr>
                <!-- Content -->
                <tr>
                  <td style="padding: 40px;">
                    <p style="margin: 0 0 20px; font-size: 16px; color: #333333; line-height: 1.6;">
                      Hello {name},
                    </p>
                    <div style="font-size: 16px; color: #333333; line-height: 1.6;">
                      {content}
                    </div>
                  </td>
                </tr>
                <!-- Footer -->
                <tr>
                  <td style="background-color: #f9fafb; padding: 30px 40px; text-align: center; border-top: 1px solid #e5e7eb;">
                    <p style="margin: 0 0 10px; font-size: 14px; color: #6b7280;">
                      Bonu Cakes - Authentic Vietnamese Food in the UK
                    </p>
                    <p style="margin: 0; font-size: 12px; color: #9ca3af;">
                      © ${new Date().getFullYear()} Bonu Cakes. All rights reserved.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>`,
    active: true,
    isDefault: true
  },
  {
    name: 'promotion',
    displayName: 'Promotion Email',
    description: 'Eye-catching promotional template with gradient header and call-to-action button',
    subject: 'Special Offer Just for You!',
    category: 'marketing',
    variables: ['name', 'content'],
    htmlContent: `<!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Arial', sans-serif; background-color: #fef3c7;">
        <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #fef3c7; padding: 20px;">
          <tr>
            <td align="center">
              <table cellpadding="0" cellspacing="0" border="0" width="600" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                <!-- Header with gradient -->
                <tr>
                  <td style="background: linear-gradient(135deg, #D97706 0%, #F59E0B 100%); padding: 40px; text-align: center;">
                    <h1 style="margin: 0 0 10px; color: #ffffff; font-size: 32px; font-weight: bold;">Special Offer!</h1>
                    <p style="margin: 0; color: #ffffff; font-size: 18px; opacity: 0.9;">Exclusive for You</p>
                  </td>
                </tr>
                <!-- Content -->
                <tr>
                  <td style="padding: 40px;">
                    <p style="margin: 0 0 20px; font-size: 18px; color: #D97706; font-weight: bold;">
                      Hi {name}!
                    </p>
                    <div style="font-size: 16px; color: #333333; line-height: 1.8;">
                      {content}
                    </div>
                    <div style="margin-top: 30px; text-align: center;">
                      <a href="https://bonucakes.co.uk" style="display: inline-block; padding: 15px 40px; background-color: #D97706; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
                        Shop Now
                      </a>
                    </div>
                  </td>
                </tr>
                <!-- Footer -->
                <tr>
                  <td style="background-color: #f9fafb; padding: 30px 40px; text-align: center; border-top: 1px solid #e5e7eb;">
                    <p style="margin: 0 0 10px; font-size: 14px; color: #6b7280;">
                      Bonu Cakes - Authentic Vietnamese Food
                    </p>
                    <p style="margin: 0; font-size: 12px; color: #9ca3af;">
                      © ${new Date().getFullYear()} Bonu Cakes. All rights reserved.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>`,
    active: true,
    isDefault: false
  },
  {
    name: 'announcement',
    displayName: 'Announcement Email',
    description: 'Professional announcement template for important news and updates',
    subject: 'Important Announcement from Bonu Cakes',
    category: 'notification',
    variables: ['name', 'content'],
    htmlContent: `<!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Arial', sans-serif; background-color: #f4f4f4;">
        <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f4f4f4; padding: 20px;">
          <tr>
            <td align="center">
              <table cellpadding="0" cellspacing="0" border="0" width="600" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <!-- Header -->
                <tr>
                  <td style="background-color: #1f2937; padding: 30px 40px; text-align: center;">
                    <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: bold;">Important Announcement</h1>
                  </td>
                </tr>
                <!-- Blue banner -->
                <tr>
                  <td style="background-color: #3b82f6; padding: 15px 40px;">
                    <p style="margin: 0; color: #ffffff; font-size: 14px; text-align: center;">
                      📢 News from Bonu Cakes
                    </p>
                  </td>
                </tr>
                <!-- Content -->
                <tr>
                  <td style="padding: 40px;">
                    <p style="margin: 0 0 20px; font-size: 16px; color: #333333;">
                      Dear {name},
                    </p>
                    <div style="font-size: 16px; color: #333333; line-height: 1.6;">
                      {content}
                    </div>
                  </td>
                </tr>
                <!-- Footer -->
                <tr>
                  <td style="background-color: #f9fafb; padding: 30px 40px; text-align: center; border-top: 1px solid #e5e7eb;">
                    <p style="margin: 0 0 10px; font-size: 14px; color: #6b7280;">
                      Bonu Cakes - Authentic Vietnamese Food in the UK
                    </p>
                    <p style="margin: 0; font-size: 12px; color: #9ca3af;">
                      © ${new Date().getFullYear()} Bonu Cakes. All rights reserved.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>`,
    active: true,
    isDefault: false
  }
]

async function main() {
  console.log('Seeding email templates...')

  for (const template of templates) {
    const existing = await prisma.emailTemplate.findUnique({
      where: { name: template.name }
    })

    if (existing) {
      console.log(`Template "${template.name}" already exists, skipping...`)
    } else {
      await prisma.emailTemplate.create({
        data: template
      })
      console.log(`Created template: ${template.name}`)
    }
  }

  // Upsert transactional order email templates
  const orderTemplates = [
    {
      name: 'order-admin',
      displayName: 'Order Notification (Admin)',
      description: 'Email gửi cho admin khi có đơn hàng mới',
      subject: 'New Order #{orderCode} - {customerName}',
      category: 'transactional',
      variables: ['orderCode', 'customerName', 'customerEmail', 'customerPhone', 'deliveryAddress', 'submissionDate', 'deliveryDate', 'orderItemsHtml', 'subtotal', 'shippingFee', 'shippingLabel', 'total', 'specialNotes'],
      htmlContent: `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
      body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; line-height: 1.6; color: #083121; margin: 0; padding: 0; }
      .container { max-width: 650px; margin: 0 auto; padding: 8px; background: #f8faf9; }
      .header { background: linear-gradient(135deg, #083121 0%, #4a5c52 100%); color: #f8faf9; padding: 20px 12px; text-align: center; border-radius: 8px 8px 0 0; }
      .content { background: #ffffff; padding: 16px 12px; border: 1px solid #fcc56c; border-top: none; border-radius: 0 0 8px 8px; }
      .highlight { background: #f8faf9; padding: 12px; border-left: 4px solid #fcc56c; margin: 16px 0; border-radius: 4px; }
      .label { font-weight: bold; color: #083121; display: inline-block; min-width: 140px; }
      .order-box { background: #f8faf9; padding: 12px; border: 2px solid #fcc56c; border-radius: 4px; margin: 16px 0; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1 style="margin: 0; font-family: 'Playfair Display', serif; font-size: 2em;">Đơn hàng mới</h1>
        <p style="margin: 10px 0 0 0; color: #fcc56c;">Bonu F&B</p>
      </div>
      <div class="content">
        <div class="highlight">
          <p style="margin: 0; font-weight: bold; color: #083121; font-size: 1.2em;">Mã đơn hàng: #{orderCode}</p>
          <p style="margin: 5px 0 0 0; color: #4a5c52;">Nhận được ngày {submissionDate}</p>
        </div>
        <h2 style="color: #083121; margin-top: 30px;">THÔNG TIN KHÁCH HÀNG</h2>
        <p><span class="label">Họ tên:</span> <span style="color: #4a5c52;">{customerName}</span></p>
        <p><span class="label">Email:</span> <span style="color: #4a5c52;"><a href="mailto:{customerEmail}" style="color: #083121;">{customerEmail}</a></span></p>
        <p><span class="label">Số điện thoại:</span> <span style="color: #4a5c52;">{customerPhone}</span></p>
        <p><span class="label">Địa chỉ giao hàng:</span> <span style="color: #4a5c52;">{deliveryAddress}</span></p>
        {deliveryDate}
        <h2 style="color: #083121; margin-top: 30px;">CHI TIẾT ĐƠN HÀNG</h2>
        {orderItemsHtml}
        <h2 style="color: #083121; margin-top: 30px;">TỔNG KẾT THANH TOÁN</h2>
        <div class="order-box">
          <p style="margin: 0 0 8px 0;">Tạm tính: <strong>{subtotal}</strong></p>
          <p style="margin: 0 0 8px 0;">Phí giao hàng ({shippingLabel}): <strong>{shippingFee}</strong></p>
          <p style="margin: 8px 0 0 0; font-size: 1.1em;">Tổng cộng: <strong>{total}</strong></p>
        </div>
        {specialNotes}
        <div style="margin-top: 30px; padding: 20px; background: #f8faf9; border-radius: 4px;">
          <p style="margin: 0; color: #083121; font-weight: bold;">Vui lòng xác nhận đơn hàng và liên hệ khách sau khi nhận được thanh toán.</p>
        </div>
      </div>
    </div>
  </body>
</html>`,
    },
    {
      name: 'order-customer',
      displayName: 'Order Confirmation (Customer)',
      description: 'Email xác nhận đơn hàng gửi cho khách hàng',
      subject: 'Order Received #{orderCode} - Bonu F&B',
      category: 'transactional',
      variables: ['orderCode', 'customerName', 'emailTitle', 'emailIntro', 'orderItemsHtml', 'deliveryDate', 'subtotal', 'shippingFee', 'shippingLabel', 'total', 'paymentSectionHtml'],
      htmlContent: `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
      body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; line-height: 1.6; color: #083121; margin: 0; padding: 0; }
      .container { max-width: 650px; margin: 0 auto; padding: 8px; background: #f8faf9; }
      .header { background: linear-gradient(135deg, #083121 0%, #4a5c52 100%); color: #f8faf9; padding: 20px 12px; text-align: center; border-radius: 8px 8px 0 0; }
      .content { background: #ffffff; padding: 16px 12px; border: 1px solid #fcc56c; border-top: none; border-radius: 0 0 8px 8px; }
      .order-box { background: #f8faf9; padding: 12px; border: 2px solid #fcc56c; border-radius: 4px; margin: 16px 0; }
      .warning { background: #FFF3E0; padding: 12px; border-left: 4px solid #F57C00; margin: 16px 0; border-radius: 4px; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1 style="margin: 0; font-family: 'Playfair Display', serif; font-size: 2em; color: #fcc56c;">Bonu F&B</h1>
        <p style="margin: 10px 0 0 0; color: #f8faf9;">{emailTitle}</p>
      </div>
      <div class="content">
        <p style="font-size: 1.1em;">Xin chào {customerName},</p>
        <p>{emailIntro}</p>
        <div style="background: #f8faf9; padding: 15px; border-left: 4px solid #fcc56c; margin: 20px 0; border-radius: 4px;">
          <p style="margin: 0 0 5px 0; color: #083121; font-weight: bold;">MÃ ĐƠN HÀNG</p>
          <p style="margin: 0; font-size: 1.3em; font-weight: bold; color: #083121;">#{orderCode}</p>
        </div>
        <h2 style="color: #083121; margin-top: 30px;">CHI TIẾT ĐƠN HÀNG</h2>
        {orderItemsHtml}
        {deliveryDate}
        <h2 style="color: #083121; margin-top: 30px;">TỔNG KẾT THANH TOÁN</h2>
        <div class="order-box">
          <p style="margin: 0 0 8px 0;">Tạm tính: <strong>{subtotal}</strong></p>
          <p style="margin: 0 0 8px 0;">Phí giao hàng ({shippingLabel}): <strong>{shippingFee}</strong></p>
          <p style="margin: 8px 0 0 0; font-size: 1.1em;">Tổng cộng: <strong>{total}</strong></p>
        </div>
        {paymentSectionHtml}
        <div class="warning">
          <p style="margin: 0 0 10px 0; font-weight: bold; color: #F57C00;">LƯU Ý QUAN TRỌNG</p>
          <ul style="margin: 0; padding-left: 20px; color: #4a5c52;">
            <li>Phải cho vào tủ lạnh ngay khi nhận hàng</li>
            <li>Thịt và nhân sẽ nhanh hư nếu không bảo quản lạnh</li>
            <li>Không hâm nóng đồ chua</li>
          </ul>
        </div>
        <h2 style="color: #083121; margin-top: 30px;">HƯỚNG DẪN SỬ DỤNG</h2>
        <p><strong>1. Nướng lại bánh:</strong> Lò 180-200°C trong 5-7 phút hoặc dùng chảo chống dính</p>
        <p><strong>2. Làm ấm nhân:</strong> Để nhiệt độ phòng 5-10 phút (có thể microwave pate/thịt 30s)</p>
        <p><strong>3. Ráp bánh:</strong> Rạch bánh - sốt bơ - pate - thịt - chà bông - đồ chua - chả lụa</p>
        <p><strong>4. Ngon nhất khi ăn nóng!</strong></p>
        <p style="margin-top: 30px;">Chúng tôi sẽ liên hệ với bạn để xác nhận chi tiết đơn hàng.</p>
        <p style="margin-top: 20px;">Nếu có thắc mắc, vui lòng trả lời email này hoặc liên hệ qua Facebook.</p>
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #fcc56c;">
          <p style="color: #4a5c52; margin: 0; font-style: italic;">Trân trọng,</p>
          <p style="color: #083121; margin: 4px 0 0 0; font-weight: bold; font-family: 'Playfair Display', serif; font-size: 1.1em;">Uyen Nguyen</p>
          <p style="color: #4a5c52; margin: 4px 0 0 0; font-size: 0.9em;">Bonu F&B</p>
        </div>
      </div>
    </div>
  </body>
</html>`,
    },
  ]

  for (const t of orderTemplates) {
    await prisma.emailTemplate.upsert({
      where: { name: t.name },
      update: { htmlContent: t.htmlContent, subject: t.subject, updatedAt: new Date() },
      create: { ...t, active: true, isDefault: false },
    })
    console.log(`Upserted order template: ${t.name}`)
  }

  // ── Mẫu email gửi THỦ CÔNG từ admin (Workshop & Khoá học) ──────────────
  // category "workshop" → hiện ở trang Workshop; "course" → hiện ở trang Khoá học.
  // Dùng biến {name} để tự gọi tên khách. Bo có thể sửa nội dung trong /admin/email-templates.
  const manualTemplates = [
    // ===== WORKSHOP =====
    {
      name: 'workshop-reminder-1day',
      displayName: 'Workshop - Nhắc 1 ngày nữa diễn ra',
      description: 'Email nhắc trước 1 ngày kèm link Zoom + nhóm WhatsApp (đã duyệt nội dung).',
      subject: WORKSHOP_REMINDER_SUBJECT,
      category: 'workshop',
      variables: ['name'],
      htmlContent: workshopReminderHtml(),
    },
    {
      name: 'workshop-registered-confirm',
      displayName: 'Workshop - Xác nhận đã đăng ký',
      description: 'Gửi ngay sau khi khách đăng ký workshop để xác nhận đã nhận thông tin.',
      subject: 'Xác nhận đăng ký workshop thành công - Bonu Cakes',
      category: 'workshop',
      variables: ['name'],
      htmlContent: wrap({
        heading: 'Bonu đã nhận đăng ký workshop của bạn 🌿',
        bodyHtml: `
          <p style="margin:0 0 18px;">Xin chào <strong>{name}</strong>,</p>
          <p style="margin:0 0 18px;">Cảm ơn bạn đã đăng ký tham gia workshop của Bonu Cakes. Chúng tôi đã nhận được thông tin của bạn và đã giữ chỗ thành công.</p>
          <div style="background:#f8faf9;border-left:4px solid #fcc56c;border-radius:8px;padding:16px 20px;margin:0 0 18px;">
            <p style="margin:0 0 6px;"><strong>Thời gian:</strong> [điền ngày giờ workshop]</p>
            <p style="margin:0;"><strong>Hình thức:</strong> [Online qua Zoom / trực tiếp]</p>
          </div>
          <p style="margin:0 0 18px;">Trước ngày diễn ra, Bonu sẽ gửi cho bạn email nhắc kèm link tham gia và lời mời vào nhóm để không bỏ lỡ buổi học.</p>
          <p style="margin:0;">Hẹn gặp bạn tại workshop! 🌿</p>`,
      }),
    },
    {
      name: 'workshop-thankyou',
      displayName: 'Workshop - Cảm ơn sau buổi học',
      description: 'Gửi sau khi workshop kết thúc (nội dung do chủ dự án soạn).',
      subject: 'WORKSHOP “GHÉT AI THÌ XÚI NGƯỜI ĐÓ MỞ QUÁN” ĐÃ KHÉP LẠI',
      category: 'workshop',
      variables: ['name'],
      htmlContent: wrap({
        heading: 'WORKSHOP “GHÉT AI THÌ XÚI NGƯỜI ĐÓ MỞ QUÁN” ĐÃ KHÉP LẠI.',
        bodyHtml: `
          <p style="margin:0 0 18px;">Cảm ơn bạn đã dành hơn 150 phút để có mặt, lắng nghe và trao đổi rất thẳng.</p>
          <p style="margin:0 0 18px;">Bo không dạy cách mở quán thành công. Bo chỉ làm một việc: bóc tách một cuộc chơi mà nhiều người bước vào… nhưng không hiểu rõ.</p>
          <p style="margin:0 0 18px;">Có người đến vì muốn tự do, nhưng rồi nhận ra: mở quán không giúp bạn tự do, nó chỉ đổi một áp lực này sang một áp lực khác, nặng hơn.</p>
          <p style="margin:0 0 18px;">Không còn sếp → nhưng có khách hàng.<br>Không còn giờ hành chính → nhưng là 12–14 tiếng mỗi ngày.<br>Không còn bị kiểm soát → nhưng mọi sai lầm đều trả bằng tiền của chính mình.<br>Điều nguy hiểm nhất không phải là thất bại, mà là nghĩ rằng “chắc không khó lắm”.</p>
          <p style="margin:0 0 18px;">Vì thực tế là: có quán đông vẫn không lời, có người làm vì đam mê nhưng không trả nổi lương, và rất nhiều người mất tiền… vì tin rằng mở quán sẽ cho họ một cuộc sống khác.</p>
          <p style="margin:0 0 18px;">Bo cũng biết rõ: 150 phút chưa đủ. Không đủ để hiểu hết dòng tiền, vận hành, hay những quyết định sống còn phía sau một quán. Nếu bạn chỉ cần “biết thêm”, buổi workshop vừa rồi là đủ.</p>
          <p style="margin:0 0 18px;">Nhưng nếu bạn thật sự muốn đi sâu, muốn hiểu rõ mình có nên làm hay không, và nếu làm thì đi thế nào cho đúng ngay từ đầu, Bo có:</p>
          <p style="margin:0 0 18px;">①&nbsp; Buổi tư vấn 1-1 miễn phí, đi thẳng vào bài toán của bạn.<br>②&nbsp; Cầm tay chỉ việc 1-1 tại nhà hàng Bo đang vận hành (có phí).</p>
          <p style="margin:0;">Không nói chung, không lý thuyết, đi thẳng vào tình huống thật của bạn.</p>`,
        cta: { label: 'Đăng ký tư vấn 1-1 miễn phí với Bonu', url: 'https://bonucakes.com/workshop_booking1-1' },
      }),
    },
    {
      name: 'workshop-reschedule',
      displayName: 'Workshop - Thông báo đổi lịch',
      description: 'Báo cho khách khi workshop thay đổi ngày giờ hoặc địa điểm.',
      subject: '[THÔNG BÁO] Thay đổi lịch workshop - Bonu Cakes',
      category: 'workshop',
      variables: ['name'],
      htmlContent: wrap({
        heading: '[THÔNG BÁO] Workshop thay đổi lịch',
        bodyHtml: `
          <p style="margin:0 0 18px;">Xin chào <strong>{name}</strong>,</p>
          <p style="margin:0 0 18px;">Bonu Cakes xin thông báo có một thay đổi nhỏ về lịch workshop mà bạn đã đăng ký. Mong bạn thông cảm vì sự bất tiện này.</p>
          <div style="background:#f8faf9;border-left:4px solid #fcc56c;border-radius:8px;padding:16px 20px;margin:0 0 18px;">
            <p style="margin:0 0 6px;"><strong>Thời gian mới:</strong> [điền ngày giờ mới]</p>
            <p style="margin:0;"><strong>Hình thức / địa điểm:</strong> [điền chi tiết]</p>
          </div>
          <p style="margin:0 0 18px;">Chỗ của bạn vẫn được giữ nguyên. Nếu thời gian mới không phù hợp, bạn cứ trả lời email này để Bonu sắp xếp lại nhé.</p>
          <p style="margin:0;">Cảm ơn bạn rất nhiều! 🌿</p>`,
      }),
    },
    {
      name: 'workshop-announcement-today',
      displayName: 'Workshop - Thông báo diễn ra hôm nay',
      description: 'Thông báo workshop "Càng Bán Càng Mệt" chính thức diễn ra hôm nay, kèm link Zoom + nhóm WhatsApp.',
      subject: '📢 Workshop "Càng Bán Càng Mệt" chính thức diễn ra hôm nay - Bonu Cakes',
      category: 'workshop',
      variables: ['name'],
      htmlContent: wrap({
        heading: '📢 Workshop "Càng Bán Càng Mệt" diễn ra hôm nay',
        bodyHtml: `
          <p style="margin:0 0 18px;">Xin chào <strong>{name}</strong>,</p>
          <p style="margin:0 0 18px;">Bonucakes xin thông báo Workshop <strong>"Càng Bán Càng Mệt"</strong> sẽ chính thức diễn ra <strong>hôm nay</strong>. Đây là hành trình giúp bạn hiểu rõ bí quyết để không trở thành một trong số 80% quán phải đóng cửa chỉ sau 6 tháng hoạt động.</p>
          <div style="background:#f8faf9;border-left:4px solid #fcc56c;border-radius:8px;padding:16px 20px;margin:0 0 18px;">
            <p style="margin:0 0 8px;"><strong>Thời gian:</strong> 9:00 PM | giờ UK | Thứ Ba - Ngày 21/07/2026</p>
            <p style="margin:0 0 8px;padding-left:78px;">3:00 AM | giờ VN | Thứ Tư - Ngày 22/07/2026</p>
            <p style="margin:0;"><strong>Hình thức:</strong> Online qua Zoom</p>
          </div>
          <div style="background:#f8faf9;border-radius:8px;padding:16px 20px;margin:0 0 18px;">
            <p style="margin:0 0 4px;">Meeting ID: <strong>551 477 0716</strong></p>
            <p style="margin:0;">Passcode: <strong>smartbee</strong></p>
          </div>
          <p style="margin:0 0 10px;font-weight:700;">LƯU Ý:</p>
          <p style="margin:0 0 8px;">Khuyến khích bạn vào trước 15 phút để chuẩn bị và ổn định đường truyền. Tải App Zoom để dùng tốt nhất (hoặc copy link mở bằng trình duyệt Chrome).</p>
          <p style="margin:0;">Hẹn gặp bạn hôm nay để cùng bắt đầu hành trình tìm hiểu về việc mở quán cafe, trà sữa, bánh mì tại Anh (UK). 🌿</p>`,
        cta: { label: 'Tham gia Zoom ngay', url: 'https://us06web.zoom.us/j/5514770716?pwd=ejVvZVdEdzVBQnh5TFpDQVBqRzFYUT09' },
      }),
    },
    // ===== KHOÁ HỌC =====
    {
      name: 'course-received-confirm',
      displayName: 'Khoá học - Xác nhận đã nhận đăng ký',
      description: 'Gửi ngay khi khách điền form đăng ký khoá học: đã nhận, Bo sẽ liên hệ.',
      subject: 'Đã nhận đăng ký khoá học của bạn - Bonu Cakes',
      category: 'course',
      variables: ['name'],
      htmlContent: wrap({
        heading: 'Bonu đã nhận đăng ký khoá học của bạn 🌿',
        bodyHtml: `
          <p style="margin:0 0 18px;">Xin chào <strong>{name}</strong>,</p>
          <p style="margin:0 0 18px;">Cảm ơn bạn đã quan tâm đến khoá học của Bonu Cakes. Bonu đã nhận được thông tin đăng ký của bạn.</p>
          <p style="margin:0 0 18px;">Bo sẽ xem thông tin và liên hệ lại với bạn sớm nhất để tư vấn lịch học phù hợp - không có áp lực, không cần quyết định ngay.</p>
          <p style="margin:0 0 18px;">Nếu cần trao đổi gấp, bạn có thể trả lời thẳng email này.</p>
          <p style="margin:0;">Rất mong được đồng hành cùng bạn! 🌿</p>`,
      }),
    },
    {
      name: 'course-payment-invite',
      displayName: 'Khoá học - Mời đóng học phí / đặt cọc',
      description: 'Hướng dẫn thanh toán học phí hoặc đặt cọc giữ chỗ.',
      subject: 'Hướng dẫn đóng học phí / đặt cọc giữ chỗ khoá học - Bonu Cakes',
      category: 'course',
      variables: ['name'],
      htmlContent: wrap({
        heading: 'Hướng dẫn giữ chỗ khoá học của bạn',
        bodyHtml: `
          <p style="margin:0 0 18px;">Xin chào <strong>{name}</strong>,</p>
          <p style="margin:0 0 18px;">Cảm ơn bạn đã quyết định tham gia khoá học cùng Bonu Cakes. Để giữ chỗ cho bạn, vui lòng hoàn tất đóng học phí hoặc đặt cọc theo hướng dẫn dưới đây:</p>
          <div style="background:#f8faf9;border-left:4px solid #fcc56c;border-radius:8px;padding:16px 20px;margin:0 0 18px;">
            <p style="margin:0 0 6px;"><strong>Học phí:</strong> [điền số tiền]</p>
            <p style="margin:0 0 6px;"><strong>Đặt cọc giữ chỗ:</strong> [điền số tiền nếu có]</p>
            <p style="margin:0 0 6px;"><strong>Chuyển khoản tới:</strong> [điền thông tin tài khoản]</p>
            <p style="margin:0;"><strong>Nội dung:</strong> [Tên bạn + Khoá học]</p>
          </div>
          <p style="margin:0 0 18px;">Sau khi nhận được thanh toán, Bonu sẽ xác nhận và gửi bạn thông tin lịch học chi tiết.</p>
          <p style="margin:0;">Có gì thắc mắc, bạn cứ trả lời email này nhé! 🌿</p>`,
      }),
    },
    {
      name: 'course-start-reminder',
      displayName: 'Khoá học - Nhắc lịch khai giảng',
      description: 'Nhắc trước ngày học: ngày giờ, địa chỉ bếp, cần chuẩn bị gì.',
      subject: '[SẮP KHAI GIẢNG] Nhắc lịch khoá học của bạn - Bonu Cakes',
      category: 'course',
      variables: ['name'],
      htmlContent: wrap({
        heading: '[SẮP KHAI GIẢNG] Nhắc lịch khoá học',
        bodyHtml: `
          <p style="margin:0 0 18px;">Xin chào <strong>{name}</strong>,</p>
          <p style="margin:0 0 18px;">Khoá học của bạn sắp bắt đầu rồi! Bonu gửi bạn thông tin để chuẩn bị:</p>
          <div style="background:#f8faf9;border-left:4px solid #fcc56c;border-radius:8px;padding:16px 20px;margin:0 0 18px;">
            <p style="margin:0 0 6px;"><strong>Thời gian:</strong> [điền ngày giờ]</p>
            <p style="margin:0 0 6px;"><strong>Địa điểm:</strong> [điền địa chỉ bếp]</p>
            <p style="margin:0;"><strong>Cần mang theo:</strong> [điền nếu có]</p>
          </div>
          <p style="margin:0 0 18px;">Bạn chỉ cần đến đúng giờ với tinh thần thoải mái - toàn bộ nguyên liệu và dụng cụ Bonu đã chuẩn bị sẵn.</p>
          <p style="margin:0;">Hẹn gặp bạn tại bếp! 🌿</p>`,
      }),
    },
    {
      name: 'course-followup-thankyou',
      displayName: 'Khoá học - Cảm ơn / theo sát sau khoá',
      description: 'Gửi sau khoá: cảm ơn, nhắc kênh hỗ trợ qua điện thoại/video call.',
      subject: 'Cảm ơn {name} - Bonu đồng hành cùng bạn sau khoá học',
      category: 'course',
      variables: ['name'],
      htmlContent: wrap({
        heading: 'Cảm ơn bạn đã hoàn thành khoá học 💛',
        bodyHtml: `
          <p style="margin:0 0 18px;">Xin chào <strong>{name}</strong>,</p>
          <p style="margin:0 0 18px;">Cảm ơn bạn đã tin tưởng và hoàn thành khoá học cùng Bonu Cakes. Đây mới chỉ là điểm bắt đầu - Bonu sẽ tiếp tục đồng hành cùng bạn.</p>
          <p style="margin:0 0 18px;">Khi về làm thật mà gặp lỗi (nhân, sốt, hay khâu chuẩn bị), bạn cứ liên hệ Bonu qua điện thoại hoặc video call để được hỗ trợ cho đến khi làm ra sản phẩm đạt chuẩn để bán.</p>
          <p style="margin:0 0 18px;">Khi bạn sẵn sàng mở bán, Bonu cũng có thể hỗ trợ quảng bá trên fanpage cộng đồng người Việt tại UK.</p>
          <p style="margin:0;">Chúc bạn kinh doanh thật thuận lợi! 🌿</p>`,
      }),
    },
  ]

  for (const t of manualTemplates) {
    await prisma.emailTemplate.upsert({
      where: { name: t.name },
      // Làm mới nội dung khi re-run, nhưng KHÔNG đụng `active` (giữ tuỳ chỉnh của admin).
      update: {
        displayName: t.displayName,
        description: t.description,
        subject: t.subject,
        category: t.category,
        variables: t.variables,
        htmlContent: t.htmlContent,
        updatedAt: new Date(),
      },
      create: { ...t, active: true, isDefault: false },
    })
    console.log(`Upserted manual template: ${t.name}`)
  }

  console.log('Seeding completed!')
}

main()
  .catch((e) => {
    console.error('Error seeding templates:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
