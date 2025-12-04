'use client';

import React from 'react';
import { STAT_CARD_COLORS } from '@/lib/constants/admin';

interface AdminStatCardProps {
	icon: React.ReactNode;
	label: string;
	value: string | number;
	color: keyof typeof STAT_CARD_COLORS;
}

export const AdminStatCard: React.FC<AdminStatCardProps> = ({
	icon,
	label,
	value,
	color,
}) => {
	return (
		<div
			className={`bg-gradient-to-br ${STAT_CARD_COLORS[color]} border rounded-lg p-2.5 sm:p-3 lg:p-4`}
		>
			<div className="flex items-center justify-between gap-2">
				<div className="min-w-0">
					<p className="text-[10px] sm:text-xs lg:text-sm text-gray-600 truncate">
						{label}
					</p>
					<p className="text-base sm:text-lg lg:text-2xl font-bold text-gray-900 mt-0.5 truncate">
						{value}
					</p>
				</div>
				<span className="text-lg sm:text-2xl lg:text-3xl flex-shrink-0">
					{icon}
				</span>
			</div>
		</div>
	);
};
