'use client';

import React, { useState } from 'react';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { User, Briefcase, Files, Settings } from 'lucide-react';

import {
	UserProfileEditableProps,
	KnownUserType,
	TabId,
	TABS,
} from './user-profile';

import { ProfileHeader } from './user-profile/ProfileHeader';
import { ProfileSidebar } from './user-profile/ProfileSidebar';
import {
	PersonalTab,
	ProfessionalTab,
	DocumentsTab,
	AccountTab,
} from './user-profile/tabs';
import {
	useUserProfileForm,
	useUserProfileActions,
} from './user-profile/hooks';

export function UserProfileEditable({
	user,
	onUpdate,
	onDelete,
}: UserProfileEditableProps) {
	const [activeTab, setActiveTab] = useState<TabId>('personal');

	// Form state and handlers
	const {
		form,
		setForm,
		hasChanges,
		isSaving,
		handleChange,
		handleProfessionalChange,
		handleSave,
	} = useUserProfileForm(user, onUpdate);

	const fullName =
		`${form.firstName || ''} ${form.lastName || ''}`.trim() ||
		'Utilisateur';
	const userType = (form.type ||
		form.userType ||
		'apporteur') as KnownUserType;
	const isAgent = userType === 'agent';

	// Admin action handlers
	const {
		pendingAction,
		setPendingAction,
		isLoading,
		getActionDetails,
		handleConfirmAction,
	} = useUserProfileActions(
		user,
		form,
		setForm,
		onUpdate,
		onDelete,
		fullName,
	);

	// Tab icon mapping
	const tabIcons: Record<TabId, typeof User> = {
		personal: User,
		professional: Briefcase,
		documents: Files,
		account: Settings,
	};

	// Filter tabs based on user type - apporteurs don't have professional/documents info
	const visibleTabs = isAgent
		? TABS
		: TABS.filter(
				(tab) => tab.id !== 'professional' && tab.id !== 'documents',
			);

	return (
		<div className="min-h-screen bg-gray-50/50 pb-12">
			{/* Fixed Header */}
			<ProfileHeader
				fullName={fullName}
				hasChanges={hasChanges}
				isSaving={isSaving}
				onSave={handleSave}
			/>

			<div className="container mx-auto p-3 sm:p-4 md:p-6 lg:p-8 max-w-7xl">
				<div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 lg:gap-8">
					{/* Left Sidebar - Profile & Actions */}
					<ProfileSidebar
						user={user}
						form={form}
						userType={userType}
						fullName={fullName}
						isLoading={isLoading}
						setPendingAction={setPendingAction}
					/>

					{/* Right Content - Tabs & Forms */}
					<div className="lg:col-span-8 xl:col-span-9 space-y-6">
						{/* Tabs Navigation */}
						<div className="bg-gray-100/80 backdrop-blur-sm p-1.5 rounded-xl flex overflow-x-auto no-scrollbar sticky top-[88px] z-40 shadow-inner gap-1">
							{visibleTabs.map((tab) => {
								const TabIcon = tabIcons[tab.id];
								return (
									<button
										key={tab.id}
										onClick={() => setActiveTab(tab.id)}
										className={`flex items-center px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap flex-1 justify-center outline-none focus:ring-2 focus:ring-primary-500/20 ${
											activeTab === tab.id
												? 'bg-white text-primary-700 shadow-sm ring-1 ring-black/5 transform scale-[1.02]'
												: 'text-gray-500 hover:bg-white/60 hover:text-gray-700'
										}`}
									>
										<span
											className={`mr-2 transition-colors ${
												activeTab === tab.id
													? 'text-primary-600'
													: 'text-gray-400'
											}`}
										>
											<TabIcon size={16} />
										</span>
										{tab.label}
									</button>
								);
							})}
						</div>

						{/* Tab Content */}
						<div className="space-y-6">
							{activeTab === 'personal' && (
								<PersonalTab
									form={form}
									handleChange={handleChange}
								/>
							)}

							{activeTab === 'professional' && isAgent && (
								<ProfessionalTab
									form={form}
									handleProfessionalChange={
										handleProfessionalChange
									}
								/>
							)}

							{activeTab === 'documents' && isAgent && (
								<DocumentsTab form={form} />
							)}

							{activeTab === 'account' && (
								<AccountTab
									form={form}
									user={user}
									isAgent={isAgent}
									isLoading={isLoading}
									setPendingAction={setPendingAction}
								/>
							)}
						</div>
					</div>
				</div>
			</div>

			{/* Confirmation Modal */}
			<ConfirmDialog
				isOpen={pendingAction !== null}
				title={getActionDetails(pendingAction).title}
				description={getActionDetails(pendingAction).description}
				confirmText={getActionDetails(pendingAction).confirmText}
				cancelText="Annuler"
				onConfirm={handleConfirmAction}
				onCancel={() => setPendingAction(null)}
				loading={isLoading}
				variant={getActionDetails(pendingAction).variant}
			/>
		</div>
	);
}
