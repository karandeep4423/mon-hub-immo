import { Response } from 'express';
import type { AuthRequest } from '../types/auth';

// Provide hoist-safe mocks that expose internals via requireMock
jest.mock('../server', () => {
	const service = { emitNewMessage: jest.fn(), emitReadReceipt: jest.fn() };
	return { getSocketService: () => service, __service: service };
});

jest.mock('../models/User', () => ({
	User: {
		findById: jest.fn(() => ({
			select: jest
				.fn()
				.mockResolvedValue({
					firstName: 'Jane',
					lastName: 'Doe',
					email: 'jane@example.com',
				}),
		})),
	},
}));

jest.mock('../models/Chat', () => {
	const save = jest.fn().mockResolvedValue(undefined);
	const toObject = jest.fn(() => ({
		_id: 'msg1',
		createdAt: new Date().toISOString(),
	}));
	type ChatCtor = jest.Mock & {
		findOne: jest.Mock;
		countDocuments: jest.Mock;
		find: jest.Mock;
		updateMany: jest.Mock;
	};
	const ctor = Object.assign(
		jest.fn(() => ({ save, toObject })),
		{
			findOne: jest.fn(),
			countDocuments: jest.fn(),
			find: jest.fn(),
			updateMany: jest.fn(),
		},
	) as unknown as ChatCtor;
	return {
		__esModule: true,
		default: ctor,
		__mock: { ctor, save, toObject },
	};
});

// Import after mocks
import { sendMessage, markMessagesAsRead } from '../controllers/chatController';

interface ServerMock {
	getSocketService: () => {
		emitNewMessage: jest.Mock;
		emitReadReceipt: jest.Mock;
	};
	__service: { emitNewMessage: jest.Mock; emitReadReceipt: jest.Mock };
}

interface ChatModelMock {
	default: jest.Mock & {
		findOne: jest.Mock;
		countDocuments: jest.Mock;
		find: jest.Mock;
		updateMany: jest.Mock;
	};
	__mock: { ctor: jest.Mock; save: jest.Mock; toObject: jest.Mock };
}

const mockRes = (): Response & { status: jest.Mock; json: jest.Mock } => {
	const res = {
		status: jest.fn(),
		json: jest.fn(),
	} as unknown as Response & { status: jest.Mock; json: jest.Mock };
	res.status.mockReturnValue(res);
	res.json.mockReturnValue(res);
	return res;
};

describe('chatController', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	test('sendMessage saves attachments and emits socket event', async () => {
		const req = {
			userId: '507f191e810c19729de860ea',
			params: { id: '507f191e810c19729de860eb' },
			body: {
				text: 'hello',
				attachments: [
					{
						url: 'https://monhubimmo.s3.amazonaws.com/chat/file.pdf',
						name: 'file.pdf',
						mime: 'application/pdf',
						size: 1234,
					},
				],
			},
		} as unknown as AuthRequest;

		const res = mockRes();

		await sendMessage(req, res);

		const chatMod = jest.requireMock('../models/Chat') as ChatModelMock;
		expect(chatMod.__mock.ctor).toHaveBeenCalledTimes(1);
		expect(chatMod.__mock.save).toHaveBeenCalled();

		const serverMod = jest.requireMock('../server') as ServerMock;
		expect(serverMod.__service.emitNewMessage).toHaveBeenCalledTimes(1);
		expect(res.status).toHaveBeenCalledWith(201);
		expect(res.json).toHaveBeenCalled();
	});

	test('markMessagesAsRead updates and emits receipt', async () => {
		const chatMod = jest.requireMock('../models/Chat') as ChatModelMock;
		chatMod.default.updateMany.mockResolvedValueOnce({ modifiedCount: 2 });

		const req = {
			userId: '507f191e810c19729de860ea',
			params: { id: '507f191e810c19729de860eb' },
		} as unknown as AuthRequest;

		const res = mockRes();

		await markMessagesAsRead(req, res);

		expect(chatMod.default.updateMany).toHaveBeenCalled();
		const serverMod = jest.requireMock('../server') as ServerMock;
		expect(serverMod.__service.emitReadReceipt).toHaveBeenCalledTimes(1);
		expect(res.status).toHaveBeenCalledWith(200);
		expect(res.json).toHaveBeenCalledWith(
			expect.objectContaining({
				message: 'Messages marked as read',
				count: 2,
			}),
		);
	});
});
