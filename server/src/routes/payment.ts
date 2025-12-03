import { Router, Response } from 'express';
import Stripe from 'stripe';
import { authenticateToken } from '../middleware/auth';
import { AuthRequest } from '../types/auth';
import { User } from '../models/User';
import { logger } from '../utils/logger';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
	apiVersion: '2025-11-17.clover',
});

const router = Router();

router.post(
	'/create-subscription',
	authenticateToken,
	async (req: AuthRequest, res: Response) => {
		try {
			const { priceId, paymentMethodId, customerId, email } = req.body;

			if (!paymentMethodId) {
				return res
					.status(400)
					.json({ error: 'paymentMethodId is required' });
			}

			let customer: Stripe.Customer;

			// Étape 1 : récupérer ou créer un client
			if (customerId) {
				const retrieved = await stripe.customers.retrieve(customerId);
				if (retrieved.deleted) {
					customer = await stripe.customers.create({
						payment_method: paymentMethodId,
						email,
						invoice_settings: {
							default_payment_method: paymentMethodId,
						},
					});
				} else {
					customer = retrieved as Stripe.Customer;
				}
			} else {
				customer = await stripe.customers.create({
					payment_method: paymentMethodId,
					email,
					invoice_settings: {
						default_payment_method: paymentMethodId,
					},
				});
			}

			// Étape 2 : créer l'abonnement
			const subscription = await stripe.subscriptions.create({
				customer: customer.id,
				items: [{ price: priceId }],
				default_payment_method: paymentMethodId,
				expand: ['latest_invoice.payment_intent'],
			});

			// Étape 2.5 : attacher le PaymentMethod au customer s'il ne l'est pas déjà
			try {
				await stripe.paymentMethods.attach(paymentMethodId, {
					customer: customer.id,
				});
			} catch (attachErr: unknown) {
				// If already attached, ignore
				const errMessage =
					attachErr instanceof Error ? attachErr.message : '';
				if (!errMessage.includes('already attached')) {
					logger.error(
						'[Payment] Failed to attach payment method:',
						attachErr,
					);
				}
			}

			// Étape 3 : extraire latest_invoice et payment_intent
			const latestInvoice =
				subscription.latest_invoice as Stripe.Invoice | null;

			let clientSecret: string | null = null;
			let requiresAction = false;

			if (
				latestInvoice &&
				typeof latestInvoice === 'object' &&
				'payment_intent' in latestInvoice &&
				latestInvoice.payment_intent &&
				typeof latestInvoice.payment_intent !== 'string'
			) {
				const pi = latestInvoice.payment_intent as Stripe.PaymentIntent;
				clientSecret = pi.client_secret ?? null;
				requiresAction = pi.status === 'requires_action';
			}

			// Étape 4 : réponse JSON
			// Persist Stripe IDs to user if authenticated
			try {
				if (req.userId) {
					const user = await User.findById(req.userId);
					if (user) {
						user.stripeCustomerId = customer.id;
						user.stripeSubscriptionId = subscription.id;
						user.subscriptionStatus = subscription.status;
						// If subscription is active immediately, mark isPaid
						user.isPaid = subscription.status === 'active';
						await user.save();
					}
				}
			} catch (dbErr) {
				logger.error(
					'[Payment] Failed to persist stripe ids to user:',
					dbErr,
				);
				// don't block the response on DB write failure
			}

			res.json({
				subscriptionId: subscription.id,
				clientSecret,
				customerId: customer.id,
				requiresAction,
			});
		} catch (error: unknown) {
			logger.error('[Payment] Error create-subscription:', error);
			const message =
				error instanceof Error ? error.message : 'Unknown error';
			res.status(500).json({ error: message });
		}
	},
);

export default router;
