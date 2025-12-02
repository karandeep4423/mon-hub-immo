import { NextResponse } from 'next/server';

// This client-side Next.js API route has been deprecated.
// Payments and subscriptions must be handled on the server only.
// Please use the Express server endpoint instead: POST /api/payment/create-subscription

export async function POST() {
  return NextResponse.json(
    {
      error: 'This endpoint moved to the server. Use POST /api/payment/create-subscription on the Express API.',
    },
    { status: 410 }
  );
}
