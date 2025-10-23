import { FormSection } from './FormSection';

interface BasicInfoSectionProps {
	title: string;
	description: string;
	onTitleChange: (value: string) => void;
	onDescriptionChange: (value: string) => void;
}

export const BasicInfoSection: React.FC<BasicInfoSectionProps> = ({
	title,
	description,
	onTitleChange,
	onDescriptionChange,
}) => {
	return (
		<FormSection title="Informations générales" emoji="📋">
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
						className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-600 focus:border-brand-600"
						placeholder="Recherche appartement familial à Paris"
					/>
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
						className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-600 focus:border-brand-600"
						placeholder="Décrivez les besoins spécifiques de votre client..."
					/>
				</div>
			</div>
		</FormSection>
	);
};
