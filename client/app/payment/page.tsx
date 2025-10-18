'use client';

import { useState } from 'react';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

const PaymentForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!stripe || !elements) return;

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) return;

    // Créer PaymentMethod
    const { error: pmError, paymentMethod } = await stripe.createPaymentMethod({
      type: 'card',
      card: cardElement,
      billing_details: { email },
    });

    if (pmError) {
      setError(pmError.message || 'Erreur de paiement');
      setLoading(false);
      return;
    }

    // Appel backend pour créer l’abonnement
    const response = await fetch('/api/create-subscription', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        paymentMethodId: paymentMethod.id,
        priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID,
      }),
    });

    const data = await response.json();
    if (data.error) {
      setError(data.error);
      setLoading(false);
      return;
    }

    // Confirmer le paiement
    const confirm = await stripe.confirmCardPayment(data.clientSecret!);
    if (confirm.error) {
      setError(confirm.error.message || 'Erreur confirmation');
    } else {
      setSuccess(true);
    }

    setLoading(false);
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white px-4">
        <h2 className="text-2xl font-bold text-green-600">✅ Abonnement réussi !</h2>
        <p className="text-gray-700 mt-2 text-center">Merci de votre confiance ❤️</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4">
      <div className="w-full max-w-sm bg-white rounded-xl shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">Passer au forfait <span className="text-cyan-500">Premium</span></h1>
        <p className="text-gray-600 text-center mb-4 text-sm">Publiez des annonces et partagez des mandats avec HubImmo Premium</p>

        <div className="text-center mb-6">
          <span className="text-3xl font-bold">19.99 €</span> <span className="text-gray-600 text-sm">/ mois</span>
        </div>

        <ul className="text-gray-700 mb-6 space-y-1 text-sm">
          <li>✅ Publier des annonces</li>
          <li>✅ Partager vos mandats</li>
          <li>✅ Recevoir des leads</li>
          <li>✅ Partager et recevoir des listes de prospects</li>
        </ul>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Votre email"
            required
            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-cyan-500"
          />

          <div className="border border-gray-300 rounded-lg p-3 bg-white">
            <CardElement options={{ hidePostalCode: true }} />
          </div>

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={!stripe || loading}
            className="w-full py-3 bg-cyan-600 text-white font-semibold rounded-lg hover:bg-cyan-700 transition"
          >
            {loading ? 'Traitement...' : 'Payer 19,99 €'}
          </button>
        </form>

        <p className="text-center text-xs text-gray-400 mt-4">
          Sécurisé par <span className="font-bold">Stripe</span>
        </p>
      </div>
    </div>
  );
};

export default function PaymentPage() {
  return (
    <Elements stripe={stripePromise}>
      <PaymentForm />
    </Elements>
  );
}
