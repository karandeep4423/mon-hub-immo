import { NextResponse } from 'next/server';

// This client-side webhook endpoint is deprecated.
// Webhooks must be received and verified on the Express server only.
// Use POST /api/webhook/stripe on the server.

export async function POST() {
  return NextResponse.json(
    { error: 'Webhook moved to server. Use POST /api/webhook/stripe on the Express API.' },
    { status: 410 }
  );
}
