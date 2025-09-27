import React from 'react';

type IconProps = { className?: string };

const base = 'w-7 h-7';

export const PdfIcon: React.FC<IconProps> = ({ className = '' }) => (
	<svg viewBox="0 0 24 24" className={`${base} ${className}`} aria-hidden>
		<rect
			x="3"
			y="3"
			width="18"
			height="18"
			rx="3"
			className="fill-red-600"
		/>
		<text
			x="50%"
			y="60%"
			textAnchor="middle"
			className="fill-white font-bold text-[9px]"
		>
			PDF
		</text>
	</svg>
);

export const WordIcon: React.FC<IconProps> = ({ className = '' }) => (
	<svg viewBox="0 0 24 24" className={`${base} ${className}`} aria-hidden>
		<rect
			x="3"
			y="3"
			width="18"
			height="18"
			rx="3"
			className="fill-blue-600"
		/>
		<text
			x="50%"
			y="60%"
			textAnchor="middle"
			className="fill-white font-bold text-[9px]"
		>
			DOC
		</text>
	</svg>
);

export const ExcelIcon: React.FC<IconProps> = ({ className = '' }) => (
	<svg viewBox="0 0 24 24" className={`${base} ${className}`} aria-hidden>
		<rect
			x="3"
			y="3"
			width="18"
			height="18"
			rx="3"
			className="fill-green-600"
		/>
		<text
			x="50%"
			y="60%"
			textAnchor="middle"
			className="fill-white font-bold text-[9px]"
		>
			XLS
		</text>
	</svg>
);

export const PptIcon: React.FC<IconProps> = ({ className = '' }) => (
	<svg viewBox="0 0 24 24" className={`${base} ${className}`} aria-hidden>
		<rect
			x="3"
			y="3"
			width="18"
			height="18"
			rx="3"
			className="fill-orange-600"
		/>
		<text
			x="50%"
			y="60%"
			textAnchor="middle"
			className="fill-white font-bold text-[9px]"
		>
			PPT
		</text>
	</svg>
);

export const CsvIcon: React.FC<IconProps> = ({ className = '' }) => (
	<svg viewBox="0 0 24 24" className={`${base} ${className}`} aria-hidden>
		<rect
			x="3"
			y="3"
			width="18"
			height="18"
			rx="3"
			className="fill-emerald-600"
		/>
		<text
			x="50%"
			y="60%"
			textAnchor="middle"
			className="fill-white font-bold text-[9px]"
		>
			CSV
		</text>
	</svg>
);

export const FileIcon: React.FC<IconProps> = ({ className = '' }) => (
	<svg viewBox="0 0 24 24" className={`${base} ${className}`} aria-hidden>
		<rect
			x="3"
			y="3"
			width="18"
			height="18"
			rx="3"
			className="fill-gray-600"
		/>
		<text
			x="50%"
			y="60%"
			textAnchor="middle"
			className="fill-white font-bold text-[9px]"
		>
			FILE
		</text>
	</svg>
);

export const getIconForMime = (mime: string): React.FC<IconProps> => {
	const m = mime.toLowerCase();
	if (m.includes('pdf')) return PdfIcon;
	if (m.includes('presentation')) return PptIcon;
	if (m.includes('powerpoint')) return PptIcon;
	if (m.includes('sheet') || m.includes('excel') || m.includes('csv'))
		return ExcelIcon;
	if (
		m.includes('word') ||
		m.includes('msword') ||
		m.includes('officedocument')
	)
		return WordIcon;
	return FileIcon;
};
