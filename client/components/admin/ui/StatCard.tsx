import React from 'react';
import { designTokens } from '@/lib/constants/designTokens';

interface StatCardProps {
	icon: React.ReactNode;
	title: string;
	value: string | number;
	trend?: { value: number; isPositive: boolean };
	gradient?: 'blue' | 'purple' | 'emerald' | 'rose';
	details?: { label: string; value: number | string; color: string }[];
}

export const StatCard: React.FC<StatCardProps> = ({
	icon,
	title,
	value,
	trend,
	gradient = 'blue',
	details,
}) => {
	return (
		<div className="group relative overflow-hidden rounded-xl bg-white p-4 sm:p-5 md:p-6 shadow-md transition-all duration-300 hover:shadow-lg hover:scale-105 border border-gray-100">
			{/* Gradient background effect */}
			<div
				className="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-300"
				style={{ background: designTokens.gradients[gradient] }}
			/>

			{/* Content */}
			<div className="relative z-10">
				{/* Header with icon */}
				<div className="flex items-center justify-between mb-3 sm:mb-4">
					<div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-gradient-to-br flex items-center justify-center text-lg sm:text-2xl flex-shrink-0"
						style={{ background: designTokens.gradients[gradient] }}>
						{icon}
					</div>
					{trend && (
						<div className={`text-xs sm:text-sm font-semibold ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
							{trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
						</div>
					)}
				</div>

				{/* Title */}
				<p className="text-xs sm:text-sm text-gray-600 font-medium mb-2">{title}</p>

				{/* Value */}
				<p className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4 truncate">{value}</p>

				{/* Details badges */}
				{details && (
					<div className="flex flex-wrap gap-1 sm:gap-2">
						{details.map((d) => (
							<span
								key={d.label}
								className="px-2 py-1 rounded-md text-xs font-medium truncate"
								style={{
									backgroundColor: d.color.includes('bg-') ? d.color : `${d.color}20`,
									color: d.color,
								}}
							>
								{d.label}: {d.value}
							</span>
						))}
					</div>
				)}
			</div>
		</div>
	);
};

export default StatCard;
