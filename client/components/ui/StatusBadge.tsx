import React from 'react';
import { logger } from '@/lib/utils/logger';

import { Features } from '@/lib/constants';

// Badge variant type and classes (moved from statusConfigs.ts)
type BadgeVariant =
	| 'success'
	| 'warning'
	| 'error'
	| 'info'
	| 'default'
	| 'primary';

const BADGE_VARIANT_CLASSES: Record<BadgeVariant, string> = {
	success: 'bg-green-100 text-green-800 border-green-200',
	warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
	error: 'bg-red-100 text-red-800 border-red-200',
	info: 'bg-info-light text-info border-info',
	default: 'bg-gray-100 text-gray-800 border-gray-200',
	primary: 'bg-purple-100 text-purple-800 border-purple-200',
};

// Status config interface
interface StatusConfig {
	label: string;
	variant: BadgeVariant;
	className: string;
}

// Entity type for status badge
type EntityType = 'property' | 'appointment' | 'collaboration' | 'searchAd';

// Status type for legacy support
type StatusType = keyof typeof Features.Common.STATUS_COLORS;

// Helper to get status config from feature constants
function getStatusConfig(
	entityType: EntityType,
	status: string,
): StatusConfig | undefined {
	const configs = {
		property: Features.Properties.PROPERTY_STATUS_CONFIG,
		appointment: Features.Appointments.APPOINTMENT_STATUS_CONFIG,
		collaboration: Features.Collaboration.COLLABORATION_STATUS_CONFIG,
		searchAd: Features.SearchAds.SEARCH_AD_STATUS_CONFIG,
	};
	return configs[entityType][
		status as keyof (typeof configs)[typeof entityType]
	];
}

// Legacy interface for backward compatibility
interface LegacyStatusBadgeProps {
	status: StatusType;
	size?: 'sm' | 'md' | 'lg';
	className?: string;
}

// New interface with entity type support
interface NewStatusBadgeProps {
	/**
	 * Type of entity (property, appointment, collaboration, searchAd)
	 */
	entityType: EntityType;

	/**
	 * Status value to display
	 */
	status: string;

	/**
	 * Optional custom className to override default styles
	 */
	className?: string;

	/**
	 * Optional size variant
	 */
	size?: 'sm' | 'md' | 'lg';
}

type StatusBadgeProps = LegacyStatusBadgeProps | NewStatusBadgeProps;

const SIZE_CLASSES = {
	sm: 'px-2 py-0.5 text-xs',
	md: 'px-2.5 py-0.5 text-sm',
	lg: 'px-3 py-1 text-base',
} as const;

/**
 * StatusBadge - Universal status badge component
 *
 * Supports both legacy usage (collaboration statuses only) and new usage (all entity types).
 * Gradually migrate to new usage with entityType prop.
 *
 * @example
 * ```tsx
 * // New usage (preferred)
 * <StatusBadge entityType="property" status="active" />
 * <StatusBadge entityType="appointment" status="confirmed" />
 *
 * // Legacy usage (backward compatible)
 * <StatusBadge status="pending" />
 * ```
 */
export const StatusBadge: React.FC<StatusBadgeProps> = (props) => {
	const { size = 'md', className = '' } = props;

	// Check if using new API (has entityType)
	if ('entityType' in props) {
		const config = getStatusConfig(props.entityType, props.status);

		if (!config) {
			// Fallback for unknown statuses
			logger.warn(
				`[StatusBadge] Unknown status "${props.status}" for entity type "${props.entityType}"`,
			);
			return (
				<span
					className={`inline-flex items-center font-medium rounded-full ${SIZE_CLASSES[size]} ${BADGE_VARIANT_CLASSES.default} ${className}`}
				>
					{props.status}
				</span>
			);
		}

		return (
			<span
				className={`inline-flex items-center font-medium rounded-full ${SIZE_CLASSES[size]} ${config.className} ${className}`}
			>
				{config.label}
			</span>
		);
	}

	// Legacy API - collaboration statuses only
	const statusKey = props.status.toLowerCase();
	const statusColorClass =
		Features.Common.STATUS_COLORS[
			statusKey as keyof typeof Features.Common.STATUS_COLORS
		] || Features.Common.STATUS_COLORS.neutral;

	// Extract label (capitalize first letter)
	const label = props.status.charAt(0).toUpperCase() + props.status.slice(1);

	return (
		<span
			className={`inline-flex items-center rounded-full font-medium border ${statusColorClass} ${SIZE_CLASSES[size]} ${className}`}
		>
			{label}
		</span>
	);
};

/**
 * Standalone badge component for custom use cases
 * @example
 * ```tsx
 * <Badge variant="success">En ligne</Badge>
 * ```
 */
interface BadgeProps {
	variant?: BadgeVariant;
	children: React.ReactNode;
	className?: string;
	size?: 'sm' | 'md' | 'lg';
}

export const Badge: React.FC<BadgeProps> = ({
	variant = 'default',
	children,
	className = '',
	size = 'md',
}) => {
	return (
		<span
			className={`inline-flex items-center font-medium rounded-full ${SIZE_CLASSES[size]} ${BADGE_VARIANT_CLASSES[variant]} ${className}`}
		>
			{children}
		</span>
	);
};
