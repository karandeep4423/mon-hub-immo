import React from 'react';

export const ApporteurBanner: React.FC = () => {
	return (
		<div className="w-full bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-3xl overflow-hidden shadow-lg p-6 text-white">
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				{/* Left Section */}
				<div>
					<h3 className="text-2xl font-bold mb-2">
						Apporteur d&apos;affaires
					</h3>
					<p className="text-lg font-medium text-cyan-100">
						un accès 100% gratuit
					</p>
				</div>

				{/* Right Section */}
				<div>
					<p className="text-sm leading-relaxed">
						<span className="font-bold">
							Devenez Apporteur d&apos;affaires
						</span>{' '}
						gratuitement : Partagez des opportunités aux agents
						immobiliers et{' '}
						<span className="font-bold">
							soyez rémunéré(e) ou avantagé(e)
						</span>{' '}
						selon l&apos;accord conclu avec l&apos;agent.
					</p>
				</div>
			</div>
		</div>
	);
};
