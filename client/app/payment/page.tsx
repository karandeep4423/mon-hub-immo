'use client';

import { useState } from 'react';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

const PaymentForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!acceptTerms) {
      setError('Vous devez accepter les conditions pour continuer.');
      return;
    }

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

    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
    const response = await fetch(`${backendUrl}/payment/create-subscription`, {
      method: 'POST',
      credentials: 'include',
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
      <div className="h-screen w-screen flex items-center justify-center bg-cyan-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-green-600">✅ Abonnement réussi !</h2>
          <p className="text-gray-700 mt-2">Merci de votre confiance ❤️</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-gray-100 flex items-center justify-center">
      <div className="w-full h-full bg-white rounded-none overflow-auto">
        <div className="flex flex-col lg:flex-row w-full h-full">
          {/* Left Side */}
          <div className="lg:w-1/2 w-full h-1/3 lg:h-full bg-cyan-600 text-white p-10 flex flex-col justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-4">Boostez votre activité immobilière</h1>
              <p className="mb-4 text-lg font-semibold">
                <span className="text-4xl">19,99 €</span> / mois
              </p>
              <p className="mb-6 max-w-lg">
                Votre prochain client pourrait vous trouver dès demain. Avec <strong>MonHubImmo Premium</strong>, publiez vos annonces sans limite, automatisez vos relances et accédez à des outils puissants pour booster vos ventes et votre visibilité.
              </p>
              <p className="mb-4 max-w-lg">
                Profitez d’une plateforme qui vous fait gagner du temps, attire les bons clients et transforme chaque mandat en opportunité.
              </p>
              <ul className="space-y-2 text-sm list-disc list-inside mb-6">
                <li>✅ Publiez un nombre illimité d’annonces</li>
                <li>✅ Partagez vos mandats en un clic</li>
                <li>✅ Recevez des leads qualifiés</li>
                <li>✅ Gérez vos prospects efficacement</li>
                <li>✅ Suivi de performance et statistiques avancées</li>
                <li>✅ Notifications et rappels automatisés</li>
                <li>✅ Support client prioritaire</li>
              </ul>
              <p className="text-lg font-semibold italic">
                💡 Faites de chaque annonce une chance de conclure et révélez tout votre potentiel.
              </p>
            </div>
          </div>

          {/* Right Side - Form */}
          <div className="lg:w-1/2 w-full h-2/3 lg:h-full p-10 flex items-center justify-center">
            <div className="w-full max-w-lg">
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

                {/* Case à cocher pour conditions */}
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={acceptTerms}
                    onChange={(e) => setAcceptTerms(e.target.checked)}
                    className="h-4 w-4 text-cyan-600 border-gray-300 rounded focus:ring-cyan-500"
                  />
                  <label htmlFor="terms" className="text-sm text-gray-700">
                    J’accepte les{' '}
                    <a href="/conditions-generales" className="text-cyan-600 hover:underline">
                      conditions générales
                    </a>.
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={!stripe || loading}
                  className="w-full py-2 bg-cyan-600 text-white font-semibold rounded-lg hover:bg-cyan-700 disabled:opacity-50"
                >
                  {loading ? 'Traitement...' : 'Souscrire pour 19,99 €'}
                </button>
                {error && <p className="text-red-600 text-sm">{error}</p>}
              </form>
              <p className="text-center text-xs text-gray-400 mt-4">Sécurisé par Stripe</p>
            </div>
          </div>
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
