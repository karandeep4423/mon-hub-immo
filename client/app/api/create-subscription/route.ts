import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

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

    let customer: Stripe.Customer | Stripe.DeletedCustomer | null = null;
    if (customerId) {
      customer = await stripe.customers.retrieve(customerId);
    } else {
      customer = await stripe.customers.create({
        email,
        payment_method: paymentMethodId,
        invoice_settings: { default_payment_method: paymentMethodId },
      });
    }

    if (!customer) {
      return NextResponse.json({ error: 'Failed to create or retrieve customer' }, { status: 500 });
    }

    const subscription = await stripe.subscriptions.create({
      customer: (customer as Stripe.Customer).id,
      items: [{ price: finalPriceId }],
      default_payment_method: paymentMethodId,
      expand: ['latest_invoice.payment_intent'],
    });

    // latest_invoice can be either a string ID or a full Invoice object
    // Treat it as unknown and narrow at runtime to avoid using `any` (Stripe typings vary by version)
    const invoiceLike = (subscription.latest_invoice && typeof subscription.latest_invoice === 'object') ? (subscription.latest_invoice as unknown) : null;
    // payment_intent can be a string ID or a PaymentIntent object; narrow using a Record<string, unknown>
    let paymentIntent: Stripe.PaymentIntent | null = null;
    if (invoiceLike) {
      const asRecord = invoiceLike as Record<string, unknown>;
      const pi = asRecord['payment_intent'];
      if (pi && typeof pi === 'object') {
        paymentIntent = pi as Stripe.PaymentIntent;
      }
    }

    return NextResponse.json({
      subscriptionId: subscription.id,
      clientSecret: paymentIntent?.client_secret ?? null,
      customerId: (customer as Stripe.Customer).id,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('Error create-subscription:', msg);
    return NextResponse.json({ error: msg || 'Internal server error' }, { status: 500 });
  }
}
