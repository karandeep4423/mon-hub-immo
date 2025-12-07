'use client';

import React from 'react';

interface AdminPageHeaderProps {
	title: string;
	subtitle?: string;
	icon?: React.ReactNode;
	count?: number;
	countLabel?: string;
	actions?: React.ReactNode;
}

export const AdminPageHeader: React.FC<AdminPageHeaderProps> = ({
	title,
	subtitle,
	icon,
	count,
	countLabel = 'élément(s)',
	actions,
}) => {
	return (
		<div className="flex flex-col gap-2 sm:gap-3 sm:flex-row sm:justify-between sm:items-start">
			<div className="min-w-0">
				<h1 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
					{title}
				</h1>
				{(subtitle || count !== undefined) && (
					<p className="text-[10px] sm:text-xs lg:text-sm text-gray-600 mt-0.5 flex items-center gap-1.5">
						{icon && (
							<span className="w-3.5 h-3.5 sm:w-4 sm:h-4">
								{icon}
							</span>
						)}
						{count !== undefined && (
							<>
								<span className="font-medium">{count}</span>{' '}
								{countLabel}
							</>
						)}
						{subtitle && !count && subtitle}
					</p>
				)}
			</div>
			{actions && (
				<div className="flex flex-wrap gap-1.5 sm:gap-2">{actions}</div>
			)}
		</div>
	);
};
