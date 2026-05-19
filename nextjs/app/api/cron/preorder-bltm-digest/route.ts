import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Resend } from 'resend';

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'Bếp Bà Bo <noreply@chartedconsultants.com>';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'info@bonucakes.com';
const CRON_SECRET = process.env.CRON_SECRET || '';

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const secret = request.nextUrl.searchParams.get('secret');
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}` && secret !== CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) return NextResponse.json({ error: 'RESEND_API_KEY not configured' }, { status: 500 });

    // Today range in VN timezone
    const nowVN = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' }));
    const startOfTodayVN = new Date(nowVN);
    startOfTodayVN.setHours(0, 0, 0, 0);
    // Convert back to UTC for DB query
    const offsetMs = new Date().getTime() - new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' })).getTime();
    const startOfTodayUTC = new Date(startOfTodayVN.getTime() + offsetMs);

    const allOrders = await prisma.workshopRegistration.findMany({
      where: { workshopName: 'Pre-Order BLTM', deletedAt: null },
      include: { customer: { select: { name: true, email: true, phone: true } } },
      orderBy: { createdAt: 'desc' },
    });

    const todayOrders = allOrders.filter(o => o.createdAt >= startOfTodayUTC);

    // Skip sending if no orders at all
    if (allOrders.length === 0) {
      return NextResponse.json({ message: 'No preorders yet', sent: false });
    }

    const totalCakes = allOrders.reduce((s, o) => s + (o.preorderQuantity ?? 1), 0);
    const totalRevenue = totalCakes * 40;
    const todayCakes = todayOrders.reduce((s, o) => s + (o.preorderQuantity ?? 1), 0);

    const dateStr = nowVN.toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' });

    const todayRowsHtml = todayOrders.length > 0
      ? todayOrders.map((o, i) => {
          const qty = o.preorderQuantity ?? 1;
          const name = o.customer?.name || '—';
          const phone = o.phone || o.customer?.phone || '—';
          const location = o.location || '—';
          const time = o.createdAt.toLocaleTimeString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh', hour: '2-digit', minute: '2-digit' });
          return `<tr style="border-bottom:1px solid #e8f0eb;">
            <td style="padding:8px 6px;color:#083121;">${i + 1}</td>
            <td style="padding:8px 6px;color:#083121;font-weight:600;">${name}</td>
            <td style="padding:8px 6px;color:#4a5c52;">${phone}</td>
            <td style="padding:8px 6px;color:#4a5c52;">${location}</td>
            <td style="padding:8px 6px;text-align:center;font-weight:bold;color:#083121;">${qty} cái</td>
            <td style="padding:8px 6px;color:#4a5c52;font-size:12px;">${time}</td>
          </tr>`;
        }).join('')
      : `<tr><td colspan="6" style="padding:16px;text-align:center;color:#4a5c52;">Không có đơn mới hôm nay</td></tr>`;

    const html = `
<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="font-family:Arial,sans-serif;background:#f8faf9;margin:0;padding:0;">
<div style="max-width:650px;margin:40px auto;background:#fff;border:2px solid #fcc56c;border-radius:8px;overflow:hidden;">
  <div style="background:#083121;padding:28px 30px;text-align:center;">
    <h1 style="margin:0;font-size:22px;font-family:Georgia,serif;color:#fcc56c;">Tổng kết Pre-Order BLTM</h1>
    <p style="margin:8px 0 0;color:#f8faf9;font-size:13px;">${dateStr}</p>
  </div>
  <div style="padding:32px 30px;">

    <div style="display:flex;gap:12px;margin-bottom:28px;">
      <div style="flex:1;background:#083121;border-radius:6px;padding:16px;text-align:center;">
        <p style="margin:0 0 4px;font-size:28px;font-weight:bold;color:#fcc56c;">${allOrders.length}</p>
        <p style="margin:0;font-size:12px;color:#a3b8a8;">Tổng đơn</p>
      </div>
      <div style="flex:1;background:#083121;border-radius:6px;padding:16px;text-align:center;">
        <p style="margin:0 0 4px;font-size:28px;font-weight:bold;color:#fcc56c;">${totalCakes}</p>
        <p style="margin:0;font-size:12px;color:#a3b8a8;">Tổng bánh</p>
      </div>
      <div style="flex:1;background:#083121;border-radius:6px;padding:16px;text-align:center;">
        <p style="margin:0 0 4px;font-size:28px;font-weight:bold;color:#fcc56c;">£${totalRevenue}</p>
        <p style="margin:0;font-size:12px;color:#a3b8a8;">Doanh thu dự kiến</p>
      </div>
    </div>

    <h3 style="color:#083121;margin:0 0 12px;font-size:15px;">
      Hôm nay — ${todayOrders.length} đơn mới / ${todayCakes} cái
    </h3>
    <table style="width:100%;border-collapse:collapse;font-size:13px;background:#f8faf9;border-radius:4px;overflow:hidden;">
      <thead>
        <tr style="background:#e8f0eb;">
          <th style="padding:8px 6px;text-align:left;color:#4a5c52;">#</th>
          <th style="padding:8px 6px;text-align:left;color:#4a5c52;">Tên</th>
          <th style="padding:8px 6px;text-align:left;color:#4a5c52;">SĐT</th>
          <th style="padding:8px 6px;text-align:left;color:#4a5c52;">Địa chỉ</th>
          <th style="padding:8px 6px;text-align:center;color:#4a5c52;">Số lượng</th>
          <th style="padding:8px 6px;text-align:left;color:#4a5c52;">Giờ</th>
        </tr>
      </thead>
      <tbody>${todayRowsHtml}</tbody>
    </table>

  </div>
  <div style="background:#f8faf9;padding:16px 30px;text-align:center;border-top:1px solid #fcc56c;">
    <p style="margin:0;color:#4a5c52;font-size:12px;">Digest tự động — bonucakes.com</p>
  </div>
</div>
</body></html>`.trim();

    const resend = new Resend(apiKey);
    await resend.emails.send({
      from: FROM_EMAIL,
      to: ADMIN_EMAIL,
      subject: `[BLTM Digest] ${dateStr} — ${allOrders.length} đơn / ${totalCakes} cái / £${totalRevenue}`,
      html,
    });

    return NextResponse.json({ message: 'Digest sent', totalOrders: allOrders.length, todayOrders: todayOrders.length });
  } catch (error) {
    console.error('[cron/preorder-bltm-digest] error:', error);
    return NextResponse.json({ error: 'Cron job failed' }, { status: 500 });
  }
}
