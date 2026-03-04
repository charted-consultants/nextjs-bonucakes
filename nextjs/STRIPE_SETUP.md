# Stripe Payment Integration Setup Guide

This guide will help you set up Stripe payment integration for the Bonucakes e-commerce platform.

## Overview

The payment system now supports two payment methods:
1. **Bank Transfer** (existing) - Orders are confirmed manually after bank transfer
2. **Stripe** (new) - Online card payments processed through Stripe

## Prerequisites

- A Stripe account ([Sign up here](https://dashboard.stripe.com/register))
- Access to your `.env` or `.env.local` file

## Environment Variables

Add the following environment variables to your `.env.local` file:

```env
# Stripe API Keys
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Getting Your Stripe Keys

1. **API Keys** (Secret and Publishable):
   - Go to [Stripe Dashboard](https://dashboard.stripe.com/test/apikeys)
   - Copy the **Publishable key** → Add to `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - Reveal and copy the **Secret key** → Add to `STRIPE_SECRET_KEY`

2. **Webhook Secret**:
   - Go to [Stripe Webhooks](https://dashboard.stripe.com/test/webhooks)
   - Click "Add endpoint"
   - Set the endpoint URL to: `https://your-domain.com/api/stripe/webhook`
   - Select events to listen for:
     - `payment_intent.succeeded`
     - `payment_intent.payment_failed`
   - Click "Add endpoint"
   - Copy the **Signing secret** → Add to `STRIPE_WEBHOOK_SECRET`

## Database Migration

Run the following command to add the Stripe payment fields to your database:

```bash
npx prisma migrate dev --name add_stripe_payment_integration
```

This will add the `stripePaymentIntentId` field to the Order model.

## Testing the Integration

### 1. Test Mode

By default, you'll be using Stripe's test mode. Use these test card numbers:

- **Successful payment**: 4242 4242 4242 4242
- **Declined payment**: 4000 0000 0000 0002
- **Requires authentication**: 4000 0025 0000 3155

Use any future expiration date, any 3-digit CVC, and any postal code.

### 2. Test the Checkout Flow

1. Add products to cart
2. Go to checkout
3. Fill in customer information
4. Select "Card Payment (Stripe)" as payment method
5. Click "Place Order"
6. You'll be redirected to the payment page
7. Enter test card details
8. Complete payment
9. Order status will be automatically updated to "confirmed" when payment succeeds

### 3. Test Webhook Locally

For local development, use the Stripe CLI to forward webhooks:

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login to Stripe
stripe login

# Forward webhooks to your local server
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

This will give you a webhook secret starting with `whsec_` - use this for local testing.

## Production Setup

### 1. Switch to Live Mode

1. Go to Stripe Dashboard
2. Toggle from "Test mode" to "Live mode" (top right)
3. Get your **live** API keys from [API Keys page](https://dashboard.stripe.com/apikeys)
4. Update your production environment variables with live keys

### 2. Set Up Production Webhook

1. Create a new webhook endpoint in live mode
2. Use your production URL: `https://your-production-domain.com/api/stripe/webhook`
3. Update `STRIPE_WEBHOOK_SECRET` with the live webhook secret

### 3. Security Checklist

- ✅ Never commit `.env` files to version control
- ✅ Use environment variables in production (Vercel, Railway, etc.)
- ✅ Keep your secret key secure
- ✅ Enable webhook signature verification (already implemented)
- ✅ Use HTTPS in production

## Payment Flow

### Customer Journey

1. **Checkout**: Customer fills in information and selects payment method
2. **Order Creation**: Order is created with status "pending"
3. **Payment** (Stripe only):
   - Customer is redirected to payment page
   - Stripe PaymentIntent is created
   - Customer enters card details
   - Payment is processed
4. **Confirmation**:
   - Webhook receives payment success event
   - Order status is updated to "confirmed"
   - Payment status is updated to "paid"
   - Order history is recorded
   - Customer is redirected to success page

### Bank Transfer Flow

1. Order is created with status "pending"
2. Customer receives email with bank details
3. Admin manually confirms payment and updates order status

## API Endpoints

### Created Endpoints

- `GET /api/config` - Returns Stripe publishable key
- `POST /api/orders/[id]/payment` - Creates Stripe PaymentIntent for an order
- `POST /api/stripe/webhook` - Handles Stripe webhook events

## Database Schema Changes

```prisma
model Order {
  // ... existing fields
  paymentMethod         String?  @map("payment_method") // cod, bank_transfer, stripe, momo, vnpay
  stripePaymentIntentId String?  @unique @map("stripe_payment_intent_id")
  // ... rest of fields
}
```

## Troubleshooting

### Payment not confirming

1. Check webhook is properly configured
2. Verify `STRIPE_WEBHOOK_SECRET` is correct
3. Check webhook logs in Stripe Dashboard
4. Verify webhook endpoint is accessible from internet

### "Stripe publishable key not configured" error

1. Ensure `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` is set
2. Restart your development server after adding env vars
3. Check the key starts with `pk_test_` (test) or `pk_live_` (production)

### Payment fails immediately

1. Verify `STRIPE_SECRET_KEY` is correct
2. Check Stripe Dashboard for error logs
3. Ensure you're using test mode keys in development

## Support

- [Stripe Documentation](https://stripe.com/docs)
- [Stripe Support](https://support.stripe.com/)
- For integration issues, contact your development team

## Next Steps

1. Add email notifications for successful payments (optional)
2. Implement refund functionality (future enhancement)
3. Add support for multiple currencies (future enhancement)
4. Set up Stripe Radar for fraud prevention (recommended for production)
