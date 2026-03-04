import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { stripe } from '@/lib/stripe';
import Stripe from 'stripe';

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

        // Find Order by stripePaymentIntentId
        const order = await prisma.order.findFirst({
          where: { stripePaymentIntentId: paymentIntent.id },
          include: {
            items: true,
          },
        });

        if (order) {
          // Update status to "confirmed" and paymentStatus to "paid"
          await prisma.order.update({
            where: { id: order.id },
            data: {
              status: 'confirmed',
              paymentStatus: 'paid',
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

          // TODO: Send confirmation email here if needed
          // You can use your existing email sending logic from the order API
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
