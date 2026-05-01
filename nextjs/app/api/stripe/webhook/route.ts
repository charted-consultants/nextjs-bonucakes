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

              // Send admin notification
              await resend.emails.send({
                from: FROM_EMAIL,
                to: [ADMIN_EMAIL],
                replyTo: order.customerEmail,
                subject: `[Đơn hàng mới #${order.orderNumber}] ${order.items.length > 1 ? `${order.items.length} sản phẩm` : order.items[0]?.productName || 'Order'}`,
                html: generateAdminEmail(emailData, submissionDate),
              });

              console.log(`[Webhook] Admin notification sent for order ${order.orderNumber}`);

              // Send customer confirmation
              await resend.emails.send({
                from: FROM_EMAIL,
                to: [order.customerEmail, ADMIN_EMAIL],
                subject: `Xác nhận đơn hàng #${order.orderNumber} - Bonu Cakes`,
                html: generateCustomerEmail(emailData),
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
