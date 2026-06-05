import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Resend } from "resend";
import {
  WORKSHOP_REMINDER_SUBJECT,
  workshopReminderHtml,
} from "@/lib/email-templates/workshop-reminder";

// Gửi MANUAL email "1 ngày nữa workshop" cho danh sách người nhận admin chọn.
// Hỗ trợ gửi ngay (scheduledAt rỗng) hoặc hẹn giờ (scheduledAt = ISO 8601, dùng Resend).

const FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL || "Bonucakes - Bếp Bà Bo <noreply@chartedconsultants.com>";

type Recipient = { email: string; name?: string | null };

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const recipients: Recipient[] = body.recipients;
    const scheduledAt: string | null = body.scheduledAt || null;

    if (!Array.isArray(recipients) || recipients.length === 0) {
      return NextResponse.json({ error: "Cần ít nhất 1 người nhận" }, { status: 400 });
    }

    // Dedupe theo email (chuẩn hoá lowercase), bỏ email rỗng/không hợp lệ
    const seen = new Set<string>();
    const valid: Recipient[] = [];
    for (const r of recipients) {
      const email = (r?.email || "").trim().toLowerCase();
      if (!email || !email.includes("@") || seen.has(email)) continue;
      seen.add(email);
      valid.push({ email, name: r.name });
    }
    if (valid.length === 0) {
      return NextResponse.json({ error: "Không có email hợp lệ" }, { status: 400 });
    }

    // Validate scheduledAt (nếu có): phải là thời điểm tương lai
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
    const html = workshopReminderHtml();

    let sent = 0;
    const errors: string[] = [];

    for (const r of valid) {
      try {
        const { error } = await resend.emails.send({
          from: FROM_EMAIL,
          to: r.email,
          subject: WORKSHOP_REMINDER_SUBJECT,
          html,
          ...(scheduledAt ? { scheduledAt } : {}),
        });
        if (error) throw new Error(error.message);
        sent++;
      } catch (err: any) {
        console.error(`send-reminder lỗi cho ${r.email}:`, err);
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
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error("send-reminder error:", error);
    return NextResponse.json({ error: "Gửi email thất bại" }, { status: 500 });
  }
}
