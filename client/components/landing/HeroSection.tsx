import Link from 'next/link';
import { LuHandshake, LuMessageCircle } from 'react-icons/lu';

export const HeroSection = () => {
	return (
		<section className="min-h-screen flex flex-col justify-center items-center text-center px-6 bg-[#00b4d8] text-white">
			<p className="text-lg md:text-xl font-medium max-w-2xl">
				Ici, peu importe votre réseau:
				<br />
				<span className="font-bold">
					ce qui compte : c&apos;est de conclure
					<br />
					plus de ventes, ensemble.
				</span>
			</p>

			<h1 className="text-3xl md:text-5xl py-12 font-bold">
				Découvrez
				<br />
				<span className="text-white">monhubimmo</span>
			</h1>

			<div className="sm:space-y-4 space-y-3 sm:mb-7 max-w-2xl">
				<div className="flex items-center justify-center gap-4">
					<LuMessageCircle className="w-12 h-12 text-white" />
					<p className="text-lg md:text-xl font-medium text-left">
						La 1ere plateforme collaborative pour
						<br />
						tous les professionnels de l&apos;immobilier.
					</p>
				</div>

				<div className="flex mr-10.5 items-center justify-center gap-4">
					<LuHandshake className="w-12 h-12 text-white" />
					<p className="text-lg md:text-xl font-medium text-left">
						Partagez vos biens et vos clients,
						<br />
						sans barrière de réseau.
					</p>
				</div>
			</div>

			<Link
				href="/auth/login"
				className="bg-white text-gray-900 px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors duration-200 shadow-lg"
			>
				Tester gratuitement pendant 3 mois
			</Link>
		</section>
	);
};
