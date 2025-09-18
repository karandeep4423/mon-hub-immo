import mongoose, { Document, Schema, Types } from 'mongoose';

// ============================================================================
// INTERFACES
// ============================================================================

export interface ICollaboration extends Document {
	_id: Types.ObjectId;
	propertyId: Types.ObjectId;
	propertyOwnerId: Types.ObjectId; // Agent who owns the property
	collaboratorId: Types.ObjectId; // Agent who wants to collaborate

	// Status tracking
	status:
		| 'pending'
		| 'accepted'
		| 'active'
		| 'completed'
		| 'cancelled'
		| 'rejected';

	// Proposal details
	proposedCommission: number; // Percentage (e.g., 40 for 40%)
	proposalMessage: string;

	// Contract signing
	ownerSigned: boolean;
	ownerSignedAt?: Date;
	collaboratorSigned: boolean;
	collaboratorSignedAt?: Date;

	// Contract content
	contractText?: string;
	additionalTerms?: string;
	contractModified: boolean;
	contractLastModifiedBy?: Types.ObjectId;
	contractLastModifiedAt?: Date;

	// Progress tracking
	currentStep: 'proposal' | 'contract_signing' | 'active' | 'completed';

	// Workflow 2: Progress step tracking
	currentProgressStep:
		| 'proposal'
		| 'accepted'
		| 'visit_planned'
		| 'visit_completed'
		| 'negotiation'
		| 'offer_made'
		| 'compromise_signed'
		| 'final_act';
	progressSteps: Array<{
		id:
			| 'proposal'
			| 'accepted'
			| 'visit_planned'
			| 'visit_completed'
			| 'negotiation'
			| 'offer_made'
			| 'compromise_signed'
			| 'final_act';
		completed: boolean;
		completedAt?: Date;
		notes?: string;
		completedBy?: Types.ObjectId;
	}>;

	// Activity notes
	activities: Array<{
		type:
			| 'proposal'
			| 'acceptance'
			| 'rejection'
			| 'signing'
			| 'status_update'
			| 'progress_step_update'
			| 'note';
		message: string;
		createdBy: Types.ObjectId;
		createdAt: Date;
	}>;

	// Timestamps
	createdAt: Date;
	updatedAt: Date;
	completedAt?: Date;

	// Methods
	addActivity(
		type: string,
		message: string,
		createdBy: Types.ObjectId,
	): Promise<ICollaboration>;
	signContract(userId: Types.ObjectId): Promise<ICollaboration>;
	updateProgressStatus(
		targetStep:
			| 'proposal'
			| 'accepted'
			| 'visit_planned'
			| 'visit_completed'
			| 'negotiation'
			| 'offer_made'
			| 'compromise_signed'
			| 'final_act',
		notes: string,
		userId: Types.ObjectId,
	): Promise<ICollaboration>;
}

// ============================================================================
// SCHEMA DEFINITION
// ============================================================================

