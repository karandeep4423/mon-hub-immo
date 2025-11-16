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
		<div className="group relative overflow-hidden rounded-xl bg-white p-6 shadow-md transition-all duration-300 hover:shadow-lg hover:scale-105 border border-gray-100">
			{/* Gradient background effect */}
			<div
				className="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-300"
				style={{ background: designTokens.gradients[gradient] }}
			/>

			{/* Content */}
			<div className="relative z-10">
				{/* Header with icon */}
				<div className="flex items-center justify-between mb-4">
					<div className="w-12 h-12 rounded-lg bg-gradient-to-br flex items-center justify-center text-2xl"
						style={{ background: designTokens.gradients[gradient] }}>
						{icon}
					</div>
					{trend && (
						<div className={`text-sm font-semibold ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
							{trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
						</div>
					)}
				</div>

				{/* Title */}
				<p className="text-sm text-gray-600 font-medium mb-2">{title}</p>

				{/* Value */}
				<p className="text-3xl font-bold text-gray-900 mb-4">{value}</p>

				{/* Details badges */}
				{details && (
					<div className="flex flex-wrap gap-2">
						{details.map((d) => (
							<span
								key={d.label}
								className="px-2 py-1 rounded-md text-xs font-medium"
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
