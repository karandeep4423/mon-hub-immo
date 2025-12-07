'use client';

import React from 'react';
import { STAT_CARD_COLORS } from '@/lib/constants/admin';

export interface FilterStatCardProps {
	icon: React.ReactNode;
	label: string;
	value: string | number;
	color: keyof typeof STAT_CARD_COLORS;
}

export const FilterStatCard: React.FC<FilterStatCardProps> = ({
	icon,
	label,
	value,
	color,
}) => {
	return (
		<div
			className={`bg-gradient-to-br ${STAT_CARD_COLORS[color]} border rounded-lg p-3 sm:p-4`}
		>
			<div className="flex items-center justify-between">
				<div className="min-w-0">
					<p className="text-xs sm:text-sm text-gray-600 truncate">
						{label}
					</p>
					<p className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">
						{value}
					</p>
				</div>
				<span className="text-2xl sm:text-3xl flex-shrink-0">
					{icon}
				</span>
			</div>
		</div>
	);
};
