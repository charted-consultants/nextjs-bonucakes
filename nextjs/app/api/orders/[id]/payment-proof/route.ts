import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { uploadToR2, isR2Configured } from '@/lib/r2-storage';
import { Resend } from 'resend';

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'Bonu F&B <noreply@chartedconsultants.com>';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'bonucakes6@gmail.com';
const INFO_EMAIL = 'info@bonucakes.com';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const orderId = params.id;

    const order = await prisma.order.findFirst({
      where: { id: orderId, deletedAt: null },
      include: { items: true },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (order.paymentStatus === 'paid') {
      return NextResponse.json({ error: 'Order already paid' }, { status: 400 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type. Only images allowed.' }, { status: 400 });
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large. Max 10MB.' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const ext = file.type.split('/')[1].replace('jpeg', 'jpg');
    const key = `payment-proofs/${order.orderNumber}-${Date.now()}.${ext}`;

    let proofUrl = '';

    if (isR2Configured()) {
      const result = await uploadToR2(key, buffer, file.type);
      proofUrl = result.url;
    } else {
      // Fallback: store as base64 data URL (dev only)
      proofUrl = `data:${file.type};base64,${buffer.toString('base64')}`;
    }

    await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentProofUrl: proofUrl,
        paymentProofUploadedAt: new Date(),
        updatedAt: new Date(),
      },
    });

    await prisma.orderHistory.create({
      data: {
        orderId,
        status: order.status,
        note: 'Khách đã upload ảnh xác nhận chuyển khoản',
      },
    });

    // Notify admin
    try {
      const apiKey = process.env.RESEND_API_KEY;
      if (apiKey) {
        const resend = new Resend(apiKey);
        const itemsSummary = order.items
          .map(i => `${i.quantity}x ${i.productName}`)
          .join(', ');

        const isBase64 = proofUrl.startsWith('data:');
        const imageHtml = isBase64
          ? `<img src="${proofUrl}" style="max-width:500px;border:2px solid #fcc56c;border-radius:4px;" />`
          : `<img src="${proofUrl}" style="max-width:500px;border:2px solid #fcc56c;border-radius:4px;" />`;

        await resend.emails.send({
          from: FROM_EMAIL,
          to: [INFO_EMAIL, ADMIN_EMAIL],
          subject: `[Ảnh CK] Đơn #${order.orderNumber} - ${order.customerName}`,
          html: `
            <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px;">
              <h2 style="color:#083121;">Khách đã gửi ảnh chuyển khoản</h2>
              <div style="background:#f8faf9;padding:16px;border:2px solid #fcc56c;border-radius:4px;margin:16px 0;">
                <p style="margin:0 0 8px 0;"><strong>Mã đơn:</strong> #${order.orderNumber}</p>
                <p style="margin:0 0 8px 0;"><strong>Khách hàng:</strong> ${order.customerName}</p>
                <p style="margin:0 0 8px 0;"><strong>Email:</strong> ${order.customerEmail}</p>
                <p style="margin:0 0 8px 0;"><strong>Sản phẩm:</strong> ${itemsSummary}</p>
                <p style="margin:0;"><strong>Tổng tiền:</strong> £${Number(order.total).toFixed(2)}</p>
              </div>
              <h3 style="color:#083121;">Ảnh xác nhận chuyển khoản:</h3>
              ${imageHtml}
              <p style="margin-top:20px;color:#4a5c52;">Vui lòng kiểm tra và duyệt đơn tại <a href="${process.env.NEXTAUTH_URL || 'https://staging.bonuscakes.com'}/admin/orders">trang quản lý đơn hàng</a>.</p>
            </div>
          `,
        });
      }
    } catch (emailErr) {
      console.error('[payment-proof] Failed to send admin notification:', emailErr);
    }

    return NextResponse.json({ success: true, proofUrl });
  } catch (error) {
    console.error('[payment-proof] Error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
