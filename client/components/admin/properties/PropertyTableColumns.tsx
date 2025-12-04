import React from 'react';
import { Badge } from '@/components/ui/Badge';
import { BarChart2 } from 'lucide-react';
import type { AdminProperty } from '@/types/admin';
import {
	getPropertyTypeLabel,
	getStatusBadgeVariant,
} from '@/lib/utils/adminUtils';

type ColumnDef = {
	header: string;
	accessor: string;
	width?: string;
	render?: (value: unknown, row: AdminProperty) => React.ReactNode;
};

export const getPropertyTableColumns = (): ColumnDef[] => [
	{
		header: 'Annonce',
		accessor: 'title',
		width: '30%',
		render: (_: unknown, row: AdminProperty) => (
			<div className="min-w-0">
				<p className="font-semibold text-gray-900 text-sm truncate">
					{row.title}
				</p>
				<p className="text-xs text-gray-500 truncate mt-0.5">
					{row.location || row.city}
				</p>
			</div>
		),
	},
	{
		header: 'Type',
		accessor: 'type',
		width: '12%',
		render: (value: unknown, row: AdminProperty) => (
			<Badge variant="info" size="sm" className="shadow-sm">
				{getPropertyTypeLabel(
					((value as string) || row.propertyType) ?? '',
				)}
			</Badge>
		),
	},
	{
		header: 'Prix',
		accessor: 'price',
		width: '12%',
		render: (value: unknown) => (
			<div className="flex items-center gap-1.5">
				<div className="px-2 py-1 rounded-lg bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200/50">
					<span className="font-bold text-sm bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
						€{(Number(value || 0) / 1000).toFixed(0)}k
					</span>
				</div>
			</div>
		),
	},
	{
		header: 'Vues',
		accessor: 'views',
		width: '10%',
		render: (value: unknown) => (
			<div className="flex items-center justify-center gap-1 px-2 py-1 rounded-lg bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200/50 w-fit">
				<BarChart2 className="w-3.5 h-3.5 text-purple-600" />
				<span className="text-xs font-semibold text-purple-700">
					{Number(value) || 0}
				</span>
			</div>
		),
	},
	{
		header: 'Statut',
		accessor: 'status',
		width: '13%',
		render: (value: unknown) => {
			const status = String(value || '');
			return (
				<div className="flex justify-center">
					<Badge
						variant={getStatusBadgeVariant(status)}
						size="sm"
						className="shadow-sm"
					>
						{status.charAt(0).toUpperCase() + status.slice(1)}
					</Badge>
				</div>
			);
		},
	},
	{
		header: 'Créée',
		accessor: 'createdAt',
		width: '13%',
		render: (value: unknown) => (
			<span className="text-xs text-gray-600 hidden sm:inline">
				{new Date(String(value)).toLocaleDateString('fr-FR')}
			</span>
		),
	},
];
