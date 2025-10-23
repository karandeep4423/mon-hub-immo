import { LuHandshake, LuMessageCircle } from 'react-icons/lu';
import { LANDING_TEXT } from '@/lib/constants/text';

interface HeroSectionProps {
	onScrollToForm: () => void;
}

export const HeroSection = ({ onScrollToForm }: HeroSectionProps) => {
	return (
		<section className="min-h-screen flex flex-col justify-center items-center text-center px-6 bg-brand text-white">
			<p className="text-lg md:text-xl font-medium mb-2 max-w-2xl">
				{LANDING_TEXT.heroIntro}
				<br />
				<span className="font-bold">{LANDING_TEXT.heroIntroMain}</span>
			</p>

			<h1 className="text-3xl md:text-6xl font-bold mb-4">
				{LANDING_TEXT.heroMainTitle}
				<br />
				<span className="text-white">{LANDING_TEXT.heroBrandName}</span>
			</h1>

			{/* Feature items with icons */}
			<div className="sm:space-y-7  space-y-3 mb-3 sm:mb-7 max-w-2xl">
				<div className="flex items-center justify-center gap-4">
					<LuMessageCircle className="w-12 h-12 text-white " />
					<p className="text-lg md:text-xl font-medium text-left">
						{LANDING_TEXT.networkTitle}
					</p>
				</div>

				<div className="flex mr-3 items-center justify-center gap-4">
					<LuHandshake className="w-12 h-12 text-white" />
					<p className="text-lg md:text-xl font-medium text-left">
						{LANDING_TEXT.sharingTitle}
					</p>
				</div>
			</div>

			<button
				onClick={onScrollToForm}
				className="bg-white text-gray-900 px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors duration-200 shadow-lg"
			>
				{LANDING_TEXT.wantToBeInformed}
			</button>
		</section>
	);
};
