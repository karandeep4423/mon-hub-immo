import React, { useState, useRef, useEffect } from 'react';
import { PROPERTY_BADGES, getBadgeConfig } from '@/lib/constants/badges';

interface BadgeSelectorProps {
	selectedBadges: string[];
	onChange: (badges: string[]) => void;
	disabled?: boolean;
}

const BadgeSelector: React.FC<BadgeSelectorProps> = ({
	selectedBadges,
	onChange,
	disabled = false,
}) => {
	const [isOpen, setIsOpen] = useState(false);
	const dropdownRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				dropdownRef.current &&
				!dropdownRef.current.contains(event.target as Node)
			) {
				setIsOpen(false);
			}
		};

		document.addEventListener('mousedown', handleClickOutside);
		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, []);

	const toggleBadge = (badgeValue: string) => {
		if (selectedBadges.includes(badgeValue)) {
			onChange(selectedBadges.filter((b) => b !== badgeValue));
		} else {
			onChange([...selectedBadges, badgeValue]);
		}
	};

	const removeBadge = (badgeValue: string) => {
		onChange(selectedBadges.filter((b) => b !== badgeValue));
	};

	return (
		<div className="space-y-2">
			<label className="block text-sm font-medium text-gray-700">
				Badges du bien
			</label>

			{/* Selected Badges Display */}
			{selectedBadges.length > 0 && (
				<div className="flex flex-wrap gap-2 mb-2">
					{selectedBadges.map((badgeValue) => {
						const config = getBadgeConfig(badgeValue);
						if (!config) return null;

						return (
							<span
								key={badgeValue}
								className={`${config.bgColor} ${config.color} text-xs px-3 py-1 rounded-full flex items-center gap-2`}
							>
								{config.label}
								<button
									type="button"
									onClick={() => removeBadge(badgeValue)}
									className="hover:opacity-75"
									disabled={disabled}
								>
									×
								</button>
							</span>
						);
					})}
				</div>
			)}

			{/* Dropdown */}
			<div className="relative" ref={dropdownRef}>
				<button
					type="button"
					onClick={() => setIsOpen(!isOpen)}
					disabled={disabled}
					className="w-full px-4 py-2 text-left bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-brand-600 disabled:bg-gray-100 disabled:cursor-not-allowed"
				>
					<span className="text-gray-700">
						{selectedBadges.length > 0
							? `${selectedBadges.length} badge(s) sélectionné(s)`
							: 'Sélectionner des badges'}
					</span>
					<span className="absolute right-3 top-3">
						{isOpen ? '▲' : '▼'}
					</span>
				</button>

				{/* Dropdown Menu */}
				{isOpen && (
					<div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
						{PROPERTY_BADGES.map((badge) => {
							const isSelected = selectedBadges.includes(
								badge.value,
							);

							return (
								<div
									key={badge.value}
									onClick={() => toggleBadge(badge.value)}
									className={`px-4 py-2 cursor-pointer hover:bg-gray-100 flex items-center justify-between ${
										isSelected ? 'bg-gray-50' : ''
									}`}
								>
									<span
										className={`${badge.bgColor} ${badge.color} text-xs px-3 py-1 rounded-full`}
									>
										{badge.label}
									</span>
									{isSelected && (
										<span className="text-brand-600 font-bold">
											✓
										</span>
									)}
								</div>
							);
						})}
					</div>
				)}
			</div>

			<p className="text-xs text-gray-500">
				Sélectionnez un ou plusieurs badges pour mettre en avant votre
				bien
			</p>
		</div>
	);
};

export default BadgeSelector;
