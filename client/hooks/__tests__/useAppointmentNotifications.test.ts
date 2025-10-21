import { renderHook } from '@testing-library/react';
import { Socket } from 'socket.io-client';
import { useAppointmentNotifications } from '../useAppointmentNotifications';
import { useSocket } from '@/context/SocketContext';
import { useNotification } from '../useNotification';
import { useAuth } from '../useAuth';
import { Appointment } from '@/types/appointment';
import { User } from '@/types/auth';

jest.mock('@/context/SocketContext');
jest.mock('../useNotification');
jest.mock('../useAuth');

const mockUseSocket = useSocket as jest.MockedFunction<typeof useSocket>;
const mockUseNotification = useNotification as jest.MockedFunction<
	typeof useNotification
>;
const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

type MockCall = [string, unknown];

const createMockAuthContext = (user: User | null) => ({
	user,
	loading: false,
	login: jest.fn(),
	logout: jest.fn(),
	updateUser: jest.fn(),
	refreshUser: jest.fn(),
});

describe('useAppointmentNotifications', () => {
	let mockSocket: {
		on: jest.Mock;
		off: jest.Mock;
	};
	let mockShowNotification: jest.Mock;
	let mockOnUpdate: jest.Mock;

	const createMockUser = (
		userType: 'agent' | 'apporteur',
		id: string,
	): User => ({
		id,
		_id: id,
		firstName: userType === 'agent' ? 'John' : 'Jane',
		lastName: userType === 'agent' ? 'Doe' : 'Smith',
		email: `${userType}@test.com`,
		phone: '1234567890',
		userType,
		isEmailVerified: true,
		profileCompleted: true,
	});

	const createMockAppointment = (
		overrides?: Partial<Appointment>,
	): Appointment => ({
		_id: '123',
		agentId: {
			_id: 'agent1',
			firstName: 'John',
			lastName: 'Doe',
			email: 'agent@test.com',
		},
		clientId: {
			_id: 'client1',
			firstName: 'Jane',
			lastName: 'Smith',
			email: 'client@test.com',
		},
		appointmentType: 'estimation',
		status: 'pending',
		scheduledDate: '2025-10-20',
		scheduledTime: '10:00',
		duration: 60,
		contactDetails: {
			name: 'Jane Smith',
			email: 'client@test.com',
			phone: '1234567890',
		},
		createdAt: '2025-10-15T10:00:00Z',
		updatedAt: '2025-10-15T10:00:00Z',
		...overrides,
	});

	beforeEach(() => {
		mockSocket = {
			on: jest.fn(),
			off: jest.fn(),
		};
		mockShowNotification = jest.fn();
		mockOnUpdate = jest.fn();

		mockUseSocket.mockReturnValue({
			socket: mockSocket as unknown as Socket,
			onlineUsers: [],
			isConnected: true,
		});
		mockUseNotification.mockReturnValue({
			notifications: [],
			addNotification: jest.fn(),
			removeNotification: jest.fn(),
			showNotification: mockShowNotification,
			requestPermission: jest.fn(),
			permission: 'default',
		});
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('Agent notifications', () => {
		beforeEach(() => {
			mockUseAuth.mockReturnValue(
				createMockAuthContext(createMockUser('agent', 'agent1')),
			);
		});

		it('should show notification when new appointment is received', () => {
			renderHook(() =>
				useAppointmentNotifications({ onUpdate: mockOnUpdate }),
			);

			const appointment = createMockAppointment();
			const handleNewAppointment = mockSocket.on.mock.calls.find(
				(call: MockCall) => call[0] === 'appointment:new',
			)?.[1] as (appointment: Appointment) => void;

			handleNewAppointment(appointment);

			expect(mockShowNotification).toHaveBeenCalledWith(
				'Nouvelle demande de rendez-vous de Jane Smith',
				'info',
			);
			expect(mockOnUpdate).toHaveBeenCalled();
		});

		it('should show notification when client cancels appointment', () => {
			renderHook(() =>
				useAppointmentNotifications({ onUpdate: mockOnUpdate }),
			);

			const appointment = createMockAppointment({
				status: 'cancelled',
			});
			const handleStatusUpdate = mockSocket.on.mock.calls.find(
				(call: MockCall) => call[0] === 'appointment:status_updated',
			)?.[1] as (data: {
				appointment: Appointment;
				previousStatus: string;
			}) => void;

			handleStatusUpdate({
				appointment,
				previousStatus: 'confirmed',
			});

			expect(mockShowNotification).toHaveBeenCalledWith(
				'Jane Smith a annulé le rendez-vous',
				'warning',
			);
			expect(mockOnUpdate).toHaveBeenCalled();
		});

		it('should not show notification when appointment is cancelled from pending', () => {
			renderHook(() =>
				useAppointmentNotifications({ onUpdate: mockOnUpdate }),
			);

			const appointment = createMockAppointment({
				status: 'cancelled',
			});
			const handleStatusUpdate = mockSocket.on.mock.calls.find(
				(call: MockCall) => call[0] === 'appointment:status_updated',
			)?.[1] as (data: {
				appointment: Appointment;
				previousStatus: string;
			}) => void;

			handleStatusUpdate({
				appointment,
				previousStatus: 'pending',
			});

			expect(mockShowNotification).not.toHaveBeenCalled();
		});

		it('should show notification when appointment is rescheduled', () => {
			renderHook(() =>
				useAppointmentNotifications({ onUpdate: mockOnUpdate }),
			);

			const appointment = createMockAppointment();
			const handleReschedule = mockSocket.on.mock.calls.find(
				(call: MockCall) => call[0] === 'appointment:rescheduled',
			)?.[1] as (appointment: Appointment) => void;

			handleReschedule(appointment);

			expect(mockShowNotification).toHaveBeenCalledWith(
				'Rendez-vous avec Jane Smith reprogrammé',
				'info',
			);
			expect(mockOnUpdate).toHaveBeenCalled();
		});

		it('should not show notification when agent cancels their own appointment', () => {
			renderHook(() =>
				useAppointmentNotifications({ onUpdate: mockOnUpdate }),
			);

			const appointment = createMockAppointment();
			const handleCancellation = mockSocket.on.mock.calls.find(
				(call: MockCall) => call[0] === 'appointment:cancelled',
			)?.[1] as (data: {
				appointment: Appointment;
				cancelledBy: string;
			}) => void;

			handleCancellation({
				appointment,
				cancelledBy: 'agent1',
			});

			expect(mockShowNotification).not.toHaveBeenCalled();
			expect(mockOnUpdate).not.toHaveBeenCalled();
		});
	});

	describe('Client notifications', () => {
		beforeEach(() => {
			mockUseAuth.mockReturnValue(
				createMockAuthContext(createMockUser('apporteur', 'client1')),
			);
		});

		it('should show notification when appointment is confirmed', () => {
			renderHook(() =>
				useAppointmentNotifications({ onUpdate: mockOnUpdate }),
			);

			const appointment = createMockAppointment({
				status: 'confirmed',
			});
			const handleStatusUpdate = mockSocket.on.mock.calls.find(
				(call: MockCall) => call[0] === 'appointment:status_updated',
			)?.[1] as (data: {
				appointment: Appointment;
				previousStatus: string;
			}) => void;

			handleStatusUpdate({
				appointment,
				previousStatus: 'pending',
			});

			expect(mockShowNotification).toHaveBeenCalledWith(
				'John Doe a confirmé votre rendez-vous',
				'success',
			);
			expect(mockOnUpdate).toHaveBeenCalled();
		});

		it('should show notification when appointment is rejected', () => {
			renderHook(() =>
				useAppointmentNotifications({ onUpdate: mockOnUpdate }),
			);

			const appointment = createMockAppointment({
				status: 'rejected',
			});
			const handleStatusUpdate = mockSocket.on.mock.calls.find(
				(call: MockCall) => call[0] === 'appointment:status_updated',
			)?.[1] as (data: {
				appointment: Appointment;
				previousStatus: string;
			}) => void;

			handleStatusUpdate({
				appointment,
				previousStatus: 'pending',
			});

			expect(mockShowNotification).toHaveBeenCalledWith(
				'John Doe a refusé votre demande de rendez-vous',
				'error',
			);
			expect(mockOnUpdate).toHaveBeenCalled();
		});
		it('should show notification when appointment is completed', () => {
			renderHook(() =>
				useAppointmentNotifications({ onUpdate: mockOnUpdate }),
			);

			const appointment = createMockAppointment({
				status: 'completed',
			});
			const handleStatusUpdate = mockSocket.on.mock.calls.find(
				(call: MockCall) => call[0] === 'appointment:status_updated',
			)?.[1] as (data: {
				appointment: Appointment;
				previousStatus: string;
			}) => void;

			handleStatusUpdate({
				appointment,
				previousStatus: 'confirmed',
			});

			expect(mockShowNotification).toHaveBeenCalledWith(
				'Rendez-vous avec John Doe marqué comme terminé',
				'success',
			);
			expect(mockOnUpdate).toHaveBeenCalled();
		});

		it('should show notification when agent cancels appointment', () => {
			renderHook(() =>
				useAppointmentNotifications({ onUpdate: mockOnUpdate }),
			);

			const appointment = createMockAppointment();
			const handleCancellation = mockSocket.on.mock.calls.find(
				(call: MockCall) => call[0] === 'appointment:cancelled',
			)?.[1] as (data: {
				appointment: Appointment;
				cancelledBy: string;
			}) => void;

			handleCancellation({
				appointment,
				cancelledBy: 'agent1',
			});

			expect(mockShowNotification).toHaveBeenCalledWith(
				'Rendez-vous avec John Doe annulé',
				'warning',
			);
			expect(mockOnUpdate).toHaveBeenCalled();
		});

		it('should show notification when appointment is rescheduled', () => {
			renderHook(() =>
				useAppointmentNotifications({ onUpdate: mockOnUpdate }),
			);

			const appointment = createMockAppointment();
			const handleReschedule = mockSocket.on.mock.calls.find(
				(call: MockCall) => call[0] === 'appointment:rescheduled',
			)?.[1] as (appointment: Appointment) => void;

			handleReschedule(appointment);

			expect(mockShowNotification).toHaveBeenCalledWith(
				'Rendez-vous avec John Doe reprogrammé',
				'info',
			);
			expect(mockOnUpdate).toHaveBeenCalled();
		});
	});

	describe('Socket lifecycle', () => {
		beforeEach(() => {
			mockUseAuth.mockReturnValue(
				createMockAuthContext(createMockUser('agent', 'user1')),
			);
		});

		it('should register socket listeners on mount', () => {
			renderHook(() => useAppointmentNotifications());

			expect(mockSocket.on).toHaveBeenCalledWith(
				'appointment:new',
				expect.any(Function),
			);
			expect(mockSocket.on).toHaveBeenCalledWith(
				'appointment:status_updated',
				expect.any(Function),
			);
			expect(mockSocket.on).toHaveBeenCalledWith(
				'appointment:cancelled',
				expect.any(Function),
			);
			expect(mockSocket.on).toHaveBeenCalledWith(
				'appointment:rescheduled',
				expect.any(Function),
			);
		});

		it('should cleanup socket listeners on unmount', () => {
			const { unmount } = renderHook(() => useAppointmentNotifications());

			unmount();

			expect(mockSocket.off).toHaveBeenCalledWith(
				'appointment:new',
				expect.any(Function),
			);
			expect(mockSocket.off).toHaveBeenCalledWith(
				'appointment:status_updated',
				expect.any(Function),
			);
			expect(mockSocket.off).toHaveBeenCalledWith(
				'appointment:cancelled',
				expect.any(Function),
			);
			expect(mockSocket.off).toHaveBeenCalledWith(
				'appointment:rescheduled',
				expect.any(Function),
			);
		});

		it('should not register listeners if socket is not available', () => {
			mockUseSocket.mockReturnValue({
				socket: null,
				onlineUsers: [],
				isConnected: false,
			});

			renderHook(() => useAppointmentNotifications());

			expect(mockSocket.on).not.toHaveBeenCalled();
		});

		it('should not register listeners if user is not available', () => {
			mockUseAuth.mockReturnValue(createMockAuthContext(null));

			renderHook(() => useAppointmentNotifications());

			expect(mockSocket.on).not.toHaveBeenCalled();
		});
	});

	describe('Without onUpdate callback', () => {
		beforeEach(() => {
			mockUseAuth.mockReturnValue(
				createMockAuthContext(createMockUser('agent', 'agent1')),
			);
		});

		it('should work without onUpdate callback', () => {
			renderHook(() => useAppointmentNotifications());

			const appointment = createMockAppointment();
			const handleNewAppointment = mockSocket.on.mock.calls.find(
				(call: MockCall) => call[0] === 'appointment:new',
			)?.[1] as (appointment: Appointment) => void;

			expect(() => handleNewAppointment(appointment)).not.toThrow();
			expect(mockShowNotification).toHaveBeenCalled();
		});
	});
});
