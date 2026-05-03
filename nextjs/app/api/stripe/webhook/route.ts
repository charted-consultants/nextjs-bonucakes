import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { stripe } from '@/lib/stripe';
import Stripe from 'stripe';
import { Resend } from 'resend';
import {
  generateCustomerEmail,
  generateAdminEmail,
  type OrderEmailData,
  type OrderItem as EmailOrderItem,
  type BankDetails,
} from '@/lib/email-templates/order-emails';
import { getOrderTemplate, renderTemplate } from '@/lib/email-templates/render-template';

// Email configuration
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'Bonu F&B <noreply@chartedconsultants.com>';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'bonucakes6@gmail.com';

// Bank details (not used for Stripe payments, but kept for consistency)
const BANK_DETAILS: BankDetails = {
  bankName: 'Tide (Business Account)',
  accountName: 'Bonu Cakes Ltd',
  sortCode: '04-06-05',
  accountNumber: '18828806',
};

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error('RESEND_API_KEY is not configured');
    return null;
  }
  return new Resend(apiKey);
}

export async function POST(request: NextRequest) {
  try {
    // Get the raw body text for signature verification
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      console.error('Missing Stripe signature header');
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      );
    }

    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      console.error('STRIPE_WEBHOOK_SECRET is not configured');
      return NextResponse.json(
        { error: 'Webhook secret not configured' },
        { status: 500 }
      );
    }

    // Verify webhook signature
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json(
        { error: 'Webhook signature verification failed' },
        { status: 400 }
      );
    }

    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log('Payment succeeded:', paymentIntent.id);

        // Find Order by stripePaymentIntentId first, then fallback to metadata orderId
        let order = await prisma.order.findFirst({
          where: { stripePaymentIntentId: paymentIntent.id },
          include: {
            items: true,
          },
        });

        // If not found by payment intent ID, try finding by orderId in metadata
        if (!order && paymentIntent.metadata.orderId) {
          order = await prisma.order.findFirst({
            where: { id: paymentIntent.metadata.orderId },
            include: {
              items: true,
            },
          });
          console.log('Order found via metadata:', order?.id);
        }

        if (order) {
          // Update status to "confirmed" and paymentStatus to "paid"
          await prisma.order.update({
            where: { id: order.id },
            data: {
              status: 'confirmed',
              paymentStatus: 'paid',
              paymentMethod: 'stripe', // Set payment method when payment succeeds
              paidAt: new Date(),
              updatedAt: new Date(),
            },
          });

          // Create order history entry
          await prisma.orderHistory.create({
            data: {
              orderId: order.id,
              status: 'confirmed',
              note: 'Payment successful via Stripe',
            },
          });

          console.log(`Order ${order.id} confirmed after payment`);

          // Send confirmation emails now that payment is confirmed
          try {
            const resend = getResendClient();
            if (resend) {
              // Prepare email data
              const emailData: OrderEmailData = {
                orderCode: order.orderNumber,
                orderId: order.id,
                customerName: order.customerName,
                customerEmail: order.customerEmail,
                customerPhone: order.customerPhone || '',
                deliveryAddress: typeof order.shippingAddress === 'string' ? order.shippingAddress : JSON.stringify(order.shippingAddress || ''),
                paymentMethod: 'stripe',
                items: order.items.map(item => ({
                  productId: item.productId || 0,
                  productName: item.productName,
                  quantity: item.quantity,
                  unitPrice: Number(item.price),
                  unit: '',
                })),
                pricing: {
                  currency: order.currency,
                  subtotal: Number(order.subtotal),
                  shippingFee: Number(order.shippingCost),
                  total: Number(order.total),
                  shippingLabel: order.shippingMethod || 'UK Mainland',
                },
              };

              const submissionDate = new Date().toLocaleDateString('vi-VN', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              });

              const fmt = (n: number) => emailData.pricing.currency === 'GBP' ? `£${n.toFixed(2)}` : `${n.toLocaleString('vi-VN')}đ`;

              const orderItemsHtml = emailData.items.map(item => {
                const uPrice = Number(item.unitPrice) || 0;
                const lineTotal = uPrice * item.quantity;
                const priceStr = fmt(uPrice);
                const lineTotalStr = fmt(lineTotal);
                return `<div style="background:#f8faf9;padding:12px;border:2px solid #fcc56c;border-radius:4px;margin:16px 0;">
                  <p style="margin:0 0 6px 0;font-size:1.1em;"><strong>${item.quantity}x ${item.productName}</strong></p>
                  ${uPrice > 0 ? `<p style="margin:0;color:#4a5c52;">${priceStr} × ${item.quantity} = <strong>${lineTotalStr}</strong></p>` : ''}
                </div>`;
              }).join('');

              const stripePaymentHtml = `<div style="background:#E8F5E9;padding:15px;border-left:4px solid #4CAF50;margin:20px 0;border-radius:4px;">
                <p style="margin:0 0 5px 0;color:#2E7D32;font-weight:bold;font-size:1.1em;">THANH TOAN THANH CONG</p>
                <p style="margin:0;color:#4a5c52;">Thanh toan cua ban da duoc xu ly thanh cong. Don hang cua ban da duoc xac nhan va se som duoc chuan bi.</p>
              </div>`;

              const commonVars = {
                orderCode: order.orderNumber,
                customerName: order.customerName,
                orderItemsHtml,
                subtotal: fmt(emailData.pricing.subtotal),
                shippingFee: fmt(emailData.pricing.shippingFee),
                shippingLabel: emailData.pricing.shippingLabel,
                total: fmt(emailData.pricing.total),
                deliveryDate: '',
              };

              // --- Admin email ---
              const adminTemplate = await getOrderTemplate('order-admin');
              let adminHtml: string;
              let adminSubject = `[Đơn hàng mới #${order.orderNumber}] ${order.items.length > 1 ? `${order.items.length} sản phẩm` : order.items[0]?.productName || 'Order'}`;
              if (adminTemplate) {
                adminHtml = renderTemplate(adminTemplate.html, {
                  ...commonVars,
                  customerEmail: order.customerEmail,
                  customerPhone: order.customerPhone || '',
                  deliveryAddress: typeof order.shippingAddress === 'string' ? order.shippingAddress : JSON.stringify(order.shippingAddress || ''),
                  submissionDate,
                  specialNotes: '',
                  paymentSectionHtml: '',
                });
                if (adminTemplate.subject) adminSubject = renderTemplate(adminTemplate.subject, { orderCode: order.orderNumber, customerName: order.customerName });
              } else {
                adminHtml = generateAdminEmail(emailData, submissionDate);
              }

              // --- Customer email ---
              const customerTemplate = await getOrderTemplate('order-customer');
              let customerHtml: string;
              let customerSubject = `Xác nhận đơn hàng #${order.orderNumber} - Bonu Cakes`;
              if (customerTemplate) {
                customerHtml = renderTemplate(customerTemplate.html, {
                  ...commonVars,
                  emailTitle: 'Xác nhận đơn hàng',
                  emailIntro: 'Cảm ơn bạn đã đặt hàng tại Bonu Cakes! Đơn hàng của bạn đã được xác nhận.',
                  paymentSectionHtml: stripePaymentHtml,
                  customerEmail: '',
                  customerPhone: '',
                  deliveryAddress: '',
                  submissionDate: '',
                  specialNotes: '',
                });
                if (customerTemplate.subject) customerSubject = renderTemplate(customerTemplate.subject, { orderCode: order.orderNumber });
              } else {
                customerHtml = generateCustomerEmail(emailData);
              }

              await resend.emails.send({
                from: FROM_EMAIL,
                to: [ADMIN_EMAIL],
                replyTo: order.customerEmail,
                subject: adminSubject,
                html: adminHtml,
              });

              console.log(`[Webhook] Admin notification sent for order ${order.orderNumber}`);

              await resend.emails.send({
                from: FROM_EMAIL,
                to: [order.customerEmail, ADMIN_EMAIL],
                subject: customerSubject,
                html: customerHtml,
              });

              console.log(`[Webhook] Customer confirmation sent for order ${order.orderNumber}`);
            }
          } catch (emailError) {
            console.error('[Webhook] Error sending emails:', emailError);
            // Don't fail the webhook if email fails
          }
        } else {
          console.warn(
            `No Order found for PaymentIntent ${paymentIntent.id}`
          );
        }
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log('Payment failed:', paymentIntent.id);

        // Find Order by stripePaymentIntentId
        const order = await prisma.order.findFirst({
          where: { stripePaymentIntentId: paymentIntent.id },
        });

        if (order) {
          // Update paymentStatus to "failed"
          await prisma.order.update({
            where: { id: order.id },
            data: {
              paymentStatus: 'failed',
              updatedAt: new Date(),
            },
          });

          // Create order history entry
          await prisma.orderHistory.create({
            data: {
              orderId: order.id,
              status: 'pending',
              note: 'Payment failed via Stripe',
            },
          });

          console.log(`Order ${order.id} marked as payment_failed`);
        } else {
          console.warn(
            `No Order found for PaymentIntent ${paymentIntent.id}`
          );
        }
        break;
      }

      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge;
        console.log('Charge refunded:', charge.id);

        // Find Order by stripePaymentIntentId
        const order = await prisma.order.findFirst({
          where: { stripePaymentIntentId: charge.payment_intent as string },
        });

        if (order) {
          // Update paymentStatus to "refunded"
          await prisma.order.update({
            where: { id: order.id },
            data: {
              paymentStatus: 'refunded',
              updatedAt: new Date(),
            },
          });

          // Create order history entry
          await prisma.orderHistory.create({
            data: {
              orderId: order.id,
              status: order.status,
              note: `Payment refunded via Stripe. Refund ID: ${charge.refunds?.data[0]?.id || 'N/A'}`,
            },
          });

          console.log(`Order ${order.id} marked as refunded`);
        } else {
          console.warn(
            `No Order found for charge payment_intent ${charge.payment_intent}`
          );
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    // Return 200 OK to acknowledge receipt of the event
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}
