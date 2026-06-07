import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function checkAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") return null;
  return session;
}

// PUT: cập nhật 1 chiến dịch NHÁP (chỉ khi chưa gửi). Đã gửi thì không sửa.
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await checkAdmin();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const id = parseInt(params.id);
    if (Number.isNaN(id)) return NextResponse.json({ error: "ID không hợp lệ" }, { status: 400 });

    const existing = await prisma.emailCampaign.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: "Không tìm thấy chiến dịch" }, { status: 404 });
    if (existing.sentAt) {
      return NextResponse.json({ error: "Chiến dịch đã gửi, không sửa được" }, { status: 400 });
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

    const campaign = await prisma.emailCampaign.update({
      where: { id },
      data: {
        name,
        category: template.category || "marketing",
        subject: subject || template.subject || "",
        htmlTemplate: template.htmlContent,
        filters: { ...(filters || {}), templateId },
      },
    });

    return NextResponse.json({ campaign });
  } catch (error) {
    console.error("Error updating draft campaign:", error);
    return NextResponse.json({ error: "Failed to update draft" }, { status: 500 });
  }
}

// DELETE: xoá hẳn 1 chiến dịch (nháp hoặc đã gửi). Recipient tự xoá theo cascade.
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await checkAdmin();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const id = parseInt(params.id);
    if (Number.isNaN(id)) return NextResponse.json({ error: "ID không hợp lệ" }, { status: 400 });

    await prisma.emailCampaign.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting campaign:", error);
    return NextResponse.json({ error: "Failed to delete campaign" }, { status: 500 });
  }
}
