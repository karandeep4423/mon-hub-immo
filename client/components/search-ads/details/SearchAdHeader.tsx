import React from 'react';
import { useRouter } from 'next/navigation';
import { SearchAd } from '@/types/searchAd';

interface SearchAdHeaderProps {
	searchAd: SearchAd;
}

export const SearchAdHeader: React.FC<SearchAdHeaderProps> = ({ searchAd }) => {
	const router = useRouter();

	return (
		<div className="mb-10">
			<div className="flex items-center justify-between mb-6">
				<button
					onClick={() => router.back()}
					className="group flex items-center gap-2 text-gray-600 hover:text-cyan-600 transition-all duration-200 font-medium"
				>
					<svg
						className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform duration-200"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M15 19l-7-7 7-7"
						/>
					</svg>
					<span>Retour</span>
				</button>

				<div className="flex items-center gap-3">
					<span
						className={`px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wide shadow-sm ${
							searchAd.status === 'active'
								? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
								: searchAd.status === 'paused'
									? 'bg-gradient-to-r from-yellow-400 to-orange-400 text-white'
									: 'bg-gradient-to-r from-gray-400 to-gray-500 text-white'
						}`}
					>
						{searchAd.status === 'active'
							? '✓ Actif'
							: searchAd.status === 'paused'
								? '⏸ En pause'
								: '✓ Réalisé'}
					</span>
					<span
						className={`px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wide shadow-sm ${
							searchAd.authorType === 'agent'
								? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
								: 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
						}`}
					>
						{searchAd.authorType === 'agent'
							? '👨‍💼 Agent'
							: '🤝 Apporteur'}
					</span>
				</div>
			</div>

			<div className="space-y-3 mb-6">
				<h1 className="text-2xl lg:text-3xl font-bold text-gray-900 leading-tight">
					{searchAd.title}
				</h1>

				{searchAd.description && (
					<p className="text-base text-gray-600 leading-relaxed max-w-4xl">
						{searchAd.description}
					</p>
				)}
			</div>
		</div>
	);
};
