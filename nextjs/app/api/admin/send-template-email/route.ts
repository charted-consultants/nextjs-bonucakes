import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Resend } from "resend";
import { prisma } from "@/lib/prisma";
import { renderTemplate } from "@/lib/email-templates/render-template";

// Gửi 1 email template (chọn từ DB) cho danh sách người nhận admin tick chọn.
// Dùng chung cho trang Workshop và trang Khoá học. Hỗ trợ gửi ngay hoặc hẹn giờ (Resend).
// Mỗi lần gửi đều ghi lại 1 EmailCampaign để hiện ở trang "Lịch sử Email".

const FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL || "Bonucakes - Bếp Bà Bo <noreply@chartedconsultants.com>";

type Recipient = { email: string; name?: string | null; customerId?: number | null };

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const recipients: Recipient[] = body.recipients;
    const templateId: number = body.templateId;
    const scheduledAt: string | null = body.scheduledAt || null;
    const sourceLabel: string = (body.sourceLabel || "Email thủ công").toString();

    if (!Array.isArray(recipients) || recipients.length === 0) {
      return NextResponse.json({ error: "Cần ít nhất 1 người nhận" }, { status: 400 });
    }
    if (!templateId || typeof templateId !== "number") {
      return NextResponse.json({ error: "Vui lòng chọn mẫu email" }, { status: 400 });
    }

    // Lấy template + kiểm tra còn hiệu lực (defense-in-depth, client cũng đã lọc).
    const template = await prisma.emailTemplate.findUnique({ where: { id: templateId } });
    if (!template || template.deletedAt || !template.active) {
      return NextResponse.json({ error: "Mẫu email không tồn tại hoặc đã tắt" }, { status: 404 });
    }

    // Dedupe theo email (lowercase), giữ name + customerId gặp đầu tiên.
    const seen = new Set<string>();
    const valid: Recipient[] = [];
    for (const r of recipients) {
      const email = (r?.email || "").trim().toLowerCase();
      if (!email || !email.includes("@") || seen.has(email)) continue;
      seen.add(email);
      valid.push({ email, name: r.name, customerId: r.customerId ?? null });
    }
    if (valid.length === 0) {
      return NextResponse.json({ error: "Không có email hợp lệ" }, { status: 400 });
    }

    // Validate scheduledAt (nếu có): phải là thời điểm tương lai.
    if (scheduledAt) {
      const t = new Date(scheduledAt).getTime();
      if (Number.isNaN(t)) {
        return NextResponse.json({ error: "Thời gian hẹn không hợp lệ" }, { status: 400 });
      }
      if (t <= Date.now()) {
        return NextResponse.json({ error: "Thời gian hẹn phải ở tương lai" }, { status: 400 });
      }
    }

    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json({ error: "Thiếu RESEND_API_KEY" }, { status: 500 });
    }
    const resend = new Resend(process.env.RESEND_API_KEY);
    const subject = template.subject || sourceLabel;
    const stamp = scheduledAt ? new Date(scheduledAt) : new Date();

    // Tạo bản ghi campaign TRƯỚC để luôn xuất hiện ở lịch sử (kể cả khi gửi lỗi giữa chừng).
    const campaign = await prisma.emailCampaign.create({
      data: {
        name: sourceLabel,
        category: template.category || "manual",
        subject,
        htmlTemplate: template.htmlContent,
        filters: {
          templateId: template.id,
          templateName: template.name,
          source: sourceLabel,
          scheduledAt: scheduledAt || null,
        },
        totalRecipients: valid.length,
        createdBy: session.user.email || undefined,
        sentAt: stamp,
      },
    });

    let sent = 0;
    const errors: string[] = [];

    for (const r of valid) {
      try {
        // Cá nhân hoá: thay {name}, {email} trong template.
        const html = renderTemplate(template.htmlContent, {
          name: r.name || "",
          email: r.email,
        });
        const { error } = await resend.emails.send({
          from: FROM_EMAIL,
          to: r.email,
          subject,
          html,
          ...(scheduledAt ? { scheduledAt } : {}),
        });
        if (error) throw new Error(error.message);
        sent++;

        // Chỉ log recipient khi có customerId (FK bắt buộc) — tránh lỗi ràng buộc.
        if (typeof r.customerId === "number") {
          try {
            await prisma.emailCampaignRecipient.create({
              data: { campaignId: campaign.id, customerId: r.customerId, sentAt: stamp },
            });
          } catch (recErr) {
            console.error(`Không log được recipient ${r.email}:`, recErr);
          }
        }
      } catch (err: any) {
        console.error(`send-template-email lỗi cho ${r.email}:`, err);
        errors.push(`${r.email}: ${err.message}`);
      }
      // chống rate-limit (Resend ~2 req/s)
      await sleep(550);
    }

    return NextResponse.json({
      sent,
      total: valid.length,
      scheduled: Boolean(scheduledAt),
      scheduledAt: scheduledAt || undefined,
      campaignId: campaign.id,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error("send-template-email error:", error);
    return NextResponse.json({ error: "Gửi email thất bại" }, { status: 500 });
  }
}
