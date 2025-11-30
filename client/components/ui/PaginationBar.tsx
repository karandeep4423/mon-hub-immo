"use client";

import React from 'react';
import { Button } from './Button';

interface PaginationBarProps {
	page: number;
	totalPages: number;
	loading?: boolean;
	onPrev: () => void;
	onNext: () => void;
}

export const PaginationBar: React.FC<PaginationBarProps> = ({ page, totalPages, loading, onPrev, onNext }) => {
	return (
		<div className="flex justify-center items-center gap-4 mt-6">
			<Button onClick={onPrev} disabled={page <= 1 || !!loading} variant="secondary">Précédent</Button>
			<span className="text-gray-700 font-medium">Page {page} sur {Math.max(1, totalPages)}</span>
			<Button onClick={onNext} disabled={page >= Math.max(1, totalPages) || !!loading} variant="secondary">Suivant</Button>
		</div>
	);
};

export default PaginationBar;
