/**
 * Admin Individual Order API
 * GET: Get a single order by ID
 * PUT: Update order status, payment status, notes, etc.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { Resend } from 'resend';

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'Bonu F&B <noreply@chartedconsultants.com>';

function buildDpdTrackingUrl(trackingNumber: string, postcode?: string): string {
  const base = `https://track.dpd.co.uk/search?reference=${encodeURIComponent(trackingNumber)}`;
  if (postcode) {
    const cleanPostcode = postcode.replace(/\s+/g, '');
    return `${base}&postcode=${encodeURIComponent(cleanPostcode)}`;
  }
  return base;
}

async function sendShippingEmail(order: any, trackingNumber: string) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return;

  const resend = new Resend(apiKey);

  // Extract postcode from shipping address
  const addr = order.shippingAddress as any;
  const postcode = addr?.postalCode || addr?.postcode || '';
  const trackingUrl = buildDpdTrackingUrl(trackingNumber, postcode);

  const itemsHtml = order.items
    .map((i: any) => `<li style="margin:4px 0;">${i.quantity}x ${i.productName}</li>`)
    .join('');

  const html = `
    <div style="font-family:sans-serif;max-width:650px;margin:0 auto;padding:8px;background:#f8faf9;">
      <div style="background:linear-gradient(135deg,#083121,#4a5c52);color:#f8faf9;padding:20px;text-align:center;border-radius:8px 8px 0 0;">
        <h1 style="margin:0;font-size:2em;color:#fcc56c;">Bonu F&B</h1>
        <p style="margin:10px 0 0 0;">Đơn hàng đang trên đường đến bạn!</p>
      </div>
      <div style="background:#fff;padding:20px;border:1px solid #fcc56c;border-top:none;border-radius:0 0 8px 8px;">
        <p style="font-size:1.1em;">Xin chào <strong>${order.customerName}</strong>,</p>
        <p>Đơn hàng của bạn đã được giao cho DPD và đang trên đường vận chuyển. Bạn có thể theo dõi hành trình giao hàng theo thông tin bên dưới.</p>

        <div style="background:#f8faf9;padding:15px;border-left:4px solid #fcc56c;margin:20px 0;border-radius:4px;">
          <p style="margin:0 0 5px 0;color:#083121;font-weight:bold;">MÃ ĐƠN HÀNG</p>
          <p style="margin:0;font-size:1.3em;font-weight:bold;color:#083121;">#${order.orderNumber}</p>
        </div>

        <div style="background:#E8F5E9;padding:15px;border-left:4px solid #4CAF50;margin:20px 0;border-radius:4px;">
          <p style="margin:0 0 8px 0;color:#2E7D32;font-weight:bold;font-size:1.1em;">MÃ VẬN ĐƠN DPD</p>
          <p style="margin:0 0 12px 0;font-size:1.4em;font-weight:bold;color:#083121;letter-spacing:1px;">${trackingNumber}</p>
          <a href="${trackingUrl}"
             style="display:inline-block;background:#4CAF50;color:#fff;padding:12px 24px;text-decoration:none;font-weight:bold;border-radius:4px;font-size:1em;">
            Theo dõi đơn hàng trên DPD
          </a>
        </div>

        <h3 style="color:#083121;">Sản phẩm trong đơn:</h3>
        <ul style="color:#4a5c52;padding-left:20px;margin:0 0 16px 0;">${itemsHtml}</ul>
        <p style="color:#4a5c52;"><strong>Tổng tiền:</strong> £${Number(order.total).toFixed(2)}</p>

        <div style="background:#E3F2FD;padding:15px;border-left:4px solid #2196F3;margin:20px 0;border-radius:4px;">
          <p style="margin:0;color:#1565C0;font-weight:bold;">LƯU Ý QUAN TRỌNG</p>
          <p style="margin:8px 0 0 0;color:#4a5c52;">Vui lòng cho vào tủ lạnh <strong>ngay khi nhận hàng</strong>. Nếu đơn hàng bị giao trễ hoặc có vấn đề, vui lòng liên hệ Bếp ngay nhé!</p>
        </div>

        <div style="margin-top:24px;padding-top:16px;border-top:1px solid #fcc56c;">
          <p style="color:#4a5c52;margin:0;font-style:italic;">Trân trọng,</p>
          <p style="color:#083121;margin:4px 0 0 0;font-weight:bold;">Uyen Nguyen — Bonu F&B</p>
        </div>
      </div>
    </div>
  `;

  await resend.emails.send({
    from: FROM_EMAIL,
    to: [order.customerEmail],
    subject: `Đơn hàng #${order.orderNumber} đang trên đường — Mã DPD: ${trackingNumber}`,
    html,
  });

  console.log(`[shipping] Tracking email sent to ${order.customerEmail} — DPD ${trackingNumber}`);
}

// Validation schema for updating orders
const orderUpdateSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']).optional(),
  paymentStatus: z.enum(['pending', 'paid', 'failed', 'refunded']).optional(),
  trackingNumber: z.string().optional().nullable(),
  estimatedDelivery: z.string().optional().nullable(),
  adminNote: z.string().optional().nullable(),
}).passthrough(); // Allow additional fields to pass through without validation

// Check if user is authenticated and is admin
async function checkAdminAuth() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return { authorized: false, error: 'Not authenticated' };
  }

  if (session.user.role !== 'admin') {
    return { authorized: false, error: 'Not authorized' };
  }

  return { authorized: true, session };
}

// GET: Get a single order by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authCheck = await checkAdminAuth();
  if (!authCheck.authorized) {
    return NextResponse.json({ error: authCheck.error }, { status: 401 });
  }

  try {
    const orderId = params.id;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                nameVi: true,
                nameEn: true,
                slug: true,
                imageSrc: true,
                available: true,
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        orderHistory: {
          orderBy: {
            createdAt: 'desc',
          },
        },
        orderDiscounts: {
          include: {
            discount: true,
            discountCode: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({ order });
  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json(
      { error: 'Failed to fetch order' },
      { status: 500 }
    );
  }
}

// PUT: Update an order
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authCheck = await checkAdminAuth();
  if (!authCheck.authorized) {
    return NextResponse.json({ error: authCheck.error }, { status: 401 });
  }

  try {
    const orderId = params.id;

    // Check if order exists
    const existingOrder = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!existingOrder) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const body = await request.json();

    // Validate input
    const validatedData = orderUpdateSchema.parse(body);

    // Prepare update data
    const updateData: any = {};

    if (validatedData.status !== undefined) {
      updateData.status = validatedData.status;

      // Set delivered timestamp if status is delivered
      if (validatedData.status === 'delivered' && !existingOrder.deliveredAt) {
        updateData.deliveredAt = new Date();
      }

      // Set cancelled timestamp if status is cancelled
      if (validatedData.status === 'cancelled' && !existingOrder.cancelledAt) {
        updateData.cancelledAt = new Date();
      }
    }

    if (validatedData.paymentStatus !== undefined) {
      updateData.paymentStatus = validatedData.paymentStatus;

      // Set paid timestamp if payment status is paid
      if (validatedData.paymentStatus === 'paid' && !existingOrder.paidAt) {
        updateData.paidAt = new Date();
      }
    }

    if (validatedData.trackingNumber !== undefined) {
      updateData.trackingNumber = validatedData.trackingNumber || null;
    }

    if (validatedData.estimatedDelivery !== undefined) {
      updateData.estimatedDelivery = validatedData.estimatedDelivery ? new Date(validatedData.estimatedDelivery) : null;
    }

    if (validatedData.adminNote !== undefined) {
      updateData.adminNote = validatedData.adminNote || null;
    }

    // Update the order
    const order = await prisma.order.update({
      where: { id: orderId },
      data: updateData,
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    // Create order history entry
    if (validatedData.status && validatedData.status !== existingOrder.status) {
      await prisma.orderHistory.create({
        data: {
          orderId: order.id,
          status: validatedData.status,
          note: validatedData.adminNote || `Order status changed to ${validatedData.status}`,
          createdBy: authCheck.session?.user?.email || 'admin',
        },
      });
    }

    // Send DPD tracking email when tracking number is first added
    const trackingNum = validatedData.trackingNumber;
    const trackingJustAdded = trackingNum && !existingOrder.trackingNumber;

    if (trackingJustAdded) {
      try {
        await sendShippingEmail(order, trackingNum);
        await prisma.orderHistory.create({
          data: {
            orderId: order.id,
            status: 'shipped',
            note: `Email tracking DPD đã gửi cho khách — mã: ${trackingNum}`,
            createdBy: authCheck.session?.user?.email || 'admin',
          },
        });
      } catch (emailErr) {
        console.error('[shipping] Failed to send tracking email:', emailErr);
      }
    }

    return NextResponse.json({
      message: 'Order updated successfully',
      order,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error updating order:', error);
    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500 }
    );
  }
}