const collaborationSchema = new Schema<ICollaboration>(
	{
		propertyId: {
			type: Schema.Types.ObjectId,
			ref: 'Property',
			required: [true, 'Property ID is required'],
			index: true,
		},
		propertyOwnerId: {
			type: Schema.Types.ObjectId,
			ref: 'User',
			required: [true, 'Property owner ID is required'],
			index: true,
		},
		collaboratorId: {
			type: Schema.Types.ObjectId,
			ref: 'User',
			required: [true, 'Collaborator ID is required'],
			index: true,
		},
		status: {
			type: String,
			enum: {
				values: [
					'pending',
					'accepted',
					'active',
					'completed',
					'cancelled',
					'rejected',
				],
				message: 'Invalid collaboration status',
			},
			default: 'pending',
			index: true,
		},
		proposedCommission: {
			type: Number,
			required: [true, 'Proposed commission is required'],
			min: [1, 'Commission must be at least 1%'],
			max: [50, 'Commission cannot exceed 50%'],
		},
		proposalMessage: {
			type: String,
			required: [true, 'Proposal message is required'],
			maxlength: [500, 'Proposal message too long (max 500 characters)'],
		},
		ownerSigned: {
			type: Boolean,
			default: false,
		},
		ownerSignedAt: {
			type: Date,
		},
		collaboratorSigned: {
			type: Boolean,
			default: false,
		},
		collaboratorSignedAt: {
			type: Date,
		},
		contractText: {
			type: String,
		},
		additionalTerms: {
			type: String,
		},
		contractModified: {
			type: Boolean,
			default: false,
		},
		contractLastModifiedBy: {
			type: Schema.Types.ObjectId,
			ref: 'User',
		},
		contractLastModifiedAt: {
			type: Date,
		},
		currentStep: {
			type: String,
			enum: {
				values: ['proposal', 'contract_signing', 'active', 'completed'],
				message: 'Invalid collaboration step',
			},
			default: 'proposal',
		},
		currentProgressStep: {
			type: String,
			enum: {
				values: [
					'proposal',
					'accepted',
					'visit_planned',
					'visit_completed',
					'negotiation',
					'offer_made',
					'compromise_signed',
					'final_act',
				],
				message: 'Invalid progress step',
			},
			default: 'proposal',
		},
		progressSteps: [
			{
				id: {
					type: String,
					enum: [
						'proposal',
						'accepted',
						'visit_planned',
						'visit_completed',
						'negotiation',
						'offer_made',
						'compromise_signed',
						'final_act',
					],
					required: true,
				},
				completed: {
					type: Boolean,
					default: false,
				},
				completedAt: {
					type: Date,
				},
				notes: {
					type: String,
					maxlength: [500, 'Progress step note too long'],
				},
				completedBy: {
					type: Schema.Types.ObjectId,
					ref: 'User',
				},
			},
		],
		activities: [
			{
				type: {
					type: String,
					enum: [
						'proposal',
						'acceptance',
						'rejection',
						'signing',
						'status_update',
						'progress_step_update',
						'note',
					],
					required: true,
				},
				message: {
					type: String,
					required: true,
					maxlength: [500, 'Activity message too long'],
				},
				createdBy: {
					type: Schema.Types.ObjectId,
					ref: 'User',
					required: true,
				},
				createdAt: {
					type: Date,
					default: Date.now,
				},
			},
		],
		completedAt: {
			type: Date,
		},
	},
	{
		timestamps: true,
		collection: 'collaborations',
	},
);

// ============================================================================
// INDEXES
// ============================================================================

// Compound indexes for efficient queries
collaborationSchema.index({ propertyId: 1, status: 1 });
collaborationSchema.index({ propertyOwnerId: 1, status: 1 });
collaborationSchema.index({ collaboratorId: 1, status: 1 });
collaborationSchema.index(
	{ propertyId: 1, propertyOwnerId: 1, collaboratorId: 1 },
	{ unique: true },
);

// ============================================================================
// MIDDLEWARE
// ============================================================================

// Pre-save middleware to update currentStep based on status and signing
collaborationSchema.pre('save', function (next) {
	// Initialize progress steps if not exists
	if (!this.progressSteps || this.progressSteps.length === 0) {
		const steps: Array<
			| 'proposal'
			| 'accepted'
			| 'visit_planned'
			| 'visit_completed'
			| 'negotiation'
			| 'offer_made'
			| 'compromise_signed'
			| 'final_act'
		> = [
			'proposal',
			'accepted',
			'visit_planned',
			'visit_completed',
			'negotiation',
			'offer_made',
			'compromise_signed',
			'final_act',
		];
		this.progressSteps = steps.map((stepId) => ({
			id: stepId,
			completed: stepId === 'proposal', // First step is completed by default
			completedAt: stepId === 'proposal' ? new Date() : undefined,
		}));
		this.currentProgressStep = 'proposal';
	}

	// Update currentStep based on status and signing status
	if (this.status === 'accepted') {
		this.currentStep = 'contract_signing';
	} else if (this.status === 'active') {
		this.currentStep = 'active';
	} else if (this.status === 'completed') {
		this.currentStep = 'completed';
		if (!this.completedAt) {
			this.completedAt = new Date();
		}
	}

	// Auto-activate collaboration when both parties sign
	if (
		this.ownerSigned &&
		this.collaboratorSigned &&
		this.status === 'accepted'
	) {
		this.status = 'active';
		this.currentStep = 'active';
	}

	next();
});

// ============================================================================
// INSTANCE METHODS
// ============================================================================

collaborationSchema.methods.addActivity = function (
	type: string,
	message: string,
	createdBy: Types.ObjectId,
) {
	this.activities.push({
		type,
		message,
		createdBy,
		createdAt: new Date(),
	});
	return this.save();
};

collaborationSchema.methods.signContract = function (userId: Types.ObjectId) {
	const isOwner = this.propertyOwnerId.toString() === userId.toString();
	const isCollaborator = this.collaboratorId.toString() === userId.toString();

	if (!isOwner && !isCollaborator) {
		throw new Error('Unauthorized to sign this collaboration');
	}

	if (isOwner && !this.ownerSigned) {
		this.ownerSigned = true;
		this.ownerSignedAt = new Date();
		this.addActivity(
			'signing',
			'Contrat signé par le propriétaire',
			userId,
		);
	}

	if (isCollaborator && !this.collaboratorSigned) {
		this.collaboratorSigned = true;
		this.collaboratorSignedAt = new Date();
		this.addActivity(
			'signing',
			'Contrat signé par le collaborateur',
			userId,
		);
	}

	return this.save();
};

