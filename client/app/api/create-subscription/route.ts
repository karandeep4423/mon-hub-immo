import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log('create-subscription body:', body);

    const { priceId, paymentMethodId, customerId, email } = body;

    // Vérifie priceId
    const finalPriceId = priceId || process.env.NEXT_PUBLIC_STRIPE_PRICE_ID;
    if (!finalPriceId) {
      return NextResponse.json({ error: 'Missing priceId' }, { status: 400 });
    }

    let customer;
    if (customerId) {
      customer = await stripe.customers.retrieve(customerId);
    } else {
      customer = await stripe.customers.create({
        email,
        payment_method: paymentMethodId,
        invoice_settings: { default_payment_method: paymentMethodId },
      });
    }

    const subscription = await stripe.subscriptions.create({
      customer: (customer as any).id,
      items: [{ price: finalPriceId }],
      default_payment_method: paymentMethodId,
      expand: ['latest_invoice.payment_intent'],
    });

    const invoice = subscription.latest_invoice as Stripe.Invoice;
    const paymentIntent = invoice.payment_intent as Stripe.PaymentIntent | null;

    return NextResponse.json({
      subscriptionId: subscription.id,
      clientSecret: paymentIntent?.client_secret ?? null,
      customerId: (customer as any).id,
    });
  } catch (error: any) {
    console.error('Error create-subscription:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
