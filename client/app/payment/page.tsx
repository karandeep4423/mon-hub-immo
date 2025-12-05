'use client';

import { useState, useEffect } from 'react';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

const stripeKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
console.log('[Payment] Stripe Key présent:', !!stripeKey);
const stripePromise = loadStripe(stripeKey!);

const PaymentForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [scaRequired, setScaRequired] = useState(false);
  const [showBanner, setShowBanner] = useState(true);

  useEffect(() => {
    console.log('[Payment] Stripe chargé:', !!stripe);
    console.log('[Payment] Elements chargé:', !!elements);
  }, [stripe, elements]);

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

    const backendUrl = (() => {
      const raw = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      return raw.replace(/\/+$/, '').replace(/\/api$/i, '') + '/api';
    })();
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

    // Check if SCA (3D Secure) is required
    // helper to refresh profile and redirect to listings after successful payment
    const syncProfileAndRedirect = async () => {
      try {
        await fetch(`${backendUrl}/auth/profile`, { credentials: 'include' });
      } catch {
        // ignore
      }
      // redirect user to listings page (view-only permitted for paid users)
      if (typeof window !== 'undefined') {
        window.location.replace('/search-ads');
      }
    };

    if (data.requiresAction && data.clientSecret) {
      setScaRequired(true);
      const confirm = await stripe.confirmCardPayment(data.clientSecret);
      if (confirm.error) {
        setError(confirm.error.message || 'Erreur lors de la vérification 3D Secure');
        setScaRequired(false);
      } else if (confirm.paymentIntent?.status === 'succeeded') {
        setSuccess(true);
        await syncProfileAndRedirect();
      } else {
        setError('Paiement échoué. Veuillez réessayer.');
        setScaRequired(false);
      }
    } else if (data.clientSecret) {
      // Normal payment confirmation
      const confirm = await stripe.confirmCardPayment(data.clientSecret);
      if (confirm.error) {
        setError(confirm.error.message || 'Erreur confirmation');
      } else {
        setSuccess(true);
        await syncProfileAndRedirect();
      }
    } else {
      // No client secret means subscription is already active
      setSuccess(true);
      await syncProfileAndRedirect();
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
    <div className="min-h-screen w-full bg-gray-100 flex items-center justify-center py-4 px-2 sm:px-4">
      <div className="w-full max-w-7xl bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Info banner */}
        {showBanner && (
          <div className="p-3 sm:p-4 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800 flex flex-col sm:flex-row items-start justify-between gap-2">
            <div className="text-xs sm:text-sm flex-1">
              <strong>Information :</strong> Vous pouvez consulter les annonces pendant la finalisation du paiement. Cependant, la création d&apos;annonces, la collaboration et d&apos;autres actions payantes resteront bloquées tant que l&apos;abonnement n&apos;est pas activé.
              <div className="mt-2 text-[10px] sm:text-xs text-gray-700">Si vous venez de payer, attendez quelques secondes : l&apos;accès sera synchronisé automatiquement.</div>
            </div>
            <button 
              aria-label="Fermer" 
              onClick={() => setShowBanner(false)} 
              className="text-yellow-800 hover:text-yellow-900 font-bold text-lg shrink-0"
            >
              ✕
            </button>
          </div>
        )}

        <div className="flex flex-col lg:flex-row">
          {/* Left Side - Benefits */}
          <div className="lg:w-1/2 w-full bg-cyan-600 text-white p-6 sm:p-8 lg:p-10">
            <h1 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">Boostez votre activité immobilière</h1>
            <p className="mb-3 sm:mb-4 text-base sm:text-lg font-semibold">
              <span className="text-3xl sm:text-4xl">19,99 €</span> / mois
            </p>
            <p className="mb-4 sm:mb-6 text-sm sm:text-base">
              Votre prochain client pourrait vous trouver dès demain. Avec <strong>MonHubImmo Premium</strong>, publiez vos annonces sans limite, automatisez vos relances et accédez à des outils puissants pour booster vos ventes et votre visibilité.
            </p>
            <p className="mb-3 sm:mb-4 text-sm sm:text-base">
              Profitez d&apos;une plateforme qui vous fait gagner du temps, attire les bons clients et transforme chaque mandat en opportunité.
            </p>
            <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm mb-4 sm:mb-6">
              <li>✅ Publiez un nombre illimité d&apos;annonces</li>
              <li>✅ Partagez vos mandats en un clic</li>
              <li>✅ Recevez des leads qualifiés</li>
              <li>✅ Gérez vos prospects efficacement</li>
              <li>✅ Suivi de performance et statistiques avancées</li>
              <li>✅ Notifications et rappels automatisés</li>
              <li>✅ Support client prioritaire</li>
            </ul>
            <p className="text-sm sm:text-lg font-semibold italic">
              💡 Faites de chaque annonce une chance de conclure et révélez tout votre potentiel.
            </p>
          </div>

          {/* Right Side - Form */}
          <div className="lg:w-1/2 w-full p-6 sm:p-8 lg:p-10 flex items-center justify-center">
            <div className="w-full max-w-md">
              <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">Informations de paiement</h2>
              
              {!stripe && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs sm:text-sm text-blue-800">
                  🔄 Chargement du module de paiement sécurisé...
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full border border-gray-300 rounded-lg p-2 sm:p-2.5 text-sm sm:text-base focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    placeholder="votre@email.com"
                  />
                </div>
                
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Nom complet</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full border border-gray-300 rounded-lg p-2 sm:p-2.5 text-sm sm:text-base focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    placeholder="Jean Dupont"
                  />
                </div>
                
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Numéro de carte</label>
                  <div className="border border-gray-300 rounded-lg p-3 sm:p-3.5 bg-white focus-within:ring-2 focus-within:ring-cyan-500 focus-within:border-transparent">
                    <CardElement 
                      options={{ 
                        hidePostalCode: true,
                        style: {
                          base: {
                            fontSize: '16px',
                            color: '#1f2937',
                            '::placeholder': {
                              color: '#9ca3af',
                            },
                          },
                          invalid: {
                            color: '#ef4444',
                          },
                        },
                      }} 
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Pays</label>
                  <select
                    className="w-full border border-gray-300 rounded-lg p-2 sm:p-2.5 text-sm sm:text-base focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    defaultValue="France"
                  >
                    <option>France</option>
                  </select>
                </div>

                {/* Checkbox conditions */}
                <div className="flex items-start space-x-2 pt-1">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={acceptTerms}
                    onChange={(e) => setAcceptTerms(e.target.checked)}
                    className="h-4 w-4 mt-0.5 text-cyan-600 border-gray-300 rounded focus:ring-cyan-500 shrink-0"
                  />
                  <label htmlFor="terms" className="text-xs sm:text-sm text-gray-700">
                    J&apos;accepte les{' '}
                    <a href="/conditions-generales" className="text-cyan-600 hover:underline">
                      conditions générales
                    </a>.
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={!stripe || loading}
                  className="w-full py-2.5 sm:py-3 bg-cyan-600 text-white font-semibold rounded-lg hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base transition-colors"
                >
                  {loading ? 'Traitement...' : 'Souscrire pour 19,99 €'}
                </button>
                
                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-600 text-xs sm:text-sm">{error}</p>
                  </div>
                )}
                
                {scaRequired && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-blue-600 text-xs sm:text-sm">🔒 Vérification de sécurité 3D Secure en cours...</p>
                  </div>
                )}
              </form>
              
              <p className="text-center text-[10px] sm:text-xs text-gray-400 mt-3 sm:mt-4">🔒 Sécurisé par Stripe</p>
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
