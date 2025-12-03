# Payment System

> Stripe subscription management, billing, and payment processing

---

## 📋 Overview

MonHubImmo uses Stripe for subscription-based payments. Users must have an active subscription to access premium features.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        PAYMENT FLOW                                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   USER                      SERVER                      STRIPE              │
│   ┌──────┐                  ┌──────┐                   ┌──────┐            │
│   │      │                  │      │                   │      │            │
│   │ 1. Select plan ────────►│      │                   │      │            │
│   │      │                  │      │                   │      │            │
│   │      │                  │ 2. Create checkout ─────►│      │            │
│   │      │                  │      │                   │      │            │
│   │      │◄─────────────────│ 3. Return session URL   │      │            │
│   │      │                  │      │                   │      │            │
│   │ 4. Redirect to Stripe ─────────────────────────────►│      │            │
│   │      │                  │      │                   │      │            │
│   │ 5. Enter payment info   │      │                   │      │            │
│   │      │                  │      │                   │      │            │
│   │      │◄────────────────────────────────────────────│ 6. Redirect back │
│   │      │                  │      │                   │      │            │
│   │      │                  │      │◄──────────────────│ 7. Webhook event │
│   │      │                  │      │                   │      │            │
│   │      │                  │ 8. Update user.isPaid   │      │            │
│   │      │                  │      │                   │      │            │
│   └──────┘                  └──────┘                   └──────┘            │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 💳 Subscription Plans

### Available Plans

| Plan        | Price     | Billing | Features                    |
| ----------- | --------- | ------- | --------------------------- |
| **Mensuel** | 29€/month | Monthly | Full access                 |
| **Annuel**  | 290€/year | Yearly  | Full access + 2 months free |

### Plan Features

- Unlimited property listings
- Unlimited collaboration requests
- Real-time chat
- Appointment scheduling
- Analytics dashboard
- Priority support (annual)

---

## 🗄 Data Model

### User Payment Fields

```typescript
interface IUser {
  // ... other fields

  // Subscription Status
  isPaid: boolean; // Has active subscription
  subscriptionStatus?: "active" | "past_due" | "canceled" | "trialing";

  // Stripe Integration
  stripeCustomerId?: string; // Stripe customer ID
  stripeSubscriptionId?: string; // Current subscription ID

  // Subscription Details
  subscriptionPlan?: "monthly" | "annual";
  subscriptionStartDate?: Date;
  subscriptionEndDate?: Date;

  // Trial
  trialEndsAt?: Date;
  hasUsedTrial?: boolean;
}
```

---

## 🔌 API Endpoints

### Checkout

| Method | Endpoint                               | Description               | Auth   |
| ------ | -------------------------------------- | ------------------------- | ------ |
| `POST` | `/api/payment/create-checkout-session` | Create Stripe checkout    | User   |
| `GET`  | `/api/payment/success`                 | Handle successful payment | Public |
| `GET`  | `/api/payment/cancel`                  | Handle cancelled checkout | Public |

### Subscription Management

| Method | Endpoint                             | Description              | Auth |
| ------ | ------------------------------------ | ------------------------ | ---- |
| `GET`  | `/api/payment/subscription`          | Get subscription details | User |
| `POST` | `/api/payment/cancel-subscription`   | Cancel subscription      | User |
| `POST` | `/api/payment/update-payment-method` | Update card              | User |
| `POST` | `/api/payment/create-portal-session` | Stripe billing portal    | User |

### Webhooks

| Method | Endpoint              | Description            | Auth   |
| ------ | --------------------- | ---------------------- | ------ |
| `POST` | `/api/webhook/stripe` | Stripe webhook handler | Stripe |

---

## 📝 Implementation

### Create Checkout Session

```typescript
// controllers/paymentController.ts
export const createCheckoutSession = async (
  req: AuthRequest,
  res: Response
) => {
  const { priceId, plan } = req.body;
  const userId = req.user.userId;

  // Get or create Stripe customer
  const user = await User.findById(userId);
  let stripeCustomerId = user.stripeCustomerId;

  if (!stripeCustomerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: { userId: userId.toString() },
    });
    stripeCustomerId = customer.id;
    await User.findByIdAndUpdate(userId, { stripeCustomerId });
  }

  // Create checkout session
  const session = await stripe.checkout.sessions.create({
    customer: stripeCustomerId,
    payment_method_types: ["card"],
    mode: "subscription",
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: `${process.env.FRONTEND_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.FRONTEND_URL}/payment/cancel`,
    metadata: {
      userId: userId.toString(),
      plan,
    },
    subscription_data: {
      metadata: {
        userId: userId.toString(),
      },
    },
  });

  res.json({ sessionId: session.id, url: session.url });
};
```

### Webhook Handler

