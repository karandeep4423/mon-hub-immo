import React from 'react';
import { useRouter } from 'next/navigation';
import { SearchAd } from '@/types/searchAd';
import { RichTextDisplay } from '@/components/ui';

interface SearchAdHeaderProps {
	searchAd: SearchAd;
}

export const SearchAdHeader: React.FC<SearchAdHeaderProps> = ({ searchAd }) => {
	const router = useRouter();

	return (
		<div className="mb-6">
			<div className="flex items-center justify-between mb-5">
				<button
					onClick={() => router.back()}
					className="group flex items-center gap-2 text-gray-600 hover:text-brand transition-all duration-200 font-medium"
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
						className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide shadow-sm ${
							searchAd.authorType === 'agent'
								? 'bg-brand text-white'
								: 'bg-purple-600 text-white'
						}`}
					>
						{searchAd.authorType === 'agent'
							? '👨‍💼 Agent'
							: '🤝 Apporteur'}
					</span>
				</div>
			</div>

			<div className="space-y-3">
				<h1 className="text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
					{searchAd.title}
				</h1>

				{searchAd.description && (
					<div className="text-base text-gray-700 leading-relaxed max-w-4xl">
						<RichTextDisplay content={searchAd.description} />
					</div>
				)}
			</div>
		</div>
	);
};
