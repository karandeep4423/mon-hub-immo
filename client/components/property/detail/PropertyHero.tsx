import { useState } from 'react';
import { getBadgeConfig } from '@/lib/constants/badges';
import { getImageUrl } from '@/lib/utils/imageUtils';

interface PropertyHeroProps {
	allImages: (string | { url: string; key: string })[];
	title: string;
	badges?: string[];
	onImageClick: (index: number) => void;
}

export const PropertyHero = ({
	allImages,
	title,
	badges = [],
	onImageClick,
}: PropertyHeroProps) => {
	const [currentImageIndex, setCurrentImageIndex] = useState(0);

	// Helper function to get image URL
	const getImageSrc = (image: string | { url: string; key: string }) => {
		return typeof image === 'string' ? image : image.url;
	};

	return (
		<div className="bg-white rounded-lg shadow-lg overflow-hidden">
			{/* Main Image */}
			<div className="relative h-96 bg-gray-200">
				<img
					src={getImageSrc(allImages[currentImageIndex])}
					alt={title}
					className="w-full h-full object-cover cursor-pointer"
					onClick={() => onImageClick(currentImageIndex)}
					onError={(e) => {
						(e.target as HTMLImageElement).src = getImageUrl(
							undefined,
							'medium',
						);
					}}
				/>

				{/* Badges */}
				<div className="absolute top-4 left-4 flex flex-wrap gap-2 max-w-[70%]">
					{badges &&
						badges.length > 0 &&
						badges.map((badgeValue) => {
							const config = getBadgeConfig(badgeValue);
							if (!config) return null;

							return (
								<span
									key={badgeValue}
									className={`${config.bgColor} ${config.color} text-sm px-3 py-1 rounded-full`}
								>
									{config.label}
								</span>
							);
						})}
				</div>

				{/* Navigation arrows */}
				{allImages.length > 1 && (
					<>
						<button
							onClick={() =>
								setCurrentImageIndex((prev) =>
									prev === 0
										? allImages.length - 1
										: prev - 1,
								)
							}
							className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75"
						>
							<svg
								className="w-6 h-6"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth="2"
									d="M15 19l-7-7 7-7"
								/>
							</svg>
						</button>
						<button
							onClick={() =>
								setCurrentImageIndex((prev) =>
									prev === allImages.length - 1
										? 0
										: prev + 1,
								)
							}
							className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75"
						>
							<svg
								className="w-6 h-6"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth="2"
									d="M9 5l7 7-7 7"
								/>
							</svg>
						</button>
					</>
				)}
			</div>

			{/* Thumbnail Images */}
			{allImages.length > 1 && (
				<div className="p-4">
					<div className="flex space-x-2 overflow-x-auto">
						{allImages.map((image, index) => (
							<button
								key={index}
								onClick={() => {
									setCurrentImageIndex(index);
								}}
								onDoubleClick={() => onImageClick(index)}
								className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
									currentImageIndex === index
										? 'border-brand-600'
										: 'border-gray-200'
								} hover:border-brand-400 transition-colors`}
							>
								<img
									src={getImageSrc(image)}
									alt={`Image ${index + 1}`}
									className="w-full h-full object-cover"
								/>
							</button>
						))}
					</div>
				</div>
			)}
		</div>
	);
};