```typescript
// controllers/webhookController.ts
export const handleStripeWebhook = async (req: Request, res: Response) => {
  const sig = req.headers["stripe-signature"] as string;
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    logger.error("Webhook signature verification failed:", err);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  switch (event.type) {
    case "checkout.session.completed":
      await handleCheckoutCompleted(event.data.object);
      break;

    case "customer.subscription.created":
    case "customer.subscription.updated":
      await handleSubscriptionUpdate(event.data.object);
      break;

    case "customer.subscription.deleted":
      await handleSubscriptionCancelled(event.data.object);
      break;

    case "invoice.payment_succeeded":
      await handlePaymentSucceeded(event.data.object);
      break;

    case "invoice.payment_failed":
      await handlePaymentFailed(event.data.object);
      break;

    default:
      logger.info(`Unhandled event type: ${event.type}`);
  }

  res.json({ received: true });
};
```

### Subscription Update Handler

```typescript
const handleSubscriptionUpdate = async (subscription: Stripe.Subscription) => {
  const userId = subscription.metadata.userId;

  await User.findByIdAndUpdate(userId, {
    isPaid: subscription.status === "active",
    subscriptionStatus: subscription.status,
    stripeSubscriptionId: subscription.id,
    subscriptionStartDate: new Date(subscription.current_period_start * 1000),
    subscriptionEndDate: new Date(subscription.current_period_end * 1000),
  });

  logger.info(
    `Subscription updated for user ${userId}: ${subscription.status}`
  );
};
```

### Cancel Subscription

```typescript
export const cancelSubscription = async (req: AuthRequest, res: Response) => {
  const user = await User.findById(req.user.userId);

  if (!user.stripeSubscriptionId) {
    return res.status(400).json({ error: "No active subscription" });
  }

  // Cancel at period end (user keeps access until end date)
  await stripe.subscriptions.update(user.stripeSubscriptionId, {
    cancel_at_period_end: true,
  });

  await User.findByIdAndUpdate(user._id, {
    subscriptionStatus: "canceled",
  });

  res.json({
    message: "Subscription will be cancelled at period end",
    endDate: user.subscriptionEndDate,
  });
};
```

---

## 🔐 Subscription Middleware

Protect routes requiring active subscription:

```typescript
// middleware/subscription.ts
export const requireSubscription = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const user = await User.findById(req.user.userId);

  if (!user.isPaid) {
    return res.status(403).json({
      error: "Subscription required",
      code: "SUBSCRIPTION_REQUIRED",
      message:
        "Veuillez souscrire un abonnement pour accéder à cette fonctionnalité",
    });
  }

  // Check if subscription is actually active
  if (user.subscriptionEndDate && user.subscriptionEndDate < new Date()) {
    // Subscription expired, update status
    await User.findByIdAndUpdate(user._id, { isPaid: false });
    return res.status(403).json({
      error: "Subscription expired",
      code: "SUBSCRIPTION_EXPIRED",
    });
  }

  next();
};
```

Usage:

```typescript
// routes/property.ts
router.post(
  "/properties",
  authenticateToken,
  requireSubscription,
  createProperty
);
```

---

## 🖼 Client Implementation

### Pricing Page

```tsx
// app/payment/page.tsx
const PricingPage = () => {
  const { user } = useAuth();
  const router = useRouter();

  const plans = [
    {
      id: "monthly",
      name: "Mensuel",
      price: 29,
      priceId: process.env.NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID,
      features: ["Accès complet", "Annulations flexibles"],
    },
    {
      id: "annual",
      name: "Annuel",
      price: 290,
      priceId: process.env.NEXT_PUBLIC_STRIPE_ANNUAL_PRICE_ID,
      features: ["Accès complet", "2 mois offerts", "Support prioritaire"],
      popular: true,
    },
  ];

  const handleSelectPlan = async (plan: Plan) => {
    if (!user) {
      router.push("/auth/login?redirect=/payment");
      return;
    }

    const response = await api.post("/payment/create-checkout-session", {
      priceId: plan.priceId,
      plan: plan.id,
    });

    // Redirect to Stripe Checkout
    window.location.href = response.data.url;
  };

  return (
    <div className="pricing-page">
      <h1>Choisissez votre abonnement</h1>

      <div className="plans-grid">
        {plans.map((plan) => (
          <PricingCard
            key={plan.id}
            plan={plan}
            onSelect={() => handleSelectPlan(plan)}
            isCurrent={user?.subscriptionPlan === plan.id}
          />
        ))}
      </div>
    </div>
  );
};
```

### Success Page

```tsx
// app/payment/success/page.tsx
const PaymentSuccessPage = () => {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const { refreshUser } = useAuth();

  useEffect(() => {
    if (sessionId) {
      // Verify session and refresh user
      verifyPayment(sessionId);
    }
  }, [sessionId]);

  const verifyPayment = async (sessionId: string) => {
    await api.get(`/payment/success?session_id=${sessionId}`);
    await refreshUser();
  };

  return (
    <div className="success-page">
      <CheckCircleIcon className="success-icon" />
      <h1>Paiement réussi !</h1>
      <p>Votre abonnement est maintenant actif.</p>
      <Link href="/dashboard">Accéder au tableau de bord</Link>
    </div>
  );
};
```

### Subscription Management

