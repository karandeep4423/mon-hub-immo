import { Request, Response } from 'express';
import Stripe from 'stripe';
import { User } from '../models/User';
import { logger } from '../utils/logger';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2025-11-17.clover',
});

// Export a handler to be mounted with express.raw in server.ts
export const stripeWebhookHandler = async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'] as string | undefined;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    logger.error('[StripeWebhook] No webhook secret configured');
    return res.status(500).send('Webhook secret not configured');
  }

  let event: Stripe.Event;
  try {
    // req.body is a raw Buffer because this handler must be mounted with express.raw
    const buf = req.body as Buffer;
    event = stripe.webhooks.constructEvent(buf, sig || '', webhookSecret);
  } catch (err: any) {
    logger.error('[StripeWebhook] Signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = typeof invoice.customer === 'string' ? invoice.customer : invoice.customer?.id;
        if (customerId) {
          const user = await User.findOne({ stripeCustomerId: customerId });
          if (user) {
            user.isPaid = true;
            user.subscriptionStatus = 'active';
            await user.save();
            logger.info(`[StripeWebhook] Marked user ${user.email} as paid`);
          }
        }
        break;
      }
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = typeof invoice.customer === 'string' ? invoice.customer : invoice.customer?.id;
        if (customerId) {
          const user = await User.findOne({ stripeCustomerId: customerId });
          if (user) {
            user.isPaid = false;
            user.subscriptionStatus = 'past_due';
            await user.save();
            logger.info(`[StripeWebhook] Marked user ${user.email} as past_due`);
          }
        }
        break;
      }
      case 'customer.subscription.deleted':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = typeof subscription.customer === 'string' ? subscription.customer : subscription.customer?.id;
        if (customerId) {
          const user = await User.findOne({ stripeCustomerId: customerId });
          if (user) {
            user.subscriptionStatus = subscription.status;
            user.isPaid = subscription.status === 'active';
            await user.save();
            logger.info(`[StripeWebhook] Updated subscription status for ${user.email} -> ${subscription.status}`);
          }
        }
        break;
      }
      default:
        // Log and ignore other events
        logger.info(`[StripeWebhook] Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (err) {
    logger.error('[StripeWebhook] Handler error', err);
    res.status(500).send('Server error');
  }
};

export default stripeWebhookHandler;
