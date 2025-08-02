'use client';

import { useRef } from 'react';

export default function LandingPage() {
  const formRef = useRef<HTMLDivElement>(null);

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <main className="bg-gradient-to-br from-[#0077b6] to-[#00b4d8] min-h-screen text-white font-sans">
      
      {/* PAGE 1 - HERO */}
      <section className="min-h-screen flex flex-col justify-center items-center text-center px-6">
        <p className="text-sm font-medium mb-4">
          Ici, peu importe votre réseau :<br />
          <span className="font-bold">ce qui compte, c’est de conclure plus de ventes, ensemble.</span>
        </p>

        <h1 className="text-3xl md:text-5xl font-semibold mb-2">
          Découvrez <span className="font-bold text-white">monhubimmo</span>
        </h1>

        <p className="uppercase tracking-wider text-sm mb-3">
          La 1ère plateforme collaborative pour les mandataires immobiliers
        </p>

        <p className="mb-6">Partager pour mieux performer</p>

        <button
          onClick={scrollToForm}
          className="bg-white text-[#00b4d8] px-6 py-2 rounded-full font-bold hover:bg-gray-100 transition"
        >
          S’inscrire
        </button>
      </section>

    {/* SECTION BÉNÉFICES - après le HERO */}
    <section className="bg-white py-16 px-6">
        <h2 className="text-3xl font-bold text-center text-[#034752] mb-10">
            Pourquoi rejoindre MonHubimmo ?
        </h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto text-[#034752]">
            
            <div className="bg-[#e0f7fa] p-6 rounded shadow">
            <h3 className="font-bold text-lg mb-2">📦 Partage de biens</h3>
            <p>Partagez votre stock (mandats simples, exclusifs ou off market) avec d'autres mandataires.</p>
            </div>

            <div className="bg-[#e0f7fa] p-6 rounded shadow">
            <h3 className="font-bold text-lg mb-2">📍 Visibilité en temps réel</h3>
            <p>Visualisez les biens disponibles sur votre secteur et ceux de vos confrères en un coup d’œil.</p>
            </div>

            <div className="bg-[#e0f7fa] p-6 rounded shadow">
            <h3 className="font-bold text-lg mb-2">🔍 Trouvez pour vos clients</h3>
            <p>Accédez aux biens des autres mandataires pour satisfaire les besoins de vos clients.</p>
            </div>

            <div className="bg-[#e0f7fa] p-6 rounded shadow">
            <h3 className="font-bold text-lg mb-2">📝 Recherches clients ciblées</h3>
            <p>Déposez des recherches et recevez des propositions adaptées automatiquement.</p>
            </div>

            <div className="bg-[#e0f7fa] p-6 rounded shadow">
            <h3 className="font-bold text-lg mb-2">🤝 Collaboration multi-réseaux</h3>
            <p>Collaborez facilement avec d'autres mandataires, quelle que soit leur enseigne.</p>
            </div>

            <div className="bg-[#e0f7fa] p-6 rounded shadow">
            <h3 className="font-bold text-lg mb-2">💬 Messagerie privée</h3>
            <p>Consultez l’historique de vos échanges et discutez en toute confidentialité.</p>
            </div>

            <div className="bg-[#e0f7fa] p-6 rounded shadow md:col-span-2 lg:col-span-3">
            <h3 className="font-bold text-lg mb-2">📊 Tableau de bord intuitif</h3>
            <p>Gérez vos fiches clients, mandats et recherches simplement depuis un espace unique.</p>
            </div>

        </div>
        </section>

        <section className="bg-white py-16 px-6 text-[#034752]">
        <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-xl md:text-2xl font-bold mb-6">
            <span className="inline-flex items-center gap-2">
                <span></span>
                <span>Vous êtes mandataire chez IAD, SAFTI, BSK, KW, EXP, Efficity ou un autre réseau ?</span>
            </span>
            </h2>

            <p className="mb-4 text-md md:text-lg">
            Vous travaillez dur pour vos clients, mais vous êtes souvent seul face à vos annonces, vos recherches
            acquéreurs ou vos exclusivités à diffuser…
            </p>

            <p className="text-md md:text-lg font-semibold">
             <strong>MonHubImmo</strong> est le <strong>1er réseau de collaboration 100 % entre mandataires immobiliers</strong>,
            toutes enseignes confondues.
            </p>
        </div>
        </section>



      {/* PAGE 2 - FORMULAIRE */}
      <section
        ref={formRef}
        className="bg-[#0077b6] py-16 px-6 flex flex-col items-center text-center"
      >
        <h2 className="text-3xl font-bold mb-2">
          Développez votre réseau et accélérez vos ventes
        </h2>
        <p className="mb-6 text-white max-w-xl">
          Rejoignez la <strong>1ère plateforme collaborative</strong> entre mandataires immobiliers.
        </p>

        <div className="bg-white text-gray-900 w-full max-w-md p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Entrez vos informations :</h3>
          <form className="space-y-4">
            <input type="text" placeholder="Nom" className="w-full p-2 border rounded" required />
            <input type="email" placeholder="Adresse e-mail" className="w-full p-2 border rounded" required />
            <input type="tel" placeholder="Numéro de téléphone" className="w-full p-2 border rounded" />
            <button type="submit" className="bg-[#00b4d8] text-white w-full py-2 rounded font-semibold hover:bg-[#0094b3] transition">
              En savoir plus
            </button>
          </form>
        </div>
      </section>

         {/* SECTION POST-FORMULAIRE */}
        <section className="bg-white py-16 px-6 text-[#034752]">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8 items-center">
            
            {/* Texte principal */}
            <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
                La plateforme qui connecte<br /> les professionnels de l’immobilier
            </h2>
            <p className="mb-6">
                Centralisez vos annonces, collaborez entre agents, trouvez plus vite les bons biens pour vos clients.
            </p>
            <ul className="list-disc pl-5 space-y-2">
                <li> Réseau privé entre agents</li>
                <li> Annonces internes et exclusives</li>
                <li> Apporteurs d’affaires intégrés</li>
            </ul>
            <button className="mt-6 bg-[#00b4d8] text-white px-6 py-2 rounded-full font-semibold hover:bg-[#0094b3] transition">
                Tester gratuitement
            </button>
            </div>

            {/* Image maquette */}
            <div className="flex justify-center">
            <img
                src="/tele.png"
                alt="Aperçu de l’application MonHubimmo"
                className="w-[250px] sm:w-[300px] shadow-lg rounded-xl"
            />
            </div>
        </div>

        {/* Fonctionnalités clés */}
        <section className="bg-white py-16 px-6 text-[#034752]">
            <div className="max-w-6xl mx-auto">
                <h3 className="text-2xl font-bold text-center mb-12">Fonctionnalités clés</h3>

                <div className="grid md:grid-cols-2 gap-10">
                {/* Bloc 1 */}
                <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                    <svg className="w-6 h-6 text-[#00b4d8]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path d="M12 2l7 4v6c0 5.25-3.5 9.74-7 10-3.5-.26-7-4.75-7-10V6l7-4z" />
                    </svg>
                    </div>
                    <div>
                    <h4 className="font-semibold text-lg mb-1">Partage d’annonces privé</h4>
                    <p className="text-sm text-gray-700">Déposez et consultez des biens, entre pros, en toute confidentialité.</p>
                    </div>
                </div>

                {/* Bloc 2 */}
                <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                    <svg className="w-6 h-6 text-[#00b4d8]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path d="M21 12.79A9 9 0 1111.21 3H12a9 9 0 019 9z" />
                    </svg>
                    </div>
                    <div>
                    <h4 className="font-semibold text-lg mb-1">Apporteurs d’affaires intégrés</h4>
                    <p className="text-sm text-gray-700">Offrez une interface simple à vos apporteurs pour qu’ils vous transmettent des opportunités.</p>
                    </div>
                </div>

                {/* Bloc 3 */}
                <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                    <svg className="w-6 h-6 text-[#00b4d8]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path d="M8 17l4-4 4 4m0-5V3" />
                    </svg>
                    </div>
                    <div>
                    <h4 className="font-semibold text-lg mb-1">Collaboration simplifiée</h4>
                    <p className="text-sm text-gray-700">Mettez en relation les bons biens avec les bons clients grâce à un système connecté.</p>
                    </div>
                </div>

                {/* Bloc 4 */}
                <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                    <svg className="w-6 h-6 text-[#00b4d8]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path d="M17 9V7a4 4 0 00-8 0v2M5 10h14l-1 10H6L5 10z" />
                    </svg>
                    </div>
                    <div>
                    <h4 className="font-semibold text-lg mb-1">Application mobile intuitive</h4>
                    <p className="text-sm text-gray-700">Une interface claire, rapide, pensée pour le terrain.</p>
                    </div>
                </div>
                </div>
            </div>
        </section>
        <hr className="my-20 border-gray-300 max-w-6xl mx-auto" />

        {/* POUR QUI + TESTEZ MAINTENANT */}
        <section className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-10 text-[#034752]">
        {/* Colonne gauche */}
        <div>
            <h4 className="text-lg font-bold mb-6">Pour qui ?</h4>

            <div className="flex items-start gap-3 mb-5">
            <svg className="w-6 h-6 text-[#00b4d8]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path d="M5.121 17.804A9.977 9.977 0 0112 15c2.107 0 4.06.652 5.655 1.762M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <div>
                <p className="font-semibold">Agents immobiliers</p>
                <p className="text-sm text-gray-700">Trouvez plus de mandats grâce à la puissance du réseau.</p>
            </div>
            </div>

            <div className="flex items-start gap-3">
            <svg className="w-6 h-6 text-[#00b4d8]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path d="M5 13l4 4L19 7" />
            </svg>
            <div>
                <p className="font-semibold">Apporteurs d’affaires</p>
                <p className="text-sm text-gray-700">Un outil simple pour vous connecter à des professionnels sérieux.</p>
            </div>
            </div>
        </div>

        {/* Colonne droite */}
        <div>
            <h4 className="text-lg font-bold mb-6">Testez dès maintenant</h4>
            <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-center gap-2">
                <span className="text-[#00b4d8]">✓</span> Créez un compte gratuit
            </li>
            <li className="flex items-center gap-2">
                <span className="text-[#00b4d8]">✓</span> Sans engagement
            </li>
            <li className="flex items-center gap-2">
                <span className="text-[#00b4d8]">✓</span> Version MVP + évolutive
            </li>
            </ul>
            <button className="mt-6 bg-[#00b4d8] text-white px-6 py-2 rounded-full font-semibold hover:bg-[#0094b3] transition">
            Demander un appel avec notre équipe
            </button>
        </div>
        </section>
    </section>

    <footer className="bg-[#f9f9f9] text-[#333] py-12 px-6">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-8">

            {/* Colonne 1 : Logo */}
            <div>
            <h2 className="text-2xl font-bold text-[#00b4d8]">monhubimmo</h2>
            </div>

            {/* Colonne 2 : Rejoindre */}
            <div>
            <h3 className="font-semibold mb-3">Rejoindre MonHubImmo</h3>
            <ul className="space-y-1 text-sm">
                <li><a href="#">Profil reconversion</a></li>
                <li><a href="#">Profil immobilier</a></li>
                <li><a href="#">Rémunération</a></li>
                <li><a href="#">Formation</a></li>
                <li><a href="#">Témoignages</a></li>
                <li><a href="#">Presse</a></li>
                <li><a href="#">Blog</a></li>
                <li className="mt-2">Contact : <br /><a href="tel:0189864848">0x xx xx xx xx</a></li>
            </ul>
            </div>

            {/* Colonne 3 : Découvrir */}
            <div>
            <h3 className="font-semibold mb-3">Découvrir</h3>
            <ul className="space-y-1 text-sm">
                <li><a href="#">Acheter</a></li>
                <li><a href="#">Vendre</a></li>
                <li><a href="#">Estimer</a></li>
                <li><a href="#">Trouver un conseiller</a></li>
                <li><a href="#">Notre vision</a></li>
            </ul>
            </div>

            {/* Colonne 4 : Suivez-nous */}
            <div>
            <h3 className="font-semibold mb-3">Suivez-nous</h3>
            <div className="flex space-x-4 mb-4">
                <a href="#"><img src="/icons/instagram.svg" alt="Instagram" className="w-6 h-6" /></a>
                <a href="#"><img src="/icons/linkedin.svg" alt="LinkedIn" className="w-6 h-6" /></a>
                <a href="#"><img src="/icons/facebook.svg" alt="Facebook" className="w-6 h-6" /></a>
                <a href="#"><img src="/icons/twitter.svg" alt="Twitter" className="w-6 h-6" /></a>
                <a href="#"><img src="/icons/tiktok.svg" alt="TikTok" className="w-6 h-6" /></a>
            </div>
             
            </div>
        </div>

        {/* Bar inférieure */}
        <div className="border-t mt-10 pt-4 text-xs text-gray-500 text-center">
            <a href="#" className="mx-2">Politique de confidentialité</a> |
            <a href="#" className="mx-2">Mentions légales</a> |
            <a href="#" className="mx-2">Politique cookies</a> |
            <a href="#" className="mx-2">Cookies</a>
        </div>
    </footer>

    </main>
  );
}
