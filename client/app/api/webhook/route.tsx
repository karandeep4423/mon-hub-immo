import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  const body = await req.text();
  const signature = (await headers()).get?.('stripe-signature') as string | null;

  if (!signature) {
    console.error('Missing stripe-signature header');
    return NextResponse.json({ error: 'Missing stripe signature' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('⚠️ Erreur de signature Webhook:', msg);
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  switch (event.type) {
    case 'invoice.payment_succeeded':
      console.log('✅ Paiement réussi pour un abonnement !');
      // → Ici tu peux activer l’accès Premium de l’utilisateur
      break;

    case 'customer.subscription.deleted':
      console.log('❌ Abonnement annulé.');
      // → Ici tu peux désactiver l’accès Premium
      break;

    default:
      console.log(`⚙️ Event reçu : ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
