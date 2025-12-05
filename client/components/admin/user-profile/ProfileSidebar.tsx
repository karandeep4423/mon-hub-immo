'use client';

import React from 'react';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { ProfileAvatar } from '@/components/ui/ProfileAvatar';
import {
	CheckCircle2,
	Phone,
	ShieldX,
	Trash2,
	XCircle,
	LucideIcon,
	Calendar,
} from 'lucide-react';
import { UserProfile, KnownUserType, ConfirmAction } from './types';

// Stat Box for sidebar
const StatBox: React.FC<{
	value: number;
	label: string;
	gradient: string;
	textColor: string;
	labelColor: string;
}> = ({ value, label, gradient, textColor, labelColor }) => (
	<div
		className={`${gradient} rounded-lg sm:rounded-xl p-2 sm:p-3 text-center border`}
	>
		<div
			className={`text-lg sm:text-xl md:text-2xl font-bold ${textColor}`}
		>
			{value}
		</div>
		<div
			className={`text-[8px] sm:text-[10px] ${labelColor} uppercase font-bold tracking-wider mt-0.5`}
		>
			{label}
		</div>
	</div>
);

// Action Button for sidebar
const ActionButton: React.FC<{
	onClick: () => void;
	disabled: boolean;
	icon: LucideIcon;
	label: string;
	variant: 'primary' | 'danger' | 'warning' | 'ghost';
}> = ({ onClick, disabled, icon: Icon, label, variant }) => {
	const variantClasses = {
		primary:
			'text-white bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-sm hover:shadow-md',
		danger: 'text-red-600 bg-red-50 hover:bg-red-100 border border-red-100 hover:border-red-200',
		warning:
			'text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 hover:border-amber-300',
		ghost: 'bg-sky-300 text-gray-500 hover:text-red-600 hover:bg-red-50',
	};

	return (
		<button
			onClick={onClick}
			disabled={disabled}
			className={`w-full flex items-center justify-center sm:justify-start gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 disabled:opacity-50 ${variantClasses[variant]}`}
		>
			<Icon size={16} className="sm:w-[18px] sm:h-[18px]" />
			<span>{label}</span>
		</button>
	);
};

interface ProfileSidebarProps {
	user: UserProfile;
	form: UserProfile;
	userType: KnownUserType;
	fullName: string;
	isLoading: boolean;
	setPendingAction: (action: ConfirmAction) => void;
}

