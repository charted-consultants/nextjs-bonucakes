import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

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
