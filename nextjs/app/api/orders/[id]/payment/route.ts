import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { stripe } from '@/lib/stripe';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Fetch the Order to get total amount
    const order = await prisma.order.findUnique({
      where: { id },
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Check if order already has a payment intent
    if (order.stripePaymentIntentId) {
      // Retrieve existing payment intent to return its client secret
      const existingIntent = await stripe.paymentIntents.retrieve(
        order.stripePaymentIntentId
      );
      return NextResponse.json({
        clientSecret: existingIntent.client_secret,
        total: Number(order.total),
      });
    }

    // Convert total amount to pence (smallest currency unit)
    const amountInPence = Math.round(Number(order.total) * 100);

    // Create a Stripe PaymentIntent for the full order amount
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInPence,
      currency: order.currency.toLowerCase(),
      metadata: {
        orderId: id,
        orderNumber: order.orderNumber,
        customerName: order.customerName,
        customerEmail: order.customerEmail,
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    // Update the Order with stripePaymentIntentId
    await prisma.order.update({
      where: { id },
      data: {
        stripePaymentIntentId: paymentIntent.id,
        paymentMethod: 'stripe',
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      total: Number(order.total),
    });
  } catch (error) {
    console.error('Failed to create payment intent:', error);
    return NextResponse.json(
      { error: 'Failed to create payment intent' },
      { status: 500 }
    );
  }
}