export function ProfileSidebar({
	user,
	form,
	userType,
	fullName,
	isLoading,
	setPendingAction,
}: ProfileSidebarProps) {
	return (
		<div className="lg:col-span-4 xl:col-span-3">
			<Card className="overflow-hidden shadow-xl border-0 bg-white rounded-xl sm:rounded-2xl">
				{/* Header gradient with pattern */}
				<div className="relative h-20 sm:h-24 md:h-28 bg-cyan-300">
					<div className="absolute inset-0 bg-[url('/patterns/grid.svg')] opacity-10" />
					<div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
				</div>

				{/* Avatar & Info */}
				<div className="px-3 sm:px-4 md:px-5 pb-4 sm:pb-5 flex flex-col items-center text-center -mt-10 sm:-mt-12 md:-mt-14 relative">
					<div className="relative">
						<div className="bg-white rounded-full shadow-xl ring-1 sm:ring-1 ring-white">
							<ProfileAvatar
								user={{
									_id: user._id,
									firstName: form.firstName || '',
									lastName: form.lastName || '',
									profileImage:
										form.profileImage ?? undefined,
									email: form.email || '',
									phone: form.phone ?? '',
									userType: userType,
									isEmailVerified: !!form.isValidated,
									profileCompleted: false,
								}}
								size="2xl"
								className="w-16 h-16 sm:w-18 sm:h-18 md:w-20 md:h-20"
							/>
						</div>
					</div>

					<div className="mt-3 sm:mt-4 w-full space-y-0.5 sm:space-y-1">
						<h3 className="text-base sm:text-lg font-bold text-gray-900 truncate leading-tight">
							{fullName}
						</h3>
						<p className="text-xs sm:text-sm text-gray-500 truncate font-medium px-2">
							{form.email}
						</p>
						{form.phone && (
							<p className="text-[10px] sm:text-xs text-gray-400 flex items-center justify-center gap-1 sm:gap-1.5">
								<Phone
									size={10}
									className="text-gray-400 sm:w-[11px] sm:h-[11px]"
								/>
								{form.phone}
							</p>
						)}
					</div>

					{/* Status Badges */}
					<div className="mt-3 sm:mt-4 flex flex-wrap justify-center gap-1 sm:gap-1.5 w-full">
						<Badge
							variant={form.isValidated ? 'success' : 'error'}
							className="px-2 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs font-semibold rounded-full"
						>
							{form.isValidated ? 'Vérifié' : 'Non Vérifié'}
						</Badge>
						<Badge
							variant={form.isBlocked ? 'error' : 'secondary'}
							className="px-2 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs font-semibold rounded-full"
						>
							{form.isBlocked ? 'Bloqué' : 'Actif'}
						</Badge>
						<Badge
							variant="gray"
							className="px-2 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs font-semibold rounded-full capitalize bg-gray-100 text-gray-700"
						>
							{userType}
						</Badge>
					</div>
				</div>

				{/* Stats Section */}
				<div className="px-3 sm:px-4 pb-3 sm:pb-4">
					<h3 className="text-[10px] sm:text-[11px] font-bold text-gray-400 uppercase tracking-wider px-0.5 sm:px-1 mb-2">
						Statistiques
					</h3>
					<div className="grid grid-cols-1 gap-1.5 sm:gap-2">
						<StatBox
							value={user.propertiesCount ?? 0}
							label="Annonces"
							gradient="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100/50"
							textColor="text-blue-600"
							labelColor="text-blue-600/70"
						/>
						<StatBox
							value={user.searchAdsCount ?? 0}
							label="Recherches"
							gradient="bg-gradient-to-br from-purple-50 to-violet-50 border-purple-100/50"
							textColor="text-purple-600"
							labelColor="text-purple-600/70"
						/>
						<StatBox
							value={user.collaborationsTotal ?? 0}
							label="Collaborations"
							gradient="bg-gradient-to-br from-cyan-50 to-sky-50 border-cyan-100/50"
							textColor="text-cyan-600"
							labelColor="text-cyan-600/70"
						/>
						<StatBox
							value={user.messagesCount ?? 0}
							label="Messages"
							gradient="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-100/50"
							textColor="text-amber-600"
							labelColor="text-amber-600/70"
						/>
					</div>

					{/* Collaboration breakdown */}
					<div className="mt-2 grid grid-cols-3 gap-1 sm:gap-1.5">
						<div className="bg-emerald-50 rounded-lg p-1.5 sm:p-2 text-center border border-emerald-100/50">
							<div className="text-sm sm:text-base font-bold text-emerald-600">
								{user.collaborationsActive ?? 0}
							</div>
							<div className="text-[7px] sm:text-[8px] text-emerald-600/70 uppercase font-semibold">
								Actives
							</div>
						</div>
						<div className="bg-amber-50 rounded-lg p-1.5 sm:p-2 text-center border border-amber-100/50">
							<div className="text-sm sm:text-base font-bold text-amber-600">
								{user.collaborationsPending ?? 0}
							</div>
							<div className="text-[7px] sm:text-[8px] text-amber-600/70 uppercase font-semibold">
								En attente
							</div>
						</div>
						<div className="bg-gray-50 rounded-lg p-1.5 sm:p-2 text-center border border-gray-200/50">
							<div className="text-sm sm:text-base font-bold text-gray-600">
								{user.collaborationsClosed ?? 0}
							</div>
							<div className="text-[7px] sm:text-[8px] text-gray-500 uppercase font-semibold">
								Clôturées
							</div>
						</div>
					</div>

					{/* Activity info */}
					<div className="mt-3">
						<div className="flex items-center gap-2 text-xs text-gray-500">
							<Calendar size={12} className="text-gray-400" />
							<span>
								Membre depuis{' '}
								{user.memberSince || user.createdAt
									? new Date(
											(user.memberSince ||
												user.createdAt) as string,
										).toLocaleDateString('fr-FR', {
											day: '2-digit',
											month: 'short',
											year: 'numeric',
										})
									: '-'}
							</span>
						</div>
					</div>
				</div>

				{/* Divider */}
				<div className="mx-3 sm:mx-4 border-t border-gray-100" />

				{/* Admin Actions */}
				<div className="p-3 sm:p-4 space-y-2 sm:space-y-3">
					<h3 className="text-[10px] sm:text-[11px] font-bold text-gray-400 uppercase tracking-wider px-0.5 sm:px-1">
						Actions Rapides
					</h3>
					<div className="space-y-1.5 sm:space-y-2">
						{form.isValidated ? (
							<ActionButton
								onClick={() => setPendingAction('invalidate')}
								disabled={isLoading}
								icon={XCircle}
								label="Retirer validation"
								variant="danger"
							/>
						) : (
							<ActionButton
								onClick={() => setPendingAction('validate')}
								disabled={isLoading}
								icon={CheckCircle2}
								label="Valider utilisateur"
								variant="primary"
							/>
						)}

						{form.isBlocked ? (
							<ActionButton
								onClick={() => setPendingAction('unblock')}
								disabled={isLoading}
								icon={CheckCircle2}
								label="Débloquer"
								variant="primary"
							/>
						) : (
							<ActionButton
								onClick={() => setPendingAction('block')}
								disabled={isLoading}
								icon={ShieldX}
								label="Bloquer"
								variant="warning"
							/>
						)}

						<ActionButton
							onClick={() => setPendingAction('delete')}
							disabled={isLoading}
							icon={Trash2}
							label="Supprimer"
							variant="ghost"
						/>
					</div>
				</div>
			</Card>
		</div>
	);
}
