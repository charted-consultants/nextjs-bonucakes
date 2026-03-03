import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

const emailTemplates = {
  plain: (content: string, name: string) => content.replace(/{name}/g, name),

  newsletter: (content: string, name: string) => `
    <!DOCTYPE html>
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
                      Hello ${name},
                    </p>
                    <div style="font-size: 16px; color: #333333; line-height: 1.6;">
                      ${content.replace(/{name}/g, name)}
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
    </html>
  `,

  promotion: (content: string, name: string) => `
    <!DOCTYPE html>
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
                      Hi ${name}!
                    </p>
                    <div style="font-size: 16px; color: #333333; line-height: 1.8;">
                      ${content.replace(/{name}/g, name)}
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
    </html>
  `,

  announcement: (content: string, name: string) => `
    <!DOCTYPE html>
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
                      Dear ${name},
                    </p>
                    <div style="font-size: 16px; color: #333333; line-height: 1.6;">
                      ${content.replace(/{name}/g, name)}
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
    </html>
  `,
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { recipients, subject, content, template } = await request.json()

    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return NextResponse.json(
        { error: "Recipients required" },
        { status: 400 }
      )
    }

    if (!subject || !content) {
      return NextResponse.json(
        { error: "Subject and content required" },
        { status: 400 }
      )
    }

    const templateFn = emailTemplates[template as keyof typeof emailTemplates] || emailTemplates.plain

    let sent = 0
    const errors: string[] = []

    // Send emails in batches to avoid rate limits
    for (const recipient of recipients) {
      try {
        const html = templateFn(content, recipient.name)

        await resend.emails.send({
          from: "Bonu Cakes <noreply@bonucakes.co.uk>",
          to: recipient.email,
          subject: subject,
          html: html,
        })

        sent++
      } catch (error: any) {
        console.error(`Failed to send to ${recipient.email}:`, error)
        errors.push(`${recipient.email}: ${error.message}`)
      }
    }

    return NextResponse.json({
      sent,
      total: recipients.length,
      errors: errors.length > 0 ? errors : undefined,
    })
  } catch (error) {
    console.error("Error sending bulk email:", error)
    return NextResponse.json(
      { error: "Failed to send emails" },
      { status: 500 }
    )
  }
}
