import { FormSection } from './FormSection';
import { Features } from '@/lib/constants';

interface BasicInfoSectionProps {
	title: string;
	description: string;
	onTitleChange: (value: string) => void;
	onDescriptionChange: (value: string) => void;
	errors?: Record<string, string>;
}

export const BasicInfoSection: React.FC<BasicInfoSectionProps> = ({
	title,
	description,
	onTitleChange,
	onDescriptionChange,
	errors = {},
}) => {
	return (
		<FormSection
			title={Features.SearchAds.SEARCH_AD_FORM_SECTIONS.BASIC_INFO}
			emoji="📋"
		>
			<div className="space-y-4">
				<div>
					<label
						htmlFor="title"
						className="block text-sm font-medium text-gray-700"
					>
						Titre de l&apos;annonce *
					</label>
					<input
						id="title"
						name="title"
						type="text"
						value={title}
						onChange={(e) => onTitleChange(e.target.value)}
						className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-brand-600 focus:border-brand-600 ${
							errors.title
								? 'border-red-500 focus:ring-red-500 focus:border-red-500'
								: 'border-gray-300'
						}`}
						placeholder="Recherche appartement familial à Paris"
					/>
					{errors.title && (
						<p className="mt-1 text-sm text-red-600">
							{errors.title}
						</p>
					)}
				</div>

				<div>
					<label
						htmlFor="description"
						className="block text-sm font-medium text-gray-700"
					>
						Description de la recherche *
					</label>
					<textarea
						id="description"
						name="description"
						rows={4}
						value={description}
						onChange={(e) => onDescriptionChange(e.target.value)}
						className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-brand-600 focus:border-brand-600 ${
							errors.description
								? 'border-red-500 focus:ring-red-500 focus:border-red-500'
								: 'border-gray-300'
						}`}
						placeholder="Décrivez les besoins spécifiques de votre client..."
					/>
					{errors.description && (
						<p className="mt-1 text-sm text-red-600">
							{errors.description}
						</p>
					)}
				</div>
			</div>
		</FormSection>
	);
};
