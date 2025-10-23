import React from 'react';
import { STATUS_COLORS, StatusType } from '../../lib/constants/statusColors';
import {
	getStatusConfig,
	type EntityType,
	BADGE_VARIANT_CLASSES,
	type BadgeVariant,
} from '@/lib/constants/statusConfigs';

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
			console.warn(
				`Unknown status "${props.status}" for entity type "${props.entityType}"`,
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
	const config = STATUS_COLORS[props.status];

	return (
		<span
			className={`inline-flex items-center rounded-full font-medium border ${config.bg} ${config.text} ${config.border} ${SIZE_CLASSES[size]} ${className}`}
		>
			{config.label}
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
