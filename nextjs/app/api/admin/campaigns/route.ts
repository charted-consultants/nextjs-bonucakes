import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET: danh sách email/chiến dịch đã gửi (để hiện ở trang "Lịch sử Email").
// Gồm cả campaign từ Email Marketing lẫn các lần gửi thủ công workshop/khoá học.
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const limit = Number(request.nextUrl.searchParams.get("limit")) || 100;
    const status = request.nextUrl.searchParams.get("status");

    // sentAt = null → nháp; sentAt != null → đã gửi.
    const where =
      status === "sent"
        ? { sentAt: { not: null } }
        : status === "draft"
        ? { sentAt: null }
        : {};

    const campaigns = await prisma.emailCampaign.findMany({
      where,
      orderBy: [{ sentAt: "desc" }, { createdAt: "desc" }],
      take: Math.min(limit, 500),
      select: {
        id: true,
        name: true,
        category: true,
        subject: true,
        totalRecipients: true,
        sentAt: true,
        createdBy: true,
        createdAt: true,
        filters: true,
      },
    });

    return NextResponse.json({ campaigns });
  } catch (error) {
    console.error("Error fetching email campaigns:", error);
    return NextResponse.json({ error: "Failed to fetch campaigns" }, { status: 500 });
  }
}

// POST: tạo 1 chiến dịch NHÁP (chưa gửi → sentAt = null).
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, templateId, subject, filters } = body;

    if (!name || !templateId) {
      return NextResponse.json({ error: "Cần tên chiến dịch và mẫu email" }, { status: 400 });
    }

    const template = await prisma.emailTemplate.findUnique({ where: { id: templateId } });
    if (!template || template.deletedAt) {
      return NextResponse.json({ error: "Mẫu email không tồn tại" }, { status: 404 });
    }

    const campaign = await prisma.emailCampaign.create({
      data: {
        name,
        category: template.category || "marketing",
        subject: subject || template.subject || "",
        htmlTemplate: template.htmlContent,
        filters: { ...(filters || {}), templateId },
        totalRecipients: 0,
        createdBy: session.user.email || undefined,
        sentAt: null, // NHÁP
      },
    });

    return NextResponse.json({ campaign });
  } catch (error) {
    console.error("Error creating draft campaign:", error);
    return NextResponse.json({ error: "Failed to create draft" }, { status: 500 });
  }
}
