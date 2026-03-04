import { NextResponse } from 'next/server';

// Force dynamic rendering to read env vars at runtime
export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({
    stripePublishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
  });
}
