interface FeatureCardProps {
	icon: React.ReactNode;
	title: string;
	description: string;
	className?: string;
}

export const FeatureCard = ({
	icon,
	title,
	description,
	className = '',
}: FeatureCardProps) => {
	return (
		<div
			className={`border-2 border-[#00b4d8] p-6 rounded shadow ${className}`}
		>
			<div className="flex items-center gap-4 mb-4">
				<div className="w-12 h-12 bg-[#00b4d8] rounded-full flex items-center justify-center flex-shrink-0">
					{icon}
				</div>
				<h3 className="font-bold text-lg">{title}</h3>
			</div>
			<p>{description}</p>
		</div>
	);
};