collaborationSchema.methods.updateProgressStatus = function (
	targetStep:
		| 'proposal'
		| 'accepted'
		| 'visit_planned'
		| 'visit_completed'
		| 'negotiation'
		| 'offer_made'
		| 'compromise_signed'
		| 'final_act',
	notes: string,
	userId: Types.ObjectId,
) {
	// Only allow progress updates while collaboration is active
	if (this.status !== 'active') {
		throw new Error(
			'Progress can only be updated for active collaborations',
		);
	}

	// Handle both populated and non-populated fields
	const ownerId = this.propertyOwnerId._id || this.propertyOwnerId;
	const collaboratorId = this.collaboratorId._id || this.collaboratorId;

	const isOwner = ownerId.toString() === userId.toString();
	const isCollaborator = collaboratorId.toString() === userId.toString();

	if (!isOwner && !isCollaborator) {
		throw new Error(
			'Unauthorized to update progress for this collaboration',
		);
	}

	const stepOrder: Array<
		| 'proposal'
		| 'accepted'
		| 'visit_planned'
		| 'visit_completed'
		| 'negotiation'
		| 'offer_made'
		| 'compromise_signed'
		| 'final_act'
	> = [
		'proposal',
		'accepted',
		'visit_planned',
		'visit_completed',
		'negotiation',
		'offer_made',
		'compromise_signed',
		'final_act',
	];

	const targetStepIndex = stepOrder.indexOf(targetStep);
	if (targetStepIndex === -1) {
		throw new Error('Invalid progress step');
	}

	// Update all steps up to and including the target step
	const currentTime = new Date();
	for (let i = 0; i <= targetStepIndex; i++) {
		const stepId = stepOrder[i];
		const existingStep = this.progressSteps.find(
			(s: {
				id: string;
				completed: boolean;
				completedAt?: Date;
				notes?: string;
				completedBy?: Types.ObjectId;
			}) => s.id === stepId,
		);

		if (existingStep) {
			if (!existingStep.completed) {
				existingStep.completed = true;
				existingStep.completedAt = currentTime;
				existingStep.completedBy = userId;

				// Add notes only to the target step
				if (i === targetStepIndex && notes) {
					existingStep.notes = notes;
				}
			}
		}
	}

	// Update current progress step
	this.currentProgressStep = targetStep;

	// Add activity for this update (without saving)
	const stepTitles = {
		proposal: 'Proposition',
		accepted: 'Acceptée',
		visit_planned: 'Visite prévue',
		visit_completed: 'Visite réalisée',
		negotiation: 'Négociation',
		offer_made: 'Offre déposée',
		compromise_signed: 'Compromis signé',
		final_act: 'Acte définitif',
	};

	const message = notes
		? `Statut mis à jour: ${stepTitles[targetStep]} - ${notes}`
		: `Statut mis à jour: ${stepTitles[targetStep]}`;

	// Add activity directly without calling addActivity method to avoid double save
	this.activities.push({
		type: 'progress_step_update',
		message,
		createdBy: userId,
		createdAt: new Date(),
	});

	return this.save();
};

// ============================================================================
// STATIC METHODS
// ============================================================================

collaborationSchema.statics.findActiveForProperty = function (
	propertyId: Types.ObjectId,
) {
	return this.findOne({
		propertyId,
		status: { $in: ['pending', 'accepted', 'active'] },
	});
};

collaborationSchema.statics.getCollaborationsForUser = function (
	userId: Types.ObjectId,
	status?: string,
) {
	const query: {
		$or: Array<{
			propertyOwnerId?: Types.ObjectId;
			collaboratorId?: Types.ObjectId;
		}>;
		status?: string;
	} = {
		$or: [{ propertyOwnerId: userId }, { collaboratorId: userId }],
	};

	if (status) {
		query.status = status;
	}

	return this.find(query)
		.populate('propertyId', 'title location price images')
		.populate('propertyOwnerId', 'firstName lastName email profileImage')
		.populate('collaboratorId', 'firstName lastName email profileImage')
		.sort({ updatedAt: -1 });
};

// ============================================================================
// EXPORT
// ============================================================================

export const Collaboration = mongoose.model<ICollaboration>(
	'Collaboration',
	collaborationSchema,
);
