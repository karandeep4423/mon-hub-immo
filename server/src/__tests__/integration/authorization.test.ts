/**
 * Authorization Integration Tests
 * Tests the complete authorization flow: authenticate → check role → check ownership → access resource
 */

import request from 'supertest';
import express from 'express';
import {
	requireRole,
	requireOwnership,
	requireCollaborationAccess,
} from '../../middleware/authorize';
import { AuthRequest } from '../../types/auth';
import { Response } from 'express';

// Mock models
const mockSearchAd = {
	_id: 'ad123',
	authorId: 'user123',
	title: 'Test Ad',
	save: jest.fn(),
	deleteOne: jest.fn(),
};

const mockCollaboration = {
	_id: 'collab123',
	postOwnerId: 'owner123',
	collaboratorId: 'collaborator123',
	status: 'accepted',
};

// Create test Express app
const createTestApp = () => {
	const app = express();
	app.use(express.json());
	return app;
};

// Mock findById for SearchAd
jest.mock('../../models/SearchAd', () => ({
	SearchAd: {
		findById: jest.fn(),
	},
}));

// Mock findById for Collaboration
jest.mock('../../models/Collaboration', () => ({
	Collaboration: {
		findById: jest.fn(),
	},
}));

describe('Authorization Integration Tests', () => {
	let app: express.Application;

	beforeEach(() => {
		app = createTestApp();
		jest.clearAllMocks();
	});

	describe('requireRole Middleware', () => {
		it('should allow access for users with correct role', async () => {
			const mockAuth = (
				req: AuthRequest,
				res: Response,
				next: () => void,
			) => {
				req.user = {
					id: 'user123',
					userType: 'agent',
				};
				req.userId = 'user123';
				next();
			};

			app.get(
				'/test',
				mockAuth,
				requireRole(['agent']),
				(req: AuthRequest, res: Response) => {
					res.json({ success: true, message: 'Access granted' });
				},
			);

			const response = await request(app).get('/test');

			expect(response.status).toBe(200);
			expect(response.body.success).toBe(true);
		});

		it('should block access for users with incorrect role', async () => {
			const mockAuth = (
				req: AuthRequest,
				res: Response,
				next: () => void,
			) => {
				req.user = {
					id: 'user123',
					userType: 'apporteur',
				};
				req.userId = 'user123';
				next();
			};

			app.get(
				'/test',
				mockAuth,
				requireRole(['agent']),
				(req: AuthRequest, res: Response) => {
					res.json({ success: true, message: 'Access granted' });
				},
			);

			const response = await request(app).get('/test');

			expect(response.status).toBe(403);
			expect(response.body.success).toBe(false);
			expect(response.body.message).toContain('rôle');
		});

		it('should allow access for multiple allowed roles', async () => {
			const mockAuth = (
				req: AuthRequest,
				res: Response,
				next: () => void,
			) => {
				req.user = {
					id: 'user123',
					userType: 'apporteur',
				};
				req.userId = 'user123';
				next();
			};

			app.get(
				'/test',
				mockAuth,
				requireRole(['agent', 'apporteur']),
				(req: AuthRequest, res: Response) => {
					res.json({ success: true, message: 'Access granted' });
				},
			);

			const response = await request(app).get('/test');

			expect(response.status).toBe(200);
			expect(response.body.success).toBe(true);
		});

		it('should block access for unauthenticated users', async () => {
			app.get(
				'/test',
				requireRole(['agent']),
				(req: AuthRequest, res: Response) => {
					res.json({ success: true, message: 'Access granted' });
				},
			);

			const response = await request(app).get('/test');

			expect(response.status).toBe(401);
			expect(response.body.success).toBe(false);
		});
	});

	describe('requireOwnership Middleware', () => {
		// eslint-disable-next-line @typescript-eslint/no-require-imports
		const { SearchAd } = require('../../models/SearchAd');

		it('should allow access for resource owners', async () => {
			SearchAd.findById.mockResolvedValue(mockSearchAd);

			const mockAuth = (
				req: AuthRequest,
				res: Response,
				next: () => void,
			) => {
				req.userId = 'user123';
				next();
			};

			app.delete(
				'/ads/:id',
				mockAuth,
				requireOwnership(SearchAd),
				(req: AuthRequest, res: Response) => {
					res.json({ success: true, message: 'Delete successful' });
				},
			);

			const response = await request(app).delete('/ads/ad123');

			expect(response.status).toBe(200);
			expect(response.body.success).toBe(true);
		});

		it('should block access for non-owners', async () => {
			SearchAd.findById.mockResolvedValue(mockSearchAd);

			const mockAuth = (
				req: AuthRequest,
				res: Response,
				next: () => void,
			) => {
				req.userId = 'different_user';
				next();
			};

			app.delete(
				'/ads/:id',
				mockAuth,
				requireOwnership(SearchAd),
				(req: AuthRequest, res: Response) => {
					res.json({ success: true, message: 'Delete successful' });
				},
			);

			const response = await request(app).delete('/ads/ad123');

			expect(response.status).toBe(403);
			expect(response.body.success).toBe(false);
		});

		it('should return 404 for non-existent resources', async () => {
			SearchAd.findById.mockResolvedValue(null);

			const mockAuth = (
				req: AuthRequest,
				res: Response,
				next: () => void,
			) => {
				req.userId = 'user123';
				next();
			};

			app.delete(
				'/ads/:id',
				mockAuth,
				requireOwnership(SearchAd),
				(req: AuthRequest, res: Response) => {
					res.json({ success: true, message: 'Delete successful' });
				},
			);

			const response = await request(app).delete('/ads/nonexistent');

			expect(response.status).toBe(404);
			expect(response.body.success).toBe(false);
		});

		it('should attach resource to request for controller use', async () => {
			SearchAd.findById.mockResolvedValue(mockSearchAd);

			const mockAuth = (
				req: AuthRequest,
				res: Response,
				next: () => void,
			) => {
				req.userId = 'user123';
				next();
			};

			app.get(
				'/ads/:id',
				mockAuth,
				requireOwnership(SearchAd),
				(req: AuthRequest, res: Response) => {
					expect(req.resource).toBeDefined();
					expect(req.resource._id).toBe('ad123');
					res.json({ success: true, resource: req.resource });
				},
			);

			const response = await request(app).get('/ads/ad123');

			expect(response.status).toBe(200);
			expect(response.body.resource).toBeDefined();
		});
	});

	describe('requireCollaborationAccess Middleware', () => {
		// eslint-disable-next-line @typescript-eslint/no-require-imports
		const { Collaboration } = require('../../models/Collaboration');

		it('should allow access for post owner', async () => {
			Collaboration.findById.mockResolvedValue(mockCollaboration);

			const mockAuth = (
				req: AuthRequest,
				res: Response,
				next: () => void,
			) => {
				req.userId = 'owner123';
				next();
			};

			app.post(
				'/collaboration/:id/notes',
				mockAuth,
				requireCollaborationAccess(),
				(req: AuthRequest, res: Response) => {
					res.json({ success: true, message: 'Note added' });
				},
			);

			const response = await request(app).post(
				'/collaboration/collab123/notes',
			);

			expect(response.status).toBe(200);
			expect(response.body.success).toBe(true);
		});

		it('should allow access for collaborator', async () => {
			Collaboration.findById.mockResolvedValue(mockCollaboration);

			const mockAuth = (
				req: AuthRequest,
				res: Response,
				next: () => void,
			) => {
				req.userId = 'collaborator123';
				next();
			};

			app.post(
				'/collaboration/:id/notes',
				mockAuth,
				requireCollaborationAccess(),
				(req: AuthRequest, res: Response) => {
					res.json({ success: true, message: 'Note added' });
				},
			);

			const response = await request(app).post(
				'/collaboration/collab123/notes',
			);

			expect(response.status).toBe(200);
			expect(response.body.success).toBe(true);
		});

		it('should block access for non-participants', async () => {
			Collaboration.findById.mockResolvedValue(mockCollaboration);

			const mockAuth = (
				req: AuthRequest,
				res: Response,
				next: () => void,
			) => {
				req.userId = 'outsider123';
				next();
			};

			app.post(
				'/collaboration/:id/notes',
				mockAuth,
				requireCollaborationAccess(),
				(req: AuthRequest, res: Response) => {
					res.json({ success: true, message: 'Note added' });
				},
			);

			const response = await request(app).post(
				'/collaboration/collab123/notes',
			);

			expect(response.status).toBe(403);
			expect(response.body.success).toBe(false);
		});

		it('should return 404 for non-existent collaborations', async () => {
			Collaboration.findById.mockResolvedValue(null);

			const mockAuth = (
				req: AuthRequest,
				res: Response,
				next: () => void,
			) => {
				req.userId = 'owner123';
				next();
			};

			app.post(
				'/collaboration/:id/notes',
				mockAuth,
				requireCollaborationAccess(),
				(req: AuthRequest, res: Response) => {
					res.json({ success: true, message: 'Note added' });
				},
			);

			const response = await request(app).post(
				'/collaboration/nonexistent/notes',
			);

			expect(response.status).toBe(404);
			expect(response.body.success).toBe(false);
		});
	});

	describe('Combined Authorization Flow', () => {
		// eslint-disable-next-line @typescript-eslint/no-require-imports
		const { SearchAd } = require('../../models/SearchAd');

		it('should pass through authentication → role → ownership checks', async () => {
			SearchAd.findById.mockResolvedValue(mockSearchAd);

			const mockAuth = (
				req: AuthRequest,
				res: Response,
				next: () => void,
			) => {
				req.user = {
					id: 'user123',
					userType: 'agent',
				};
				req.userId = 'user123';
				next();
			};

			app.delete(
				'/ads/:id',
				mockAuth,
				requireRole(['agent']),
				requireOwnership(SearchAd),
				(req: AuthRequest, res: Response) => {
					res.json({ success: true, message: 'Delete successful' });
				},
			);

			const response = await request(app).delete('/ads/ad123');

			expect(response.status).toBe(200);
			expect(response.body.success).toBe(true);
		});

		it('should fail at role check before ownership', async () => {
			SearchAd.findById.mockResolvedValue(mockSearchAd);

			const mockAuth = (
				req: AuthRequest,
				res: Response,
				next: () => void,
			) => {
				req.user = {
					id: 'user123',
					userType: 'apporteur',
				};
				req.userId = 'user123';
				next();
			};

			app.delete(
				'/ads/:id',
				mockAuth,
				requireRole(['agent']),
				requireOwnership(SearchAd),
				(req: AuthRequest, res: Response) => {
					res.json({ success: true, message: 'Delete successful' });
				},
			);

			const response = await request(app).delete('/ads/ad123');

			expect(response.status).toBe(403);
			expect(response.body.message).toContain('rôle');
			// SearchAd.findById should not be called because role check failed first
			expect(SearchAd.findById).not.toHaveBeenCalled();
		});

		it('should fail at ownership check after passing role check', async () => {
			SearchAd.findById.mockResolvedValue(mockSearchAd);

			const mockAuth = (
				req: AuthRequest,
				res: Response,
				next: () => void,
			) => {
				req.user = {
					id: 'different_user',
					userType: 'agent',
				};
				req.userId = 'different_user';
				next();
			};

			app.delete(
				'/ads/:id',
				mockAuth,
				requireRole(['agent']),
				requireOwnership(SearchAd),
				(req: AuthRequest, res: Response) => {
					res.json({ success: true, message: 'Delete successful' });
				},
			);

			const response = await request(app).delete('/ads/ad123');

			expect(response.status).toBe(403);
			expect(response.body.message).toContain('ressources');
			// SearchAd.findById should be called because role check passed
			expect(SearchAd.findById).toHaveBeenCalled();
		});
	});

	describe('Error Handling', () => {
		// eslint-disable-next-line @typescript-eslint/no-require-imports
		const { SearchAd } = require('../../models/SearchAd');

		it('should handle database errors gracefully', async () => {
			SearchAd.findById.mockRejectedValue(new Error('Database error'));

			const mockAuth = (
				req: AuthRequest,
				res: Response,
				next: () => void,
			) => {
				req.userId = 'user123';
				next();
			};

			app.delete(
				'/ads/:id',
				mockAuth,
				requireOwnership(SearchAd),
				(req: AuthRequest, res: Response) => {
					res.json({ success: true, message: 'Delete successful' });
				},
			);

			const response = await request(app).delete('/ads/ad123');

			expect(response.status).toBe(500);
			expect(response.body.success).toBe(false);
		});
	});
});
