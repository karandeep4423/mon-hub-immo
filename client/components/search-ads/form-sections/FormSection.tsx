interface FormSectionProps {
	title: string;
	emoji?: string;
	children: React.ReactNode;
}

export const FormSection: React.FC<FormSectionProps> = ({
	title,
	emoji,
	children,
}) => {
	return (
		<div className="bg-white p-6 rounded-2xl shadow-md border  border-gray-100 hover:shadow-card-hover transition-all duration-300 ">
			<h3 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
				{emoji && (
					<span className="text-2xl bg-gradient-to-br from-brand/10 to-brand/5 p-2 rounded-xl">
						{emoji}
					</span>
				)}
				<span className="bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
					{title}
				</span>
			</h3>
			{children}
		</div>
	);
};
