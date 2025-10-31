'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import ChatPage from '../../components/chat/ChatPage';
import { useChat } from '../../hooks/useChat';
import { api } from '@/lib/api';
import type { Property } from '@/lib/api/propertyApi';
import { SearchAd } from '@/types/searchAd';
import searchAdApi from '@/lib/api/searchAdApi';
import { logger } from '@/lib/utils/logger';

export const ChatPageContent = () => {
	const searchParams = useSearchParams();
	const { users, getUsers, getUserById, setSelectedUser, selectedUser } =
		useChat();
	const [isInitialized, setIsInitialized] = useState(false);
	const [isLoadingContact, setIsLoadingContact] = useState(false);
	const [propertyContext, setPropertyContext] = useState<{
		userId: string;
		propertyId: string;
		propertyDetails?: Property;
		collaborationType?: string;
	} | null>(null);
	const [searchAdContext, setSearchAdContext] = useState<{
		userId: string;
		searchAdId: string;
		searchAdDetails?: SearchAd;
	} | null>(null);

	const userId = searchParams?.get('userId');
	logger.debug('[ChatPageContent] userId from URL', userId);
	const propertyId = searchParams?.get('propertyId');
	const collaborationType = searchParams?.get('type');
	const searchAdId = searchParams?.get('searchAdId');

	useEffect(() => {
		// Initialize users list
		getUsers();
	}, [getUsers]);

	useEffect(() => {
		// Auto-select user if userId is provided in URL
		if (userId && !isInitialized && !isLoadingContact) {
			const initializeChat = async () => {
				setIsLoadingContact(true);

				// First check if user is already in the existing conversations
				const existingUser = users.find((user) => user._id === userId);

				if (existingUser) {
					logger.debug(
						'[ChatPageContent] Found user in existing conversations',
						existingUser,
					);
					setSelectedUser(existingUser);
					setIsInitialized(true);
				} else {
					// If not found in existing conversations, fetch user by ID
					logger.debug(
						'[ChatPageContent] User not in conversations, fetching by ID',
						userId,
					);
					const fetchedUser = await getUserById(userId);

					if (fetchedUser) {
						logger.debug(
							'[ChatPageContent] Fetched user for new conversation',
							fetchedUser,
						);
						setSelectedUser(fetchedUser);
						setIsInitialized(true);
					} else {
						logger.error(
							'[ChatPageContent] Failed to fetch user by ID',
							userId,
						);
					}
				}

				// If this conversation was initiated from a property page, store the context
				if (propertyId && userId) {
					try {
						const { data } = await api.get(
							`/property/${propertyId}`,
						);
						setPropertyContext({
							userId,
							propertyId,
							propertyDetails: data.data,
							collaborationType: collaborationType || undefined,
						});
						logger.debug(
							'[ChatPageContent] Property context set',
							data.data.title,
						);
					} catch (error) {
						logger.error(
							'[ChatPageContent] Failed to fetch property details',
							error,
						);
						// Set context without property details
						setPropertyContext({
							userId,
							propertyId,
							collaborationType: collaborationType || undefined,
						});
					}
				}

				// If this conversation was initiated from a search ad, store the context
				if (searchAdId && userId) {
					try {
						const adDetails =
							await searchAdApi.getSearchAdById(searchAdId);
						setSearchAdContext({
							userId,
							searchAdId,
							searchAdDetails: adDetails,
						});
						logger.debug(
							'[ChatPageContent] Search ad context set',
							adDetails.title,
						);
					} catch (error) {
						logger.error(
							'[ChatPageContent] Failed to fetch search ad details',
							error,
						);
						setSearchAdContext({
							userId,
							searchAdId,
						});
					}
				}

				setIsLoadingContact(false);
			};

			initializeChat();
		}
	}, [
		userId,
		users,
		getUserById,
		setSelectedUser,
		isInitialized,
		isLoadingContact,
		propertyId,
		collaborationType,
		searchAdId,
	]);

	// Show property context only for the specific conversation that was initiated from a property page
	const getContextMessage = () => {
		// Only show context if:
		// 1. There's a property context stored
		// 2. The currently selected user matches the context user
		if (
			propertyContext &&
			selectedUser &&
			propertyContext.userId === selectedUser._id
		) {
			const {
				propertyDetails,
				collaborationType: contextCollaborationType,
			} = propertyContext;

			if (contextCollaborationType === 'collaboration') {
				return (
					<div className="bg-brand-50 border border-brand-200 rounded-lg p-4 mb-4">
						<div className="flex items-center space-x-2">
							<svg
								className="w-5 h-5 text-brand-600"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth="2"
									d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
								/>
							</svg>
							<span className="text-sm font-medium text-brand-800">
								Proposition de collaboration
							</span>
						</div>
						<p className="text-sm text-brand-700 mt-1">
							Vous proposez de collaborer sur cette annonce
							immobilière
							{propertyDetails && (
								<span className="block mt-1 font-medium">
									{propertyDetails.title}
								</span>
							)}
						</p>
					</div>
				);
			}

			if (contextCollaborationType === 'contact') {
				return (
					<div className="bg-info-light border border-brand-200 rounded-lg p-4 mb-4">
						<div className="flex items-center space-x-2">
							<svg
								className="w-5 h-5 text-brand"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth="2"
									d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
								/>
							</svg>
							<span className="text-sm font-medium text-brand-800">
								Demande de contact
							</span>
						</div>
						<p className="text-sm text-brand-700 mt-1">
							Vous souhaitez obtenir plus d&apos;informations sur
							cette annonce
							{propertyDetails && (
								<span className="block mt-1 font-medium">
									{propertyDetails.title}
								</span>
							)}
						</p>
					</div>
				);
			}

			// General contact for properties without specific type
			if (propertyDetails) {
				return (
					<div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
						<div className="flex items-center space-x-2">
							<svg
								className="w-5 h-5 text-gray-600"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth="2"
									d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
								/>
							</svg>
							<span className="text-sm font-medium text-gray-800">
								À propos de l&apos;annonce
							</span>
						</div>
						<p className="text-sm text-gray-700 mt-1">
							{propertyDetails.title}
						</p>
					</div>
				);
			}
		}

		if (
			searchAdContext &&
			selectedUser &&
			searchAdContext.userId === selectedUser._id
		) {
			const { searchAdDetails } = searchAdContext;
			return (
				<div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
					<div className="flex items-center space-x-2">
						<svg
							className="w-5 h-5 text-purple-600"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
							xmlns="http://www.w3.org/2000/svg"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth="2"
								d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
							></path>
						</svg>
						<span className="text-sm font-medium text-purple-800">
							Contact concernant une recherche
						</span>
					</div>
					<p className="text-sm text-purple-700 mt-1">
						Vous contactez cet utilisateur à propos de sa recherche
						:
						{searchAdDetails && (
							<span className="block mt-1 font-medium">
								{searchAdDetails.title}
							</span>
						)}
					</p>
				</div>
			);
		}

		return null;
	};

	// Component to display property context information in the chat
	const ContextMessage = getContextMessage();

	return (
		<div className="h-screen flex flex-col">
			<ChatPage contextMessage={ContextMessage} />
		</div>
	);
};
