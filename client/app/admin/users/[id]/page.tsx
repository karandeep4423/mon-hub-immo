'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { UserProfileEditable } from '@/components/admin/UserProfileEditable';
import type { UserProfile } from '@/components/admin/user-profile/types';

export default function AdminUserProfilePage() {
	const API_ROOT = (() => {
		const raw = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
		return raw.replace(/\/+$/, '').replace(/\/api$/i, '');
	})();

	const { id } = useParams();
	const router = useRouter();
	const [user, setUser] = useState<UserProfile | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(true);

	const fetchUser = useCallback(() => {
		setLoading(true);
		setError(null);
		fetch(`${API_ROOT}/api/admin/users/${id}`, { credentials: 'include' })
			.then((res) => {
				if (!res.ok) {
					throw new Error('Failed to fetch');
				}
				return res.json();
			})
			.then((data) => {
				if (data.error) {
					setError(String(data.error));
				} else {
					setUser(data);
					// Fetch stats if not present
					if (
						data.propertiesCount == null ||
						data.collaborationsActive == null ||
						data.collaborationsClosed == null
					) {
						fetch(`${API_ROOT}/api/admin/users/${id}/stats`, {
							credentials: 'include',
						})
							.then((r) => (r.ok ? r.json() : null))
							.then((stats) => {
								if (stats) {
									setUser((prev) =>
										prev ? { ...prev, ...stats } : prev,
									);
								}
							})
							.catch(() => void 0);
					}
				}
			})
			.catch(() => {
				setError('Erreur lors du chargement du profil utilisateur.');
			})
			.finally(() => {
				setLoading(false);
			});
	}, [id, API_ROOT]);

	useEffect(() => {
		fetchUser();
	}, [fetchUser]);

	const handleUpdate = (updatedUser: UserProfile) => {
		setUser(updatedUser);
	};

	const handleDelete = () => {
		router.push('/admin/users');
	};

	if (loading) {
		return (
			<div className="bg-gray-50 min-h-screen flex justify-center items-center">
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand"></div>
				<span className="ml-3 text-gray-600">
					Chargement du profil...
				</span>
			</div>
		);
	}

	if (error) {
		return (
			<div className="bg-gray-50 min-h-screen flex flex-col justify-center items-center">
				<p className="text-lg font-medium text-red-500">{error}</p>
				<Link
					href="/admin/users"
					className="mt-4 inline-flex items-center text-brand hover:underline"
				>
					<ArrowLeft className="w-4 h-4 mr-2" />
					Retour à la liste
				</Link>
			</div>
		);
	}

	if (!user) {
		return (
			<div className="bg-gray-50 min-h-screen flex flex-col justify-center items-center">
				<p className="text-lg text-gray-600">
					Utilisateur introuvable.
				</p>
				<Link
					href="/admin/users"
					className="mt-4 inline-flex items-center text-brand hover:underline"
				>
					<ArrowLeft className="w-4 h-4 mr-2" />
					Retour à la liste
				</Link>
			</div>
		);
	}

	return (
		<div className="bg-gray-50 min-h-screen">
			<div className="container mx-auto px-4 py-6">
				{/* Editable Profile */}
				<UserProfileEditable
					user={user}
					onUpdate={handleUpdate}
					onDelete={handleDelete}
				/>
			</div>
		</div>
	);
}
