import { Features } from '@/lib/constants';
// Migrated: Features.Landing.LANDING_UI_TEXT;

export const BenefitsSection = () => {
	return (
		<section className="bg-white py-16 px-6">
			<h2 className="text-3xl font-bold text-center text-brand-deep mb-10">
				{Features.Landing.LANDING_UI_TEXT.whyJoin}
			</h2>

			<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto text-brand-deep">
				<div className="border-2 border-brand p-6 rounded shadow">
					<h3 className="font-bold text-lg mb-2">
						{
							Features.Landing.LANDING_UI_TEXT
								.benefitShareProperties
						}
					</h3>
					<p>
						{
							Features.Landing.LANDING_UI_TEXT
								.benefitSharePropertiesDesc
						}
					</p>
				</div>

				<div className="border-2 border-brand p-6 rounded shadow">
					<h3 className="font-bold text-lg mb-2">
						{
							Features.Landing.LANDING_UI_TEXT
								.benefitRealTimeVisibility
						}
					</h3>
					<p>
						{
							Features.Landing.LANDING_UI_TEXT
								.benefitRealTimeVisibilityDesc
						}
					</p>
				</div>

				<div className="border-2 border-brand  p-6 rounded shadow">
					<h3 className="font-bold text-lg mb-2">
						{Features.Landing.LANDING_UI_TEXT.benefitFindForClients}
					</h3>
					<p>
						{
							Features.Landing.LANDING_UI_TEXT
								.benefitFindForClientsDesc
						}
					</p>
				</div>

				<div className="border-2 border-brand p-6 rounded shadow">
					<h3 className="font-bold text-lg mb-2">
						{
							Features.Landing.LANDING_UI_TEXT
								.benefitTargetedSearches
						}
					</h3>
					<p>
						{
							Features.Landing.LANDING_UI_TEXT
								.benefitTargetedSearchesDesc
						}
					</p>
				</div>

				<div className="border-2 border-brand p-6 rounded shadow">
					<h3 className="font-bold text-lg mb-2">
						{
							Features.Landing.LANDING_UI_TEXT
								.benefitMultiNetworkCollab
						}
					</h3>
					<p>
						{
							Features.Landing.LANDING_UI_TEXT
								.benefitMultiNetworkCollabDesc
						}
					</p>
				</div>

				<div className="border-2 border-brand p-6 rounded shadow">
					<h3 className="font-bold text-lg mb-2">
						{
							Features.Landing.LANDING_UI_TEXT
								.benefitPrivateMessaging
						}
					</h3>
					<p>
						{
							Features.Landing.LANDING_UI_TEXT
								.benefitPrivateMessagingDesc
						}
					</p>
				</div>

				<div className="border-2  border-brand p-6 rounded shadow md:col-span-2 lg:col-span-3">
					<h3 className="font-bold text-lg mb-2">
						{Features.Landing.LANDING_UI_TEXT.benefitIntuitiveBoard}
					</h3>
					<p>
						{
							Features.Landing.LANDING_UI_TEXT
								.benefitIntuitiveBoardDesc
						}
					</p>
				</div>
			</div>
		</section>
	);
};
