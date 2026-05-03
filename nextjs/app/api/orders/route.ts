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
import { getOrderTemplate, renderTemplate } from '@/lib/email-templates/render-template';

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
  bankName: 'Tide (Business Account)',
  accountName: 'Bonu Cakes Ltd',
  sortCode: '04-06-05',
  accountNumber: '18828806',
};

// Email configuration
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'Bonu F&B <noreply@chartedconsultants.com>';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'bonucakes6@gmail.com';
const INFO_EMAIL = 'info@bonucakes.com';

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
  deliveryCity?: string;
  deliveryPostcode?: string;
  deliveryDate?: string;
  specialNotes?: string;
  paymentMethod?: 'bank_transfer' | 'stripe';
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

    // Generate order number and code
    const orderNumber = generateOrderId();
    const orderCode = generateShortCode(orderNumber);

    // Helper: Extract numeric product ID from slugs, variant IDs, or numeric IDs
    const extractProductId = async (id: string | number): Promise<number | null> => {
      if (typeof id === 'number') return id;
      if (typeof id === 'string') {
        // Handle variant IDs like "variant-123" - lookup parent product
        if (id.startsWith('variant-')) {
          const variantId = parseInt(id.replace('variant-', ''));
          if (!isNaN(variantId)) {
            try {
              const variant = await prisma.productVariant.findUnique({
                where: { id: variantId },
                select: { productId: true },
              });
              if (variant) return variant.productId;
            } catch (error) {
              console.error(`Failed to lookup variant ${variantId}:`, error);
            }
          }
        }
        // Try parsing as regular number
        const parsed = parseInt(id);
        if (!isNaN(parsed)) return parsed;

        // Handle product slugs - lookup product by slug
        if (id.includes('-') || id.length > 3) { // Likely a slug
          try {
            const product = await prisma.product.findUnique({
              where: { slug: id },
              select: { id: true },
            });
            if (product) return product.id;
          } catch (error) {
            console.error(`Failed to lookup product slug ${id}:`, error);
          }
        }
      }
      return null;
    };

    // Process items with free item calculations (async to handle variant lookups)
    const processedItems: EmailOrderItem[] = await Promise.all(
      items.map(async (item) => {
        const productId = await extractProductId(item.productId);
        const product = productId ? await prisma.product.findUnique({
          where: { id: productId },
          select: { promoTitle: true },
        }) : null;
        const hasPromo = !!(product?.promoTitle);
        const freeItems = hasPromo ? calculateFreeItems(item.quantity) : 0;
        const unitPrice = item.unitPrice || 0;
        return {
          ...item,
          productId: productId || 0,
          unitPrice,
          freeItems,
          actualQuantity: item.quantity + freeItems,
        };
      })
    );

    // Validate that all items have valid product IDs
    const invalidItems = processedItems.filter(item => {
      const id = typeof item.productId === 'number' ? item.productId : 0;
      return !id || id <= 0;
    });
    if (invalidItems.length > 0) {
      console.error('Invalid product IDs:', invalidItems.map(i => ({ name: i.productName, id: i.productId })));
      return NextResponse.json(
        { error: 'Some products in your cart are no longer available. Please refresh and try again.' },
        { status: 400 }
      );
    }

    // Save order to database
    const shippingAddress = {
      street: deliveryAddress,
      city: body.deliveryCity || '',
      country: 'UK',
      postalCode: body.deliveryPostcode || '',
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
        paymentMethod: null, // Only set when payment is confirmed
        shippingMethod: pricing.shippingLabel || 'UK Mainland',
        customerNote: body.specialNotes || null,
        items: {
          create: processedItems.map(item => {
            const orderItemData: any = {
              productName: item.productName,
              quantity: item.quantity,
              price: item.unitPrice,
              subtotal: item.unitPrice * item.quantity,
              variant: item.freeItems ? {
                freeItems: item.freeItems,
                actualQuantity: item.actualQuantity,
                promotion: 'Buy 10 Get 1 Free',
              } : undefined,
            };

            // Only connect product if we have a valid numeric ID
            const numericId = typeof item.productId === 'number' ? item.productId : 0;
            if (numericId > 0) {
              orderItemData.product = {
                connect: { id: numericId }
              };
            }

            return orderItemData;
          }),
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
      orderId: orderNumber,
      customerName,
      customerEmail,
      customerPhone,
      deliveryAddress,
      deliveryDate: body.deliveryDate,
      specialNotes: body.specialNotes,
      paymentMethod: body.paymentMethod || 'bank_transfer',
      items: processedItems,
      pricing,
    };

    const submissionDate = new Date().toLocaleDateString('vi-VN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    // Send emails immediately for bank transfer orders
    const submissionDateStr = submissionDate;
    try {
      const resend = getResendClient();

      // Build shared order items HTML
      const orderItemsHtml = emailData.items.map(item => {
        const uPrice = Number(item.unitPrice) || 0;
        const lineTotal = uPrice * item.quantity;
        const unitLabel = item.unitVi || item.unit || '';
        const priceStr = emailData.pricing.currency === 'GBP'
          ? `£${uPrice.toFixed(2)}`
          : `${uPrice.toLocaleString('vi-VN')}đ`;
        const lineTotalStr = emailData.pricing.currency === 'GBP'
          ? `£${lineTotal.toFixed(2)}`
          : `${lineTotal.toLocaleString('vi-VN')}đ`;
        return `<div style="background:#f8faf9;padding:12px;border:2px solid #fcc56c;border-radius:4px;margin:16px 0;">
          <p style="margin:0 0 6px 0;font-size:1.1em;"><strong>${item.quantity}x ${item.productName}</strong></p>
          ${uPrice > 0 ? `<p style="margin:0 0 6px 0;color:#4a5c52;">${priceStr}${unitLabel ? ' / ' + unitLabel : ''} × ${item.quantity} = <strong>${lineTotalStr}</strong></p>` : ''}
          ${item.freeItems && item.freeItems > 0 ? `<p style="margin:0;color:#083121;font-weight:bold;">Mua 10 tặng 1 (thực tế ${item.actualQuantity} ổ)</p>` : ''}
        </div>`;
      }).join('');

      const fmt = (n: number) => emailData.pricing.currency === 'GBP' ? `£${n.toFixed(2)}` : `${n.toLocaleString('vi-VN')}đ`;

      // Bank transfer payment section HTML
      const paymentSectionHtml = `
        <h2 style="color:#083121;margin-top:30px;">THANH TOAN</h2>
        <p>Vui long chuyen khoan theo thong tin duoi day:</p>
        <div style="background:#f8faf9;padding:12px;border:2px solid #fcc56c;border-radius:4px;margin:16px 0;">
          <p style="margin:0 0 8px 0;"><strong>Ngan hang:</strong> ${BANK_DETAILS.bankName}</p>
          <p style="margin:0 0 8px 0;"><strong>Ten tai khoan:</strong> ${BANK_DETAILS.accountName}</p>
          <p style="margin:0 0 8px 0;"><strong>Sort Code:</strong> ${BANK_DETAILS.sortCode}</p>
          <p style="margin:0 0 8px 0;"><strong>So tai khoan:</strong> ${BANK_DETAILS.accountNumber}</p>
          <p style="margin:0;padding-top:10px;border-top:1px solid #fcc56c;"><strong>Noi dung chuyen khoan:</strong> <span style="color:#083121;font-size:1.1em;">#${orderCode}</span></p>
        </div>
        <div style="background:#FFF3E0;padding:12px;border-left:4px solid #F57C00;margin:16px 0;border-radius:4px;">
          <p style="margin:0;color:#F57C00;font-weight:bold;">DON HANG DANG CHO THANH TOAN</p>
          <p style="margin:8px 0 0 0;color:#4a5c52;">Don hang se duoc xac nhan sau khi chung toi nhan duoc thanh toan.</p>
        </div>`;

      const commonVars = {
        orderCode,
        customerName,
        orderItemsHtml,
        subtotal: fmt(emailData.pricing.subtotal),
        shippingFee: fmt(emailData.pricing.shippingFee),
        shippingLabel: emailData.pricing.shippingLabel,
        total: fmt(emailData.pricing.total),
        deliveryDate: emailData.deliveryDate
          ? `<p style="margin:10px 0 0 0;"><strong>Ngay giao du kien:</strong> ${emailData.deliveryDate}</p>`
          : '',
      };

      // --- Admin email ---
      const adminTemplate = await getOrderTemplate('order-admin');
      let adminHtml: string;
      let adminSubject = `New Order #${orderCode} - ${customerName}`;
      if (adminTemplate) {
        adminHtml = renderTemplate(adminTemplate.html, {
          ...commonVars,
          customerEmail,
          customerPhone: emailData.customerPhone,
          deliveryAddress: emailData.deliveryAddress,
          submissionDate: submissionDateStr,
          specialNotes: emailData.specialNotes
            ? `<h2 style="color:#083121;margin-top:30px;">GHI CHÚ</h2><p style="background:#f8faf9;padding:12px;border-radius:4px;color:#4a5c52;">${emailData.specialNotes}</p>`
            : '',
          paymentSectionHtml: '',
        });
        if (adminTemplate.subject) adminSubject = renderTemplate(adminTemplate.subject, { orderCode, customerName });
      } else {
        adminHtml = generateAdminEmail(emailData, submissionDateStr);
      }

      // --- Customer email ---
      const customerTemplate = await getOrderTemplate('order-customer');
      let customerHtml: string;
      let customerSubject = `Order Received #${orderCode} - Bonu F&B`;
      if (customerTemplate) {
        customerHtml = renderTemplate(customerTemplate.html, {
          ...commonVars,
          emailTitle: 'Đơn hàng đã nhận',
          emailIntro: 'Cảm ơn bạn đã đặt hàng tại Bonu Cakes! Chúng tôi đã nhận được đơn hàng và đang chờ thanh toán.',
          paymentSectionHtml,
          customerEmail: '',
          customerPhone: '',
          deliveryAddress: '',
          submissionDate: '',
          specialNotes: '',
        });
        if (customerTemplate.subject) customerSubject = renderTemplate(customerTemplate.subject, { orderCode });
      } else {
        customerHtml = generateCustomerEmail(emailData, BANK_DETAILS);
      }

      await resend.emails.send({
        from: FROM_EMAIL,
        to: [INFO_EMAIL, ADMIN_EMAIL],
        subject: adminSubject,
        html: adminHtml,
      });

      await resend.emails.send({
        from: FROM_EMAIL,
        to: customerEmail,
        subject: customerSubject,
        html: customerHtml,
      });

      console.log(`[bonucakes] Order ${orderCode} emails sent to admin (${INFO_EMAIL}) and customer (${customerEmail})`);
    } catch (emailError) {
      console.error('[bonucakes] Failed to send order emails:', emailError);
      // Don't fail the order if emails fail
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

    console.log(`[bonucakes] Order ${orderNumber} (code: ${orderCode}) processed successfully`);

    return NextResponse.json({
      success: true,
      orderId: order.id, // Return database ID for payment processing
      orderNumber, // Return order number for display
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
