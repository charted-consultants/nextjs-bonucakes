/**
 * Orders API - Create new order with email confirmation
 * POST: Create order, save to database, and send confirmation emails
 */

import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { prisma } from '@/lib/prisma';
import {
  generateAdminEmail,
  generateCustomerEmail,
  type OrderEmailData,
  type OrderItem as EmailOrderItem,
  type BankDetails,
} from '@/lib/email-templates/order-emails';

// Initialize Resend
function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error('RESEND_API_KEY is not configured');
  }
  return new Resend(apiKey);
}

// Bank details configuration
const BANK_DETAILS: BankDetails = {
  bankName: 'HSBC',
  accountName: 'N M U NGUYEN',
  sortCode: '40-20-16',
  accountNumber: '22101505',
};

// Email configuration
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'Bonu F&B <noreply@chartedconsultants.com>';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'bonucakes@gmail.com';

// Order item interface for request
interface OrderItemRequest {
  productId: number | string;
  productName: string;
  quantity: number;
  unitPrice?: number;
  unitVi?: string;
  unitEn?: string;
  unit?: string;
}

// Request body interface
interface OrderRequest {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  deliveryAddress: string;
  deliveryDate?: string;
  specialNotes?: string;
  items: OrderItemRequest[];
  pricing: {
    currency: string;
    subtotal: number;
    shippingFee: number;
    total: number;
    shippingLabel: string;
  };
}

// Helper: Generate order ID (BM-YYYYMMDD-XXX)
function generateOrderId(): string {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
  const randomNum = Math.floor(Math.random() * 900) + 100; // 3-digit random
  return `BM-${dateStr}-${randomNum}`;
}

// Helper: Generate short 4-digit code from order ID
function generateShortCode(orderId: string): string {
  if (!orderId) return String(Math.floor(Math.random() * 10000)).padStart(4, '0');
  let h = 5381;
  for (let i = 0; i < orderId.length; i++) {
    h = ((h << 5) + h) + orderId.charCodeAt(i);
  }
  const n = Math.abs(h >>> 0) % 10000;
  return String(n).padStart(4, '0');
}

// Helper: Calculate free items for "Buy 10 Get 1 Free" promotion
function calculateFreeItems(quantity: number): number {
  return Math.floor(quantity / 10);
}

// POST: Create new order
export async function POST(request: NextRequest) {
  try {
    const body: OrderRequest = await request.json();

    // Validate required fields
    const { customerName, customerEmail, customerPhone, deliveryAddress, items, pricing } = body;

    if (!customerName || !customerEmail || !customerPhone || !deliveryAddress) {
      return NextResponse.json(
        { error: 'Missing required customer fields' },
        { status: 400 }
      );
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Must provide at least one item' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customerEmail)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate quantities
    for (const item of items) {
      if (item.quantity < 1 || item.quantity > 50) {
        return NextResponse.json(
          { error: `Invalid quantity for ${item.productName} (must be 1-50)` },
          { status: 400 }
        );
      }
    }

    // Generate order ID and code
    const orderId = generateOrderId();
    const orderCode = generateShortCode(orderId);

    // Process items with free item calculations
    const processedItems: EmailOrderItem[] = items.map(item => {
      const freeItems = calculateFreeItems(item.quantity);
      const unitPrice = item.unitPrice || 0;
      return {
        ...item,
        productId: typeof item.productId === 'string' ? parseInt(item.productId) : item.productId,
        unitPrice,
        freeItems,
        actualQuantity: item.quantity + freeItems,
      };
    });

    // Save order to database
    const shippingAddress = {
      street: deliveryAddress,
      city: '',
      country: 'UK',
      postalCode: '',
    };

    const order = await prisma.order.create({
      data: {
        orderNumber: orderCode,
        customerName,
        customerEmail,
        customerPhone,
        shippingAddress,
        subtotal: pricing.subtotal,
        shippingCost: pricing.shippingFee,
        total: pricing.total,
        currency: pricing.currency || 'GBP',
        status: 'pending',
        paymentStatus: 'pending',
        paymentMethod: 'bank_transfer',
        shippingMethod: pricing.shippingLabel || 'UK Mainland',
        customerNote: body.specialNotes || null,
        items: {
          create: processedItems.map(item => ({
            product: {
              connect: { id: Number(item.productId) }
            },
            productName: item.productName,
            quantity: item.quantity,
            price: item.unitPrice,
            subtotal: item.unitPrice * item.quantity,
            variant: item.freeItems ? {
              freeItems: item.freeItems,
              actualQuantity: item.actualQuantity,
              promotion: 'Buy 10 Get 1 Free',
            } : undefined,
          })),
        },
      },
      include: {
        items: true,
      },
    });

    // Create order history entry
    await prisma.orderHistory.create({
      data: {
        orderId: order.id,
        status: 'pending',
        note: 'Order created via website',
      },
    });

    // Prepare email data
    const emailData: OrderEmailData = {
      orderCode,
      orderId,
      customerName,
      customerEmail,
      customerPhone,
      deliveryAddress,
      deliveryDate: body.deliveryDate,
      specialNotes: body.specialNotes,
      items: processedItems,
      pricing,
    };

    const submissionDate = new Date().toLocaleDateString('vi-VN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    // Send emails via Resend
    const resend = getResendClient();

    try {
      // Send admin notification
      await resend.emails.send({
        from: FROM_EMAIL,
        to: [ADMIN_EMAIL],
        replyTo: customerEmail,
        subject: `[Đơn hàng mới #${orderCode}] ${items.length > 1 ? `${items.length} sản phẩm` : items[0].productName}`,
        html: generateAdminEmail(emailData, submissionDate),
      });

      console.log(`[bonucakes] Admin notification sent for order ${orderCode}`);

      // Send customer confirmation
      await resend.emails.send({
        from: FROM_EMAIL,
        to: [customerEmail],
        subject: `Xác nhận đơn hàng #${orderCode} - Bonu Cakes`,
        html: generateCustomerEmail(emailData, BANK_DETAILS),
      });

      console.log(`[bonucakes] Customer confirmation sent for order ${orderCode}`);
    } catch (emailError) {
      console.error('Error sending emails:', emailError);
      // Don't fail the order creation if email fails
      // The order is already saved in the database
    }

    // Update or create customer record
    try {
      await prisma.customer.upsert({
        where: { email: customerEmail },
        update: {
          name: customerName,
          phone: customerPhone,
          totalOrders: { increment: 1 },
          totalSpent: { increment: pricing.total },
          lastOrderDate: new Date(),
        },
        create: {
          name: customerName,
          email: customerEmail,
          phone: customerPhone,
          marketingConsent: false,
          consentSource: 'order',
          totalOrders: 1,
          totalSpent: pricing.total,
          lastOrderDate: new Date(),
        },
      });
    } catch (customerError) {
      console.error('Error updating customer record:', customerError);
      // Don't fail the order if customer update fails
    }

    console.log(`[bonucakes] Order ${orderId} (code: ${orderCode}) processed successfully`);

    return NextResponse.json({
      success: true,
      orderId,
      orderCode,
      message: 'Đơn hàng đã được ghi nhận. Chúng tôi sẽ liên hệ với bạn sớm nhất.',
    });
  } catch (error) {
    console.error('Error processing order:', error);
    return NextResponse.json(
      { error: 'Failed to process order. Please try again later.' },
      { status: 500 }
    );
  }
}
