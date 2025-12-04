'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, Save } from 'lucide-react';

interface ProfileHeaderProps {
	fullName: string;
	hasChanges: boolean;
	isSaving: boolean;
	onSave: () => void;
}

export function ProfileHeader({
	fullName,
	hasChanges,
	isSaving,
	onSave,
}: ProfileHeaderProps) {
	const router = useRouter();

	return (
		<div className="sticky border rounded-full top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm transition-all duration-200">
			<div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
				<div className="flex items-center justify-between gap-4">
					<div className="flex items-center gap-4 overflow-hidden">
						<Button
							variant="ghost"
							size="sm"
							onClick={() => router.back()}
							className="p-1 h-10 w-16 rounded-full bg-cyan-200 hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition-colors"
						>
							<ArrowLeft size={20} />
						</Button>
						<div className="flex flex-col">
							<div className="flex items-center gap-2 text-xs text-gray-500 font-medium uppercase tracking-wider">
								<span className="hidden sm:inline">
									Administration
								</span>
								<span className="hidden sm:inline">/</span>
								<span>Utilisateurs</span>
							</div>
							<h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate flex items-center gap-2">
								{fullName}
								{hasChanges && (
									<span className="inline-flex h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
								)}
							</h1>
						</div>
					</div>
					<div className="flex items-center gap-3">
						{hasChanges && (
							<span className="text-xs text-amber-600 font-medium hidden sm:inline-block animate-fade-in">
								Modifications non enregistrées
							</span>
						)}
						<Button
							variant={hasChanges ? 'primary' : 'outline'}
							size="sm"
							onClick={onSave}
							disabled={isSaving || !hasChanges}
							className={`flex items-center gap-2 shadow-sm transition-all duration-200 ${
								hasChanges
									? 'hover:shadow-md hover:scale-105'
									: ''
							}`}
						>
							<Save size={18} />
							<span className="hidden sm:inline font-medium">
								{isSaving ? 'Enregistrement...' : 'Enregistrer'}
							</span>
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}
