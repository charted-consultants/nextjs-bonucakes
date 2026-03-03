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
