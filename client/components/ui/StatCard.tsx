import React from 'react';

export type StatGradient = 'blue' | 'emerald' | 'purple' | 'rose';

export interface StatDetail {
	label: string;
	value: number | string;
	color?: string; // hex or tailwind-compatible inline style
}

export interface StatCardProps {
	icon: React.ReactNode;
	title: string;
	value: number | string;
	gradient?: StatGradient;
	details?: StatDetail[];
	className?: string;
}

const gradientMap: Record<StatGradient, { container: string; pill: string }> = {
	blue: {
		container: 'from-blue-50 to-cyan-50 border-blue-100',
		pill: 'text-blue-600 bg-blue-100',
	},
	emerald: {
		container: 'from-emerald-50 to-green-50 border-emerald-100',
		pill: 'text-emerald-600 bg-emerald-100',
	},
	purple: {
		container: 'from-purple-50 to-indigo-50 border-purple-100',
		pill: 'text-purple-600 bg-purple-100',
	},
	rose: {
		container: 'from-rose-50 to-pink-50 border-rose-100',
		pill: 'text-rose-600 bg-rose-100',
	},
};

export const StatCard: React.FC<StatCardProps> = ({
	icon,
	title,
	value,
	gradient = 'blue',
	details = [],
	className = '',
}) => {
	const g = gradientMap[gradient];
	return (
		<div className={`bg-gradient-to-br ${g.container} border rounded-xl shadow-sm p-4 sm:p-5 ${className}`}>
			<div className="flex items-start justify-between gap-3">
				<div className="flex items-center gap-3">
					<div className="w-10 h-10 rounded-lg bg-white/70 flex items-center justify-center shadow-sm">
						{icon}
					</div>
					<div>
						<p className="text-xs sm:text-sm text-gray-600">{title}</p>
						<p className="text-xl sm:text-2xl md:text-3xl font-extrabold text-gray-900 leading-tight">{value}</p>
					</div>
				</div>
			</div>

			{details.length > 0 && (
				<div className="mt-3 sm:mt-4 grid grid-cols-1 gap-2">
					{details.map((d, i) => (
						<div key={i} className="flex items-center justify-between">
							<span className="text-xs sm:text-sm text-gray-700 truncate">{d.label}</span>
							<span
								className={`px-2 py-0.5 rounded-full text-[11px] sm:text-xs font-semibold ${g.pill}`}
								style={d.color ? { color: d.color, backgroundColor: `${d.color}22` } : undefined}
							>
								{d.value}
							</span>
						</div>
					))}
				</div>
			)}
		</div>
	);
};

export default StatCard;
