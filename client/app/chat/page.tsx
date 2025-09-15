'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import ChatPage from '../../components/chat/ChatPage';
import { useChat } from '../../hooks/useChat';

const ChatPageRoute = () => {
	const searchParams = useSearchParams();
	const { users, getUsers, getUserById, setSelectedUser, selectedUser } =
		useChat();
	const [isInitialized, setIsInitialized] = useState(false);
	const [isLoadingContact, setIsLoadingContact] = useState(false);
	const [propertyContext, setPropertyContext] = useState<{
		userId: string;
		propertyId: string;
		propertyDetails?: any;
		collaborationType?: string;
	} | null>(null);

	const userId = searchParams?.get('userId');
	const propertyId = searchParams?.get('propertyId');
	const collaborationType = searchParams?.get('type');

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
					console.log(
						'Found user in existing conversations:',
						existingUser,
					);
					setSelectedUser(existingUser);
					setIsInitialized(true);
				} else {
					// If not found in existing conversations, fetch user by ID
					console.log(
						'User not in conversations, fetching by ID:',
						userId,
					);
					const fetchedUser = await getUserById(userId);

					if (fetchedUser) {
						console.log(
							'Fetched user for new conversation:',
							fetchedUser,
						);
						setSelectedUser(fetchedUser);
						setIsInitialized(true);
					} else {
						console.error('Failed to fetch user by ID:', userId);
					}
				}

				// If this conversation was initiated from a property page, store the context
				if (propertyId && userId) {
					try {
						const response = await fetch(
							`http://localhost:4000/api/property/${propertyId}`,
						);
						if (response.ok) {
							const propertyData = await response.json();
							setPropertyContext({
								userId,
								propertyId,
								propertyDetails: propertyData.data,
								collaborationType:
									collaborationType || undefined,
							});
							console.log(
								'Property context set:',
								propertyData.data.title,
							);
						}
					} catch (error) {
						console.error(
							'Failed to fetch property details:',
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
	]);

	// Show property context only for the specific conversation that was initiated from a property page
	const getContextMessage = () => {
		// Only show context if:
		// 1. There's a property context stored
		// 2. The currently selected user matches the context user
		if (
			!propertyContext ||
			!selectedUser ||
			propertyContext.userId !== selectedUser._id
		) {
			return null;
		}

		const { propertyDetails, collaborationType: contextCollaborationType } =
			propertyContext;

		if (contextCollaborationType === 'collaboration') {
			return (
				<div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
					<div className="flex items-center space-x-2">
						<svg
							className="w-5 h-5 text-blue-600"
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
						<span className="text-sm font-medium text-blue-800">
							Proposition de collaboration
						</span>
					</div>
					<p className="text-sm text-blue-700 mt-1">
						Vous proposez de collaborer sur cette annonce
						immobilière
						{propertyDetails && (
							<>
								:{' '}
								<span className="font-medium">
									{propertyDetails.title}
								</span>
								<br />
								<span className="text-xs">
									{propertyDetails.address},{' '}
									{propertyDetails.city} -
									{propertyDetails.price?.toLocaleString()} €
								</span>
							</>
						)}
					</p>
				</div>
			);
		}

		return (
			<div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
				<div className="flex items-center space-x-2">
					<svg
						className="w-5 h-5 text-green-600"
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
					<span className="text-sm font-medium text-green-800">
						Demande d&apos;information
					</span>
				</div>
				<p className="text-sm text-green-700 mt-1">
					Vous contactez l&apos;agent à propos de cette annonce immobilière
					{propertyDetails && (
						<>
							:{' '}
							<span className="font-medium">
								{propertyDetails.title}
							</span>
							<br />
							<span className="text-xs">
								{propertyDetails.address},{' '}
								{propertyDetails.city} -
								{propertyDetails.price?.toLocaleString()} €
							</span>
						</>
					)}
				</p>
			</div>
		);
	};

	return (
		<div>
			<ChatPage contextMessage={getContextMessage()} />
		</div>
	);
};

export default ChatPageRoute;
