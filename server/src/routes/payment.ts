import { Router, Request, Response } from 'express';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2025-09-30.clover',
});

const router = Router();

router.post('/create-subscription', async (req: Request, res: Response) => {
  try {
    const { priceId, paymentMethodId, customerId, email } = req.body;

    let customer: Stripe.Customer;

    if (customerId) {
      customer = (await stripe.customers.retrieve(customerId)) as Stripe.Customer;
    } else {
      customer = await stripe.customers.create({
        payment_method: paymentMethodId,
        email,
        invoice_settings: { default_payment_method: paymentMethodId },
      });
    }

    // Créer l’abonnement avec expansion pour récupérer latest_invoice.payment_intent
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: priceId }],
      default_payment_method: paymentMethodId,
      expand: ['latest_invoice.payment_intent'],
    });

    // latest_invoice peut être string ou Invoice
    const latestInvoice = subscription.latest_invoice as Stripe.Invoice;

    // payment_intent peut être string | PaymentIntent | null
    const paymentIntent = latestInvoice.payment_intent as Stripe.PaymentIntent;

    res.json({
      subscriptionId: subscription.id,
      clientSecret: paymentIntent.client_secret,
      customerId: customer.id,
    });
  } catch (error: any) {
    console.error('Error create-subscription:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
