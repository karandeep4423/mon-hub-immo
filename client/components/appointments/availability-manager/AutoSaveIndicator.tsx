import { LoadingSpinner } from '@/components/ui';

interface AutoSaveIndicatorProps {
	saving: boolean;
	hasUnsavedChanges: boolean;
}

export const AutoSaveIndicator = ({
	saving,
	hasUnsavedChanges,
}: AutoSaveIndicatorProps) => {
	if (saving) {
		return (
			<div className="flex items-center gap-2 text-cyan-600 bg-cyan-50 px-4 py-2 rounded-lg">
				<LoadingSpinner size="sm" />
				<span className="text-sm font-medium">Enregistrement...</span>
			</div>
		);
	}

	if (hasUnsavedChanges) {
		return (
			<div className="flex items-center gap-2 text-amber-600 bg-amber-50 px-4 py-2 rounded-lg">
				<svg
					className="w-5 h-5 animate-pulse"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
					/>
				</svg>
				<span className="text-sm font-medium">
					Modification en attente...
				</span>
			</div>
		);
	}

	return (
		<div className="flex items-center gap-2 text-green-600 bg-green-50 px-4 py-2 rounded-lg">
			<svg
				className="w-5 h-5"
				fill="none"
				stroke="currentColor"
				viewBox="0 0 24 24"
			>
				<path
					strokeLinecap="round"
					strokeLinejoin="round"
					strokeWidth={2}
					d="M5 13l4 4L19 7"
				/>
			</svg>
			<span className="text-sm font-medium">Tout est enregistré</span>
		</div>
	);
};
