/**
 * Frontend Authorization Utilities Tests
 * Tests core client-side authorization helper functions
 */

import {
	hasRequiredRole,
	isResourceOwner,
	canAccessRoute,
	shouldRedirectFromAuth,
	getRedirectPath,
	canCreateProperty,
	canCreateSearchAd,
	canEditResource,
	canDeleteResource,
	isCollaborationParticipant,
	canSignContract,
} from '@/lib/utils/authUtils';
import { User } from '@/types/auth';

describe('Frontend Authorization Utilities', () => {
	// Mock users for testing
	const mockAgentUser: User = {
		id: 'agent123',
		_id: 'agent123',
		firstName: 'Jean',
		lastName: 'Dupont',
		email: 'agent@test.com',
		phone: '0123456789',
		userType: 'agent',
		isEmailVerified: true,
		profileCompleted: true,
		createdAt: '2024-01-01',
		updatedAt: '2024-01-01',
	};

	const mockApporteurUser: User = {
		id: 'apporteur123',
		_id: 'apporteur123',
		firstName: 'Marie',
		lastName: 'Martin',
		email: 'apporteur@test.com',
		phone: '0987654321',
		userType: 'apporteur',
		isEmailVerified: true,
		profileCompleted: true,
		createdAt: '2024-01-01',
		updatedAt: '2024-01-01',
	};

	describe('hasRequiredRole', () => {
		it('should return true when user has required role', () => {
			expect(hasRequiredRole(mockAgentUser, ['agent'])).toBe(true);
			expect(hasRequiredRole(mockApporteurUser, ['apporteur'])).toBe(
				true,
			);
		});

		it('should return true when user has one of multiple allowed roles', () => {
			expect(hasRequiredRole(mockAgentUser, ['agent', 'apporteur'])).toBe(
				true,
			);
			expect(
				hasRequiredRole(mockApporteurUser, ['agent', 'apporteur']),
			).toBe(true);
		});

		it('should return false when user does not have required role', () => {
			expect(hasRequiredRole(mockAgentUser, ['apporteur'])).toBe(false);
			expect(hasRequiredRole(mockApporteurUser, ['agent'])).toBe(false);
		});

		it('should return false for null or undefined user', () => {
			expect(hasRequiredRole(null, ['agent'])).toBe(false);
			expect(hasRequiredRole(undefined, ['agent'])).toBe(false);
		});
	});

	describe('isResourceOwner', () => {
		it('should return true when user owns the resource (using id)', () => {
			expect(isResourceOwner(mockAgentUser, 'agent123')).toBe(true);
		});

		it('should return true when user owns the resource (using _id)', () => {
			expect(isResourceOwner(mockAgentUser, 'agent123')).toBe(true);
		});

		it('should return false when user does not own the resource', () => {
			expect(isResourceOwner(mockAgentUser, 'other123')).toBe(false);
		});

		it('should return false for null or undefined user', () => {
			expect(isResourceOwner(null, 'agent123')).toBe(false);
			expect(isResourceOwner(undefined, 'agent123')).toBe(false);
		});

		it('should return false for undefined resourceOwnerId', () => {
			expect(isResourceOwner(mockAgentUser, undefined)).toBe(false);
		});
	});

	describe('canAccessRoute', () => {
		it('should allow access to public routes for unauthenticated users', () => {
			expect(canAccessRoute('/', false)).toBe(true);
			expect(canAccessRoute('/auth/login', false)).toBe(true);
			expect(canAccessRoute('/home', false)).toBe(true);
		});

		it('should block access to protected routes for unauthenticated users', () => {
			expect(canAccessRoute('/dashboard', false)).toBe(false);
			expect(canAccessRoute('/messages', false)).toBe(false);
			expect(canAccessRoute('/favorites', false)).toBe(false);
		});

		it('should allow access to protected routes for authenticated users', () => {
			expect(canAccessRoute('/dashboard', true)).toBe(true);
			expect(canAccessRoute('/messages', true)).toBe(true);
			expect(canAccessRoute('/favorites', true)).toBe(true);
		});

		it('should allow access to public routes for authenticated users', () => {
			expect(canAccessRoute('/', true)).toBe(true);
			expect(canAccessRoute('/home', true)).toBe(true);
		});

		it('should block access to dynamic protected routes for unauthenticated users', () => {
			expect(canAccessRoute('/search-ads/edit/123', false)).toBe(false);
			expect(canAccessRoute('/collaboration/456', false)).toBe(false);
		});

		it('should allow access to dynamic protected routes for authenticated users', () => {
			expect(canAccessRoute('/search-ads/edit/123', true)).toBe(true);
			expect(canAccessRoute('/collaboration/456', true)).toBe(true);
		});
	});

	describe('shouldRedirectFromAuth', () => {
		it('should redirect authenticated users from auth routes', () => {
			expect(shouldRedirectFromAuth('/auth/login', true)).toBe(true);
			expect(shouldRedirectFromAuth('/auth/signup', true)).toBe(true);
		});

		it('should not redirect unauthenticated users from auth routes', () => {
			expect(shouldRedirectFromAuth('/auth/login', false)).toBe(false);
			expect(shouldRedirectFromAuth('/auth/signup', false)).toBe(false);
		});

		it('should not redirect from non-auth routes', () => {
			expect(shouldRedirectFromAuth('/dashboard', true)).toBe(false);
			expect(shouldRedirectFromAuth('/home', true)).toBe(false);
		});
	});

	describe('getRedirectPath', () => {
		it('should return dashboard path for authenticated users', () => {
			expect(getRedirectPath(true)).toBe('/dashboard');
		});

		it('should return login path for unauthenticated users', () => {
			expect(getRedirectPath(false)).toBe('/auth/login');
		});
	});

	describe('Role-specific permissions', () => {
		describe('canCreateProperty', () => {
			it('should allow agents to create properties', () => {
				expect(canCreateProperty(mockAgentUser)).toBe(true);
			});

			it('should not allow apporteurs to create properties', () => {
				expect(canCreateProperty(mockApporteurUser)).toBe(false);
			});

			it('should return false for null user', () => {
				expect(canCreateProperty(null)).toBe(false);
			});
		});

		describe('canCreateSearchAd', () => {
			it('should allow apporteurs to create search ads', () => {
				expect(canCreateSearchAd(mockApporteurUser)).toBe(true);
			});

			it('should not allow agents to create search ads', () => {
				expect(canCreateSearchAd(mockAgentUser)).toBe(false);
			});

			it('should return false for null user', () => {
				expect(canCreateSearchAd(null)).toBe(false);
			});
		});
	});

	describe('Resource permissions', () => {
		describe('canEditResource', () => {
			it('should allow editing for resource owner', () => {
				expect(canEditResource(mockAgentUser, 'agent123')).toBe(true);
			});

			it('should not allow editing for non-owner', () => {
				expect(canEditResource(mockAgentUser, 'other123')).toBe(false);
			});
		});

		describe('canDeleteResource', () => {
			it('should allow deleting for resource owner', () => {
				expect(canDeleteResource(mockAgentUser, 'agent123')).toBe(true);
			});

			it('should not allow deleting for non-owner', () => {
				expect(canDeleteResource(mockAgentUser, 'other123')).toBe(
					false,
				);
			});
		});
	});

	describe('Collaboration permissions', () => {
		describe('isCollaborationParticipant', () => {
			it('should return true for post owner', () => {
				expect(
					isCollaborationParticipant(
						mockAgentUser,
						'agent123',
						'apporteur123',
					),
				).toBe(true);
			});

			it('should return true for collaborator', () => {
				expect(
					isCollaborationParticipant(
						mockApporteurUser,
						'agent123',
						'apporteur123',
					),
				).toBe(true);
			});

			it('should return false for non-participant', () => {
				const otherUser: User = {
					...mockAgentUser,
					id: 'other123',
					_id: 'other123',
				};
				expect(
					isCollaborationParticipant(
						otherUser,
						'agent123',
						'apporteur123',
					),
				).toBe(false);
			});

			it('should return false for null user', () => {
				expect(
					isCollaborationParticipant(
						null,
						'agent123',
						'apporteur123',
					),
				).toBe(false);
			});
		});

		describe('canSignContract', () => {
			it('should allow contract signing for post owner with accepted collaboration', () => {
				expect(
					canSignContract(
						mockAgentUser,
						'agent123',
						'apporteur123',
						'accepted',
					),
				).toBe(true);
			});

			it('should allow contract signing for collaborator with accepted collaboration', () => {
				expect(
					canSignContract(
						mockApporteurUser,
						'agent123',
						'apporteur123',
						'accepted',
					),
				).toBe(true);
			});

			it('should not allow signing for pending collaboration', () => {
				expect(
					canSignContract(
						mockAgentUser,
						'agent123',
						'apporteur123',
						'pending',
					),
				).toBe(false);
			});

			it('should not allow signing for rejected collaboration', () => {
				expect(
					canSignContract(
						mockAgentUser,
						'agent123',
						'apporteur123',
						'rejected',
					),
				).toBe(false);
			});

			it('should not allow signing for non-participant', () => {
				const otherUser: User = {
					...mockAgentUser,
					id: 'other123',
					_id: 'other123',
				};
				expect(
					canSignContract(
						otherUser,
						'agent123',
						'apporteur123',
						'accepted',
					),
				).toBe(false);
			});

			it('should not allow signing without status', () => {
				expect(
					canSignContract(mockAgentUser, 'agent123', 'apporteur123'),
				).toBe(false);
			});
		});
	});
});
