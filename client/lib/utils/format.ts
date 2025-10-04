export const formatEuro = (value: number): string => {
	if (!Number.isFinite(value)) return '€0';
	return new Intl.NumberFormat('fr-FR', {
		style: 'currency',
		currency: 'EUR',
		maximumFractionDigits: 0,
	}).format(value);
};

export const formatNumber = (value: number): string => {
	return new Intl.NumberFormat('fr-FR').format(value || 0);
};