```tsx
// components/dashboard/SubscriptionManager.tsx
const SubscriptionManager = () => {
  const { user } = useAuth();

  const { mutate: cancelSub, loading: cancelling } = useMutation(
    () => api.post("/payment/cancel-subscription"),
    {
      successMessage: "Abonnement annulé",
      confirmMessage: "Êtes-vous sûr de vouloir annuler votre abonnement ?",
    }
  );

  const openBillingPortal = async () => {
    const response = await api.post("/payment/create-portal-session");
    window.location.href = response.data.url;
  };

  return (
    <div className="subscription-manager">
      <h2>Mon abonnement</h2>

      <div className="current-plan">
        <Badge>
          {user.subscriptionPlan === "annual" ? "Annuel" : "Mensuel"}
        </Badge>
        <StatusBadge status={user.subscriptionStatus} />
      </div>

      {user.subscriptionEndDate && (
        <p>
          {user.subscriptionStatus === "canceled"
            ? `Accès jusqu'au ${formatDate(user.subscriptionEndDate)}`
            : `Prochain renouvellement: ${formatDate(
                user.subscriptionEndDate
              )}`}
        </p>
      )}

      <div className="actions">
        <Button onClick={openBillingPortal}>Gérer le paiement</Button>

        {user.subscriptionStatus === "active" && (
          <Button variant="danger" onClick={cancelSub} loading={cancelling}>
            Annuler l'abonnement
          </Button>
        )}
      </div>
    </div>
  );
};
```

---

## 🔔 Payment Notifications

### Failed Payment Email

```typescript
const handlePaymentFailed = async (invoice: Stripe.Invoice) => {
  const customerId = invoice.customer as string;
  const user = await User.findOne({ stripeCustomerId: customerId });

  if (!user) return;

  await sendEmail({
    to: user.email,
    subject: "Échec de paiement - Action requise",
    template: "payment-failed",
    data: {
      name: user.firstName,
      amount: (invoice.amount_due / 100).toFixed(2),
      retryDate: format(addDays(new Date(), 3), "dd MMMM yyyy", { locale: fr }),
      updatePaymentUrl: `${process.env.FRONTEND_URL}/payment/update`,
    },
  });

  // Update user status
  await User.findByIdAndUpdate(user._id, {
    subscriptionStatus: "past_due",
  });
};
```

### Subscription Ending Reminder

```typescript
// Cron job: Run daily
const sendExpirationReminders = async () => {
  const in7Days = addDays(new Date(), 7);
  const in8Days = addDays(new Date(), 8);

  const expiringUsers = await User.find({
    subscriptionStatus: "canceled",
    subscriptionEndDate: { $gte: in7Days, $lt: in8Days },
  });

  for (const user of expiringUsers) {
    await sendEmail({
      to: user.email,
      subject: "Votre abonnement expire bientôt",
      template: "subscription-expiring",
      data: {
        name: user.firstName,
        endDate: format(user.subscriptionEndDate, "dd MMMM yyyy", {
          locale: fr,
        }),
        resubscribeUrl: `${process.env.FRONTEND_URL}/payment`,
      },
    });
  }
};
```

---

## 🧪 Testing with Stripe

### Test Cards

| Card Number        | Scenario                           |
| ------------------ | ---------------------------------- |
| `4242424242424242` | Successful payment                 |
| `4000000000000002` | Card declined                      |
| `4000002500000003` | Insufficient funds                 |
| `4000000000009995` | Card declined (insufficient funds) |

### Test Webhook Events

```bash
# Install Stripe CLI
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:4000/api/webhook/stripe

# Trigger test events
stripe trigger checkout.session.completed
stripe trigger customer.subscription.deleted
```

---

## 📊 Revenue Tracking

### Dashboard Stats

```typescript
// admin/revenueController.ts
export const getRevenueStats = async (req: Request, res: Response) => {
  const stats = {
    mrr: await calculateMRR(),
    totalSubscribers: await User.countDocuments({ isPaid: true }),
    churnRate: await calculateChurnRate(),
    planDistribution: await getPlanDistribution(),
  };

  res.json(stats);
};

const calculateMRR = async () => {
  const activeUsers = await User.find({
    isPaid: true,
    subscriptionStatus: "active",
  });

  return activeUsers.reduce((total, user) => {
    if (user.subscriptionPlan === "annual") {
      return total + 290 / 12; // Monthly equivalent
    }
    return total + 29;
  }, 0);
};
```

---

## ⚠️ Error Handling

### Common Payment Errors

```typescript
const PAYMENT_ERRORS = {
  card_declined: "Votre carte a été refusée",
  insufficient_funds: "Fonds insuffisants",
  expired_card: "Carte expirée",
  processing_error: "Erreur de traitement",
  incorrect_cvc: "CVC incorrect",
};

const handlePaymentError = (error: Stripe.StripeError) => {
  const message = PAYMENT_ERRORS[error.code] || "Erreur de paiement";
  return { error: message, code: error.code };
};
```

---

_Next: [Testing Guide →](../testing/overview.md)_
