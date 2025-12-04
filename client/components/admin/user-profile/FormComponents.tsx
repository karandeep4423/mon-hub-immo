import React from 'react';
import { CheckCircle2, XCircle, LucideIcon } from 'lucide-react';

// Form Field with icon and label
export const FormField: React.FC<{
	label: string;
	icon?: React.ReactNode;
	children: React.ReactNode;
}> = ({ label, icon, children }) => (
	<div className="space-y-1">
		<label className="flex items-center text-sm font-medium text-gray-700">
			{icon && <span className="mr-2 text-gray-500">{icon}</span>}
			{label}
		</label>
		{children}
	</div>
);

// Tab Section Header
export const TabSectionHeader: React.FC<{
	icon: LucideIcon;
	title: string;
	description?: string;
	iconBgColor?: string;
	iconColor?: string;
}> = ({
	icon: Icon,
	title,
	description,
	iconBgColor = 'bg-blue-50',
	iconColor = 'text-blue-600',
}) => (
	<div className="flex items-center gap-3 mb-8 pb-4 border-b border-gray-100">
		<div className={`p-2 ${iconBgColor} rounded-lg ${iconColor}`}>
			<Icon size={24} />
		</div>
		<div>
			<h3 className="text-lg font-bold text-gray-900">{title}</h3>
			{description && (
				<p className="text-sm text-gray-500">{description}</p>
			)}
		</div>
	</div>
);

// Sub-section Header
export const SubSectionHeader: React.FC<{
	icon: LucideIcon;
	title: string;
}> = ({ icon: Icon, title }) => (
	<h4 className="text-md font-semibold text-gray-800 mb-4 flex items-center">
		<Icon size={18} className="mr-2 text-primary-500" />
		{title}
	</h4>
);

// Checkbox Field with styling
export const CheckboxField: React.FC<{
	checked: boolean;
	onChange: (checked: boolean) => void;
	icon: LucideIcon;
	label: string;
}> = ({ checked, onChange, icon: Icon, label }) => (
	<label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-primary-300 cursor-pointer transition-colors">
		<input
			type="checkbox"
			checked={checked}
			onChange={(e) => onChange(e.target.checked)}
			className="w-5 h-5 rounded border-gray-300 text-[#26bab6] focus:ring-[#26bab6] accent-[#26bab6]"
		/>
		<div className="flex items-center gap-2">
			<Icon size={18} className="text-gray-500" />
			<span className="text-sm text-gray-700">{label}</span>
		</div>
	</label>
);

// Info Card for account tab
export const InfoCard: React.FC<{
	label: string;
	value: React.ReactNode;
	variant?: 'default' | 'success' | 'error' | 'purple';
}> = ({ label, value, variant = 'default' }) => {
	const bgClasses = {
		default: 'bg-gray-50/50 border-gray-100 hover:border-gray-200',
		success: 'bg-green-50/50 border-green-100 hover:border-green-200',
		error: 'bg-red-50/50 border-red-100 hover:border-red-200',
		purple: 'bg-purple-50/50 border-purple-100 hover:border-purple-200',
	};

	return (
		<div
			className={`p-5 rounded-xl border transition-colors ${bgClasses[variant]}`}
		>
			<p className="text-xs text-gray-500 uppercase tracking-wider mb-2 font-semibold">
				{label}
			</p>
			<div className="font-bold text-gray-900">{value}</div>
		</div>
	);
};

// Status indicator with icon
export const StatusIndicator: React.FC<{
	isPositive: boolean;
	positiveText: string;
	negativeText: string;
	positiveIcon?: LucideIcon;
	negativeIcon?: LucideIcon;
}> = ({
	isPositive,
	positiveText,
	negativeText,
	positiveIcon: PositiveIcon = CheckCircle2,
	negativeIcon: NegativeIcon = XCircle,
}) => (
	<p className="font-bold flex items-center gap-2">
		{isPositive ? (
			<>
				<div className="p-1 bg-green-100 rounded-full">
					<PositiveIcon className="w-4 h-4 text-green-600" />
				</div>
				<span className="text-green-700">{positiveText}</span>
			</>
		) : (
			<>
				<div className="p-1 bg-red-100 rounded-full">
					<NegativeIcon className="w-4 h-4 text-red-600" />
				</div>
				<span className="text-red-700">{negativeText}</span>
			</>
		)}
	</p>
);

// Stat Box for sidebar
export const StatBox: React.FC<{
	value: number;
	label: string;
	gradient: string;
	textColor: string;
	labelColor: string;
}> = ({ value, label, gradient, textColor, labelColor }) => (
	<div
		className={`${gradient} rounded-lg sm:rounded-xl p-2 sm:p-3 text-center border`}
	>
		<div
			className={`text-lg sm:text-xl md:text-2xl font-bold ${textColor}`}
		>
			{value}
		</div>
		<div
			className={`text-[8px] sm:text-[10px] ${labelColor} uppercase font-bold tracking-wider mt-0.5`}
		>
			{label}
		</div>
	</div>
);

// Action Button for sidebar
export const ActionButton: React.FC<{
	onClick: () => void;
	disabled: boolean;
	icon: LucideIcon;
	label: string;
	variant: 'primary' | 'danger' | 'warning' | 'ghost';
}> = ({ onClick, disabled, icon: Icon, label, variant }) => {
	const variantClasses = {
		primary:
			'text-white bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-sm hover:shadow-md',
		danger: 'text-red-600 bg-red-50 hover:bg-red-100 border border-red-100 hover:border-red-200',
		warning:
			'text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 hover:border-amber-300',
		ghost: 'bg-sky-300 text-gray-500 hover:text-red-600 hover:bg-red-50',
	};

	return (
		<button
			onClick={onClick}
			disabled={disabled}
			className={`w-full flex items-center justify-center sm:justify-start gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 disabled:opacity-50 ${variantClasses[variant]}`}
		>
			<Icon size={16} className="sm:w-[18px] sm:h-[18px]" />
			<span>{label}</span>
		</button>
	);
};
