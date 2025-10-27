import { Features } from '@/lib/constants';
// Migrated: Features.Landing.LANDING_UI_TEXT;

export const ProfessionalSection = () => {
	return (
		<section className="bg-white py-16 px-6 text-brand-deep">
			<div className="max-w-4xl mx-auto text-center">
				<h2 className="text-xl md:text-2xl font-bold mb-6">
					<span className="inline-flex items-center gap-2">
						<span></span>
						<span>
							{Features.Landing.LANDING_UI_TEXT.professionalTitle}
						</span>
					</span>
				</h2>

				<p className="mb-4 text-md md:text-lg">
					{Features.Landing.LANDING_UI_TEXT.professionalSubtitle}
				</p>

				<p className="text-md md:text-lg font-semibold">
					<strong>
						{
							Features.Landing.LANDING_UI_TEXT
								.professionalDescription
						}
					</strong>
				</p>
			</div>
		</section>
	);
};
