'use client';

import { useState } from 'react';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

const PaymentForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const [email, setEmail] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [name, setName] = useState('');
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

    const { error: pmError, paymentMethod } = await stripe.createPaymentMethod({
      type: 'card',
      card: cardElement,
      billing_details: { email, name },
    });

    if (pmError) {
      setError(pmError.message || 'Erreur de paiement');
      setLoading(false);
      return;
    }

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
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-green-600">✅ Abonnement réussi !</h2>
          <p className="text-gray-700 mt-2">Merci de votre confiance ❤️</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="flex w-full max-w-4xl bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Left Side - Description and Pricing */}
        <div className="w-1/2 bg-cyan-600 text-white p-8">
          <h1 className="text-3xl font-bold mb-4">Forfait Premium MonHubImmo</h1>
          <p className="mb-6">Accédez à des outils avancés pour booster votre activité immobilière.</p>
          <div className="mb-6">
            <span className="text-4xl font-bold">19.99 €</span> <span className="text-sm">/ mois</span>
          </div>
          <ul className="space-y-2 text-sm">
            <li>✅ Publiez des annonces illimitées</li>
            <li>✅ Partagez vos mandats en un clic</li>
            <li>✅ Recevez des leads qualifiés</li>
            <li>✅ Gérez vos prospects efficacement</li>
          </ul>
        </div>

        {/* Right Side - Form */}
        <div className="w-1/2 p-8">
          <h2 className="text-2xl font-bold mb-4">Informations de paiement</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full mt-1 border border-gray-300 rounded-lg p-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Nom complet</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full mt-1 border border-gray-300 rounded-lg p-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Numéro de carte</label>
              <div className="border border-gray-300 rounded-lg p-3 bg-white">
                <CardElement options={{ hidePostalCode: true }} />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Pays</label>
              <select
                className="w-full mt-1 border border-gray-300 rounded-lg p-2"
                defaultValue="France"
              >
                <option>France</option>
              </select>
            </div>
            <button
              type="submit"
              disabled={!stripe || loading}
              className="w-full py-2 bg-cyan-600 text-white font-semibold rounded-lg hover:bg-cyan-700"
            >
              {loading ? 'Traitement...' : 'Souscrire pour 19,99 €'}
            </button>
            {error && <p className="text-red-600 text-sm">{error}</p>}
          </form>
          <p className="text-center text-xs text-gray-400 mt-4">Sécurisé par Stripe</p>
        </div>
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