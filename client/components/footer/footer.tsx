import React from 'react';
import { FaInstagram, FaLinkedin, FaFacebook, FaTiktok } from 'react-icons/fa';
import { useCookieConsent } from '@/context/CookieConsentContext';

export const Footer = () => {
	const { openPreferences } = useCookieConsent();

	return (
		<div>
			{/* Footer */}
			<footer className="bg-[#f9f9f9] text-[#333] py-10 px-6 sm:px-16">
				<div className=" max-w-7xl mx-auto  justify-center grid md:grid-cols-3 gap-4 md:gap-16">
					{/* Logo */}
					<div className="mb-4">
						<h2 className="text-2xl font-bold">
							<span className="text-black">mon</span>
							<span className="text-[#00b4d8]">hubimmo</span>
						</h2>
						<p className="text-sm font-medium text-[#00b4d8] mt-2">
							La 1ere plateforme collaborative pour tous les
							<br />
							professionnels de l’immobilier
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
									href="mailto:contact@monhubimmo.fr"
									className="text-sm font-medium"
								>
									contact@monhubimmo.fr
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
								<a
									href="/home"
									className="hover:text-[#00b4d8]"
								>
									Découvrir MonHubImmo
								</a>
							</div>
							<div>
								<a
									href="/auth/signup"
									className="hover:text-[#00b4d8]"
								>
									Inscription (3 mois offerts)
								</a>
							</div>
							<div>
								<a
									href="/conditions-generales"
									className="hover:text-[#00b4d8]"
								>
									Conditions générales
								</a>
							</div>
							<div>
								<a
									href="politique-de-confidentialite"
									className="hover:text-[#00b4d8]"
								>
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
					<p>
						Demain, MonHubimmo ne sera pas seulement la plateforme
						des pros : ce sera aussi un point de rencontre
						incontournable entre particuliers et professionnels.
						<br />
						La plateforme collaborative au service des
						professionnels et des particuliers.
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
					<a href="politique-cookies" className="mx-2">
						Politique cookies
					</a>{' '}
					|
					<button
						onClick={openPreferences}
						className="mx-2 hover:text-[#00b4d8] transition-colors"
					>
						Gérer les cookies
					</button>
				</div>
			</footer>
		</div>
	);
};
