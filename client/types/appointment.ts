export interface Appointment {
	_id: string;
	agentId: {
		_id: string;
		firstName: string;
		lastName: string;
		email: string;
		phone?: string;
		profileImage?: string;
		professionalInfo?: {
			city?: string;
			network?: string;
			yearsExperience?: number;
		};
	};
	clientId: {
		_id: string;
		firstName: string;
		lastName: string;
		email: string;
		phone?: string;
		profileImage?: string;
	};
	appointmentType: 'estimation' | 'vente' | 'achat' | 'conseil';
	status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'rejected';
	scheduledDate: string;
	scheduledTime: string;
	duration: number;
	propertyDetails?: {
		address?: string;
		city?: string;
		postalCode?: string;
		propertyType?: string;
		description?: string;
	};
	contactDetails: {
		name: string;
		email: string;
		phone: string;
	};
	notes?: string;
	cancellationReason?: string;
	cancelledBy?: {
		_id: string;
		firstName: string;
		lastName: string;
	};
	cancelledAt?: string;
	agentNotes?: string;
	respondedAt?: string;
	createdAt: string;
	updatedAt: string;
}

export interface TimeSlot {
	startTime: string;
	endTime: string;
}

export interface DayAvailability {
	dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6;
	isAvailable: boolean;
	slots: TimeSlot[];
}

export interface AgentAvailability {
	_id?: string;
	agentId: string;
	weeklySchedule: DayAvailability[];
	dateOverrides: Array<{
		date: string;
		isAvailable: boolean;
		slots?: TimeSlot[];
	}>;
	defaultDuration: number;
	bufferTime: number;
	maxAppointmentsPerDay?: number;
	advanceBookingDays?: number;
	createdAt?: string;
	updatedAt?: string;
}

export interface CreateAppointmentData {
	agentId: string;
	appointmentType: 'estimation' | 'vente' | 'achat' | 'conseil';
	scheduledDate: string;
	scheduledTime: string;
	duration?: number;
	propertyDetails?: {
		address?: string;
		city?: string;
		postalCode?: string;
		propertyType?: string;
		description?: string;
	};
	contactDetails: {
		name: string;
		email: string;
		phone: string;
	};
	notes?: string;
}

export interface AppointmentStats {
	total: number;
	upcoming: number;
	byStatus: Array<{
		_id: string;
		count: number;
	}>;
}

export interface AvailableSlots {
	slots: string[];
	isAvailable: boolean;
	duration: number;
}
