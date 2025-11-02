import { Router, Request, Response } from 'express';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2025-10-29.clover',
});

const router = Router();

router.post('/create-subscription', async (req: Request, res: Response) => {
  try {
    const { priceId, paymentMethodId, customerId, email } = req.body;

    let customer: Stripe.Customer;

    // Étape 1 : récupérer ou créer un client
    if (customerId) {
      const retrieved = await stripe.customers.retrieve(customerId);
      if (retrieved.deleted) {
        customer = await stripe.customers.create({
          payment_method: paymentMethodId,
          email,
          invoice_settings: { default_payment_method: paymentMethodId },
        });
      } else {
        customer = retrieved as Stripe.Customer;
      }
    } else {
      customer = await stripe.customers.create({
        payment_method: paymentMethodId,
        email,
        invoice_settings: { default_payment_method: paymentMethodId },
      });
    }

    // Étape 2 : créer l’abonnement
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: priceId }],
      default_payment_method: paymentMethodId,
      expand: ['latest_invoice.payment_intent'],
    });

    // Étape 3 : extraire latest_invoice et payment_intent
    const latestInvoice = subscription.latest_invoice as Stripe.Invoice | null;

    let clientSecret: string | null = null;

    if (
      latestInvoice &&
      typeof latestInvoice === 'object' &&
      'payment_intent' in latestInvoice &&
      latestInvoice.payment_intent &&
      typeof latestInvoice.payment_intent !== 'string'
    ) {
      const pi = latestInvoice.payment_intent as Stripe.PaymentIntent;
      clientSecret = pi.client_secret ?? null;
    }

    // Étape 4 : réponse JSON
    res.json({
      subscriptionId: subscription.id,
      clientSecret,
      customerId: customer.id,
    });
  } catch (error: any) {
    console.error('Error create-subscription:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
