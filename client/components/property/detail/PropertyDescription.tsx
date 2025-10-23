interface PropertyDescriptionProps {
	description: string;
}

export const PropertyDescription = ({
	description,
}: PropertyDescriptionProps) => {
	return (
		<div className="mt-6 bg-white rounded-lg shadow-lg p-6">
			<h2 className="text-xl font-semibold text-gray-900 mb-4">
				Description
			</h2>
			<p className="text-gray-700 leading-relaxed whitespace-pre-line">
				{description}
			</p>
		</div>
	);
};
