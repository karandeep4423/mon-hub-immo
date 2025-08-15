'use client';
import { useRef, useState, useEffect } from 'react';
import {
	FaInstagram,
	FaLinkedin,
	FaFacebook,
	FaTiktok,
	FaUserCog,
	FaUser,
} from 'react-icons/fa';
import { LuHandshake, LuMessageCircle } from 'react-icons/lu';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
export default function LandingPage() {
	const scrollToForm = () => {
		formRef.current?.scrollIntoView({ behavior: 'smooth' });
	};

	const formRef = useRef<HTMLFormElement>(null);
	const router = useRouter();
	const { user, loading: authLoading } = useAuth();
	const [loading, setLoading] = useState(false);
	const [message, setMessage] = useState<string | null>(null);
	const [messageType, setMessageType] = useState<'success' | 'error'>(
		'success',
	);
	const [isRedirecting, setIsRedirecting] = useState(false);

	async function handleSubmit(event: React.FormEvent) {
		event.preventDefault();
		setLoading(true);
		setMessage(null);

		if (!formRef.current) return;

		const formData = new FormData(formRef.current);
		const data: ContactFormData = {
			name: formData.get('name') as string,
			email: formData.get('email') as string,
			phone: (formData.get('phone') as string) || undefined,
		};

		try {
			const res = await fetch(
				'https://www.monhubimmo.com/api/send-email',
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify(data),
				},
			);

			if (res.ok) {
				setMessage(
					'Votre message a été envoyé avec succès. Nous vous contacterons bientôt.',
				);
				setMessageType('success');
				formRef.current.reset();
			} else {
				const err = await res.json();
				setMessage(
					err.error || "Une erreur est survenue lors de l'envoi.",
				);
				setMessageType('error');
			}
		} catch (error) {
			setMessage(
				"Une erreur est survenue lors de l'envoi. Veuillez réessayer.",
			);
			setMessageType('error');
		} finally {
			setLoading(false);
		}
	}

	interface ContactFormData {
		name: string;
		email: string;
		phone?: string;
	}

	// Handle redirect if user is already authenticated
	useEffect(() => {
		if (!authLoading && user && !isRedirecting) {
			setIsRedirecting(true);
			router.push('/home');
		}
	}, [user, authLoading, router, isRedirecting]);

	// Show loading state while checking auth or redirecting
	if (authLoading || isRedirecting) {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600 mx-auto mb-4"></div>
					<p className="text-gray-600">
						{isRedirecting ? 'Redirection...' : 'Chargement...'}
					</p>
				</div>
			</div>
		);
	}

	// Don't render the form if user is authenticated (additional safety check)
	if (user) {
		return null;
	}
	return (
		<main className="bg-[#00b4d8] min-h-screen text-white font-sans">
			{/* PAGE 1 - HERO */}
			<section className="min-h-screen flex flex-col justify-center items-center text-center px-6 bg-[#00b4d8] text-white">
				<p className="text-lg md:text-xl font-medium mb-2 max-w-2xl">
					Ici, peu importe votre réseau:
					<br />
					<span className="font-bold">
						ce qui compte : c&apos;est de conclure
						<br />
						plus de ventes,ensemble.
					</span>
				</p>

				<h1 className="text-3xl md:text-6xl font-bold mb-4">
					Découvrez
					<br />
					<span className="text-white">monhubimmo</span>
				</h1>

				{/* Feature items with icons */}
				<div className="sm:space-y-7  space-y-3 mb-3 sm:mb-7 max-w-2xl">
					<div className="flex items-center justify-center gap-4">
						<LuMessageCircle className="w-12 h-12 text-white " />
						<p className="text-lg md:text-xl font-medium text-left">
							Le 1ère réseau collaboratif entre
							<br />
							tous professionnels de l&apos;immobilier.
						</p>
					</div>

					<div className="flex mr-3 items-center justify-center gap-4">
						<LuHandshake className="w-12 h-12 text-white" />
						<p className="text-lg md:text-xl font-medium text-left">
							Partagez biens et clients
							<br />
							de toutes enseignes confondues.
						</p>
					</div>
				</div>

				<button
					onClick={scrollToForm}
					className="bg-white text-gray-900 px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors duration-200 shadow-lg"
				>
					Je veux être informé dès maintenant
				</button>
			</section>

			{/* SECTION BÉNÉFICES - après le HERO */}
			<section className="bg-white py-16 px-6">
				<h2 className="text-3xl font-bold text-center text-[#034752] mb-10">
					Pourquoi rejoindre MonHubimmo ?
				</h2>

				<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto text-[#034752]">
					<div className="border-2 border-[#00b4d8] p-6 rounded shadow">
						<h3 className="font-bold text-lg mb-2">
							Partage de biens
						</h3>
						<p>
							Partagez votre stock (mandats simples, exclusifs ou
							off market) avec d&apos;autres mandataires.
						</p>
					</div>

					<div className="border-2 border-[#00b4d8] p-6 rounded shadow">
						<h3 className="font-bold text-lg mb-2">
							Visibilité en temps réel
						</h3>
						<p>
							Visualisez les biens disponibles sur votre secteur
							et ceux de vos confrères en un coup d&apos;œil.
						</p>
					</div>

					<div className="border-2 border-[#00b4d8]  p-6 rounded shadow">
						<h3 className="font-bold text-lg mb-2">
							Trouvez pour vos clients
						</h3>
						<p>
							Accédez aux biens des autres mandataires pour
							satisfaire les besoins de vos clients.
						</p>
					</div>

					<div className="border-2 border-[#00b4d8] p-6 rounded shadow">
						<h3 className="font-bold text-lg mb-2">
							Recherches clients ciblées
						</h3>
						<p>
							Déposez des recherches et recevez des propositions
							adaptées automatiquement.
						</p>
					</div>

					<div className="border-2 border-[#00b4d8] p-6 rounded shadow">
						<h3 className="font-bold text-lg mb-2">
							Collaboration multi-réseaux
						</h3>
						<p>
							Collaborez facilement avec d&apos;autres
							mandataires, quelle que soit leur enseigne.
						</p>
					</div>

					<div className="border-2 border-[#00b4d8] p-6 rounded shadow">
						<h3 className="font-bold text-lg mb-2">
							Messagerie privée
						</h3>
						<p>
							Consultez l&apos;historique de vos échanges et
							discutez en toute confidentialité.
						</p>
					</div>

					<div className="border-2  border-[#00b4d8] p-6 rounded shadow md:col-span-2 lg:col-span-3">
						<h3 className="font-bold text-lg mb-2">
							Tableau de bord intuitif
						</h3>
						<p>
							Gérez vos fiches clients, mandats et recherches
							simplement depuis un espace unique.
						</p>
					</div>
				</div>
			</section>

			<section className="bg-white py-16 px-6 text-[#034752]">
				<div className="max-w-4xl mx-auto text-center">
					<h2 className="text-xl md:text-2xl font-bold mb-6">
						<span className="inline-flex items-center gap-2">
							<span></span>
							<span>
								Vous êtes mandataire immobiliers, agent
								immobilier ou négociateurs vrp chez IAD, MAISON
								ROUGE, SAFTI, GUY HOCQUET, BSK, NAOS, LAFORET,
								EFFICITY ou un autre réseau ?
							</span>
						</span>
					</h2>

					<p className="mb-4 text-md md:text-lg">
						Vous travaillez dur pour vos clients, mais vous êtes
						souvent seul face à vos annonces, vos recherches
						acquéreurs ou vos exclusivités à diffuser…
					</p>

					<p className="text-md md:text-lg font-semibold">
						<strong>MonHubImmo</strong> est le{' '}
						<strong>
							1er réseau de collaboration 100% entre
							professionnels de l&apos;immobilier
						</strong>
						, toutes enseignes confondues de l&apos;immobilier.
					</p>
				</div>
			</section>

			{/* PAGE 2 - FORMULAIRE */}
			<section className="bg-[#00b4d8] py-16 px-6 flex flex-col items-center text-center">
				<h2 className="text-xl font-semibold mb-2 text-white">
					Offre de lancement! Inscrivez-vous maintenant!
					<br />
					Profitez de 3 mois offerts pour les 100 premiers inscrits
				</h2>
				<p className="mb-6 text-white max-w-xl">
					Rejoignez la <strong>1er plateforme collaborative</strong>{' '}
					de l&apos;immobilier
				</p>
				<div className="flex  flex-col-reverse sm:flex-row items-center justify-center gap-14">
					<div className="bg-white text-gray-900 w-full max-w-md p-6 rounded-lg shadow">
						<h3 className="text-lg font-semibold mb-4">
							Entrez vos informations :
						</h3>
						<form
							className="space-y-4"
							onSubmit={handleSubmit}
							ref={formRef}
						>
							<input
								type="text"
								name="name"
								placeholder="Nom"
								className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#0077b6] focus:border-transparent"
								required
								disabled={loading}
							/>
							<input
								type="email"
								name="email"
								placeholder="Adresse e-mail"
								className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#0077b6] focus:border-transparent"
								required
								disabled={loading}
							/>
							<input
								type="tel"
								name="phone"
								placeholder="Numéro de téléphone"
								className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#0077b6] focus:border-transparent"
								disabled={loading}
							/>
							<button
								type="submit"
								disabled={loading}
								className="bg-[#00b4d8] text-white w-full py-2 rounded font-semibold hover:bg-[#0094b3] transition disabled:opacity-50 disabled:cursor-not-allowed"
							>
								{loading
									? 'Envoi en cours...'
									: 'Inscrivez vous maintenant'}
							</button>
						</form>

						{message && (
							<div
								className={`mt-4 p-3 rounded text-sm ${
									messageType === 'success'
										? 'bg-green-100 text-green-700'
										: 'bg-red-100 text-red-700'
								}`}
							>
								{message}
							</div>
						)}
					</div>
				</div>
			</section>

			{/* SECTION POST-FORMULAIRE */}
			<section className="bg-white py-16 px-6 text-[#034752]">
				<div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8 items-center">
					{/* Texte principal */}
					<div className="flex flex-col items-center text-center">
						<h2 className="text-3xl md:text-4xl font-bold mb-4">
							La plateforme qui connecte
							<br /> les professionnels de l&lsquo;immobilier
						</h2>
						<p className="mb-6">
							Centralisez vos annonces, collaborez entre agents,
							trouvez plus vite les bons biens pour vos clients.
						</p>
						<ul className="flex flex-col text-left">
							<li className="flex items-center gap-3">
								<svg
									className="w-5 h-5 text-[#00b4d8] flex-shrink-0"
									fill="none"
									stroke="currentColor"
									strokeWidth={2}
									viewBox="0 0 24 24"
								>
									<path d="M16 12a4 4 0 01-8 0V8a4 4 0 018 0v4z" />
									<path d="M12 16v2m0 0h-4m4 0h4" />
								</svg>
								<span>Réseau privé entre agents</span>
							</li>
							<li className="flex items-center gap-3">
								<svg
									className="w-5 h-5 text-[#00b4d8] flex-shrink-0"
									fill="none"
									stroke="currentColor"
									strokeWidth={2}
									viewBox="0 0 24 24"
								>
									<path d="M4 6h16M4 10h16M4 14h16M4 18h16" />
								</svg>
								<span>Annonces internes et exclusives</span>
							</li>
							<li className="flex items-center gap-3">
								<svg
									className="w-5 h-5 text-[#00b4d8] flex-shrink-0"
									fill="none"
									stroke="currentColor"
									strokeWidth={2}
									viewBox="0 0 24 24"
								>
									<path d="M12 8v8m0 0l-4-4m4 4l4-4" />
									<circle cx="12" cy="12" r="10" />
								</svg>
								<span>Apporteurs d&apos;affaires intégrés</span>
							</li>
						</ul>
						<button
							onClick={scrollToForm}
							className="mt-6 bg-[#00b4d8] text-white px-6 py-2 rounded-full font-semibold hover:bg-[#0094b3] transition"
						>
							Je réserve ma place
						</button>
					</div>

					{/* video */}
					<div className="relative w-full h-72   max-w-md mx-auto">
						<video
							className="w-full h-full object-fill rounded-lg shadow-xl"
							controls
						>
							<source src="/partie.mp4" type="video/mp4" />
							Your browser does not support the video tag.
						</video>
						<button
							className="absolute inset-0 flex items-center justify-center"
							onClick={(e) => {
								const video = e.currentTarget
									.previousElementSibling as HTMLVideoElement;
								if (video.paused) {
									video.play();
									e.currentTarget.style.display = 'none';
								}
							}}
						>
							<div className="w-20 h-20 bg-white rounded-full flex items-center justify-center">
								<svg
									className="w-12 h-12 text-[#00b4d8]"
									fill="currentColor"
									viewBox="0 0 20 20"
								>
									<path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
								</svg>
							</div>
						</button>
					</div>
				</div>

				{/* Fonctionnalités clés */}
				<section className="bg-white py-16 px-6 text-[#034752]">
					<div className="max-w-6xl mx-auto">
						<h3 className="text-2xl font-bold text-center mb-12">
							Fonctionnalités clés
						</h3>

						<div className="grid md:grid-cols-2 gap-10">
							{/* Bloc 1 */}
							<div className="flex items-start gap-4">
								<div className="flex-shrink-0">
									<svg
										className="w-6 h-6 text-[#00b4d8]"
										fill="none"
										stroke="currentColor"
										strokeWidth={2}
										viewBox="0 0 24 24"
									>
										<path d="M12 2l7 4v6c0 5.25-3.5 9.74-7 10-3.5-.26-7-4.75-7-10V6l7-4z" />
									</svg>
								</div>
								<div>
									<h4 className="font-semibold text-lg mb-1">
										Partage d&apos;annonces privé
									</h4>
									<p className="text-sm text-gray-700">
										Déposez et consultez des biens, entre
										pros, en toute confidentialité.
									</p>
								</div>
							</div>

							{/* Bloc 2 */}
							<div className="flex items-start gap-4">
								<div className="flex-shrink-0">
									<svg
										className="w-6 h-6 text-[#00b4d8]"
										fill="none"
										stroke="currentColor"
										strokeWidth={2}
										viewBox="0 0 24 24"
									>
										<path d="M21 12.79A9 9 0 1111.21 3H12a9 9 0 019 9z" />
									</svg>
								</div>
								<div>
									<h4 className="font-semibold text-lg mb-1">
										Apporteurs d&apos;affaires intégrés
									</h4>
									<p className="text-sm text-gray-700">
										Offrez une interface simple à vos
										apporteurs pour qu’ils vous transmettent
										des opportunités.
									</p>
								</div>
							</div>

							{/* Bloc 3 */}
							<div className="flex items-start gap-4">
								<div className="flex-shrink-0">
									<svg
										className="w-6 h-6 text-[#00b4d8]"
										fill="none"
										stroke="currentColor"
										strokeWidth={2}
										viewBox="0 0 24 24"
									>
										<path d="M8 17l4-4 4 4m0-5V3" />
									</svg>
								</div>
								<div>
									<h4 className="font-semibold text-lg mb-1">
										Collaboration simplifiée
									</h4>
									<p className="text-sm text-gray-700">
										Mettez en relation les bons biens avec
										les bons clients grâce à un système
										connecté.
									</p>
								</div>
							</div>

							{/* Bloc 4 */}
							<div className="flex items-start gap-4">
								<div className="flex-shrink-0">
									<svg
										className="w-6 h-6 text-[#00b4d8]"
										fill="none"
										stroke="currentColor"
										strokeWidth={2}
										viewBox="0 0 24 24"
									>
										<path d="M17 9V7a4 4 0 00-8 0v2M5 10h14l-1 10H6L5 10z" />
									</svg>
								</div>
								<div>
									<h4 className="font-semibold text-lg mb-1">
										Application mobile intuitive
									</h4>
									<p className="text-sm text-gray-700">
										Une interface claire, rapide, pensée
										pour le terrain.
									</p>
								</div>
							</div>
						</div>
					</div>
				</section>
				<div className="relative w-full h-full   max-w-md mx-auto">
					<video
						className="w-full h-full object-fill rounded-lg shadow-xl"
						controls
					>
						<source src="/second.mp4" type="video/mp4" />
						Your browser does not support the video tag.
					</video>
					<button
						className="absolute inset-0 flex items-center justify-center"
						onClick={(e) => {
							const video = e.currentTarget
								.previousElementSibling as HTMLVideoElement;
							if (video.paused) {
								video.play();
								e.currentTarget.style.display = 'none';
							}
						}}
					>
						<div className="w-20 h-20 bg-white rounded-full flex items-center justify-center">
							<svg
								className="w-12 h-12 text-[#00b4d8]"
								fill="currentColor"
								viewBox="0 0 20 20"
							>
								<path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
							</svg>
						</div>
					</button>
				</div>
				<hr className="my-10 border-gray-300 max-w-6xl mx-auto" />

				{/* POUR QUI + TESTEZ MAINTENANT */}
				<section className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-10 text-[#034752]">
					{/* Colonne gauche */}
					<div>
						<h4 className="text-lg font-bold mb-6">Pour qui ?</h4>

						<div className="flex items-start gap-3 mb-6">
							<FaUser className="w-9 h-9 text-[#00b4d8] flex-shrink-0" />
							<div>
								<p className="font-semibold">
									Agents immobiliers
								</p>
								<p className="text-sm text-gray-700">
									Trouvez plus de mandats grâce à la puissance
									du réseau.
								</p>
							</div>
						</div>

						<div className="flex items-start gap-3">
							<FaUserCog className="w-10 h-10 text-[#00b4d8] flex-shrink-0" />
							<div>
								<p className="font-semibold">
									Apporteurs d&apos;affaires
								</p>
								<p className="text-sm text-gray-700">
									MonHubimmo vous ouvre aussi les portes du
									réseau caché des particuliers et
									prescripteurs locaux. Ils peuvent désormais
									publier leurs propres annonces, consultables
									par les mandataires sur la plateforme.
								</p>
								<p className="text-sm text-gray-700 mt-4">
									Des particuliers, amis, voisins ou
									commerçants qui connaissent un bien à vendre
									ou un acheteur potentiel ? C&apos;est un
									véritable levier de prospection et de
									mandats avant même leur diffusion sur les
									portails.
								</p>
							</div>
						</div>
					</div>

					{/* Colonne droite */}
					<div className="flex flex-col">
						<h4 className="text-lg font-bold mb-6">
							Testez dès maintenant
						</h4>
						<ul className="space-y-2 text-sm text-gray-700 mb-6">
							<li className="flex items-center gap-2">
								<span className="text-[#00b4d8]">✓</span> Créez
								un compte gratuit
							</li>
							<li className="flex items-center gap-2">
								<span className="text-[#00b4d8]">✓</span> Sans
								engagement
							</li>
							<li className="flex items-center gap-2">
								<span className="text-[#00b4d8]">✓</span>{' '}
								Version MVP + évolutive
							</li>
						</ul>
						<button
							onClick={scrollToForm}
							className="bg-[#00b4d8] text-white px-6 py-2 rounded-full font-semibold hover:bg-[#0094b3] transition self-start"
						>
							M&apos;inscrire en avant première
						</button>
					</div>
				</section>
			</section>

			<footer className="bg-[#f9f9f9] text-[#333] py-10 px-6 sm:px-16">
				<div className=" max-w-7xl mx-auto  justify-center grid md:grid-cols-3 gap-4 md:gap-16">
					{/* Logo */}
					<div className="mb-4">
						<h2 className="text-2xl font-bold">
							<span className="text-black">mon</span>
							<span className="text-[#00b4d8]">hubimmo</span>
						</h2>
						<p className="text-sm font-medium text-[#00b4d8] mt-2">
							Le 1er réseau collaboratif des
							<br />
							professionnels de l&apos;immobilier
						</p>
						{/* Contact Info */}
						<div className="my-4 space-y-3">
							<div className="flex items-center space-x-2">
								<svg
									className="w-5 h-5 text-[#00b4d8]"
									fill="currentColor"
									viewBox="0 0 20 20"
								>
									<path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
									<path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
								</svg>
								<a
									href="mailto:contact@monhubimmo.com"
									className="text-sm font-medium"
								>
									contact@monhubimmo.com
								</a>
							</div>
							<div className="flex items-center space-x-2">
								<svg
									className="w-5 h-5 text-[#00b4d8]"
									fill="currentColor"
									viewBox="0 0 20 20"
								>
									<path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
								</svg>
								<a
									href="tel:+33785549213"
									className="text-sm font-medium"
								>
									+33 7 85 54 92 13
								</a>
							</div>
						</div>
					</div>

					{/* Useful Links */}
					<div className="mb-4">
						<h3 className="font-semibold mb-4">Liens utiles</h3>
						<div className=" text-left space-y-2 text-sm">
							<div>
								<a href="#" className="hover:text-[#00b4d8]">
									Découvrir MonHubImmo
								</a>
							</div>
							<div>
								<a href="#" className="hover:text-[#00b4d8]">
									Inscription (3 mois offerts)
								</a>
							</div>
							<div>
								<a
									href="/mentions-legales"
									className="hover:text-[#00b4d8]"
								>
									Conditions générales
								</a>
							</div>
							<div>
								<a href="#" className="hover:text-[#00b4d8]">
									Politique de confidentialité
								</a>
							</div>
						</div>
					</div>

					{/* Social Media */}
					<div className="mb-4">
						<h3 className="font-semibold mb-4">Suivez-nous</h3>
						<div className="flex  space-x-4">
							<a
								href="https://www.instagram.com/monhubimmo/"
								className="text-[#00b4d8] hover:opacity-80"
							>
								<FaInstagram className="w-6 h-6" />
							</a>
							<a
								href="https://www.linkedin.com/in/mon-hub-immo-a65904379?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=ios_app"
								className="text-[#00b4d8] hover:opacity-80"
							>
								<FaLinkedin className="w-6 h-6" />
							</a>
							<a
								href="https://www.facebook.com/profile.php?viewas=100000686899395&id=61579213881250"
								className="text-[#00b4d8] hover:opacity-80"
							>
								<FaFacebook className="w-6 h-6" />
							</a>
							<a
								href="https://www.tiktok.com/@hubimmo?_t=ZN-8yqbaoADaXG&_r=1"
								className="text-[#00b4d8] hover:opacity-80"
							>
								<FaTiktok className="w-6 h-6" />
							</a>
						</div>
					</div>
				</div>
				{/* Copyright */}
				<div className="text-center text-xs text-gray-500 ">
					<p>© 2025 MonHubImmo - Tous droits réservés</p>
					<p className="mt-2">
						Connecter les pros, partager les opportunités.
					</p>
				</div>
				{/* Bar inférieure */}
				<div className="border-t mt-10 pt-4 text-xs text-gray-500 text-center">
					<a href="politique-de-confidentialite" className="mx-2">
						Politique de confidentialité
					</a>{' '}
					|
					<a href="/mentions-legales" className="mx-2">
						Mentions légales
					</a>{' '}
					|
					<a href="#" className="mx-2">
						Politique cookies
					</a>{' '}
					|
					<a href="#" className="mx-2">
						Cookies
					</a>
				</div>
			</footer>
		</main>
	);
}
