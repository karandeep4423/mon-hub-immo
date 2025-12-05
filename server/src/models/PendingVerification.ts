import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IPendingVerification extends Document {
	firstName: string;
	lastName: string;
	email: string;
	password: string;
	phone?: string;
	userType: 'agent' | 'apporteur';
	identityCardTempKey?: string;
	// Agent professional info from signup
	agentType?: 'independent' | 'commercial' | 'employee';
	tCard?: string;
	sirenNumber?: string;
	rsacNumber?: string;
	collaboratorCertificate?: string;
	emailVerificationCode: string;
	emailVerificationExpires: Date;
	createdAt: Date;
}

const pendingVerificationSchema = new Schema<IPendingVerification>(
	{
		firstName: {
			type: String,
			required: [true, 'Prénom requis'],
			trim: true,
		},
		lastName: {
			type: String,
			required: [true, 'Nom requis'],
			trim: true,
		},
		email: {
			type: String,
			required: [true, 'Email requis'],
			unique: true,
			lowercase: true,
			trim: true,
			match: [
				/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
				'Email invalide',
			],
		},
		password: {
			type: String,
			required: [true, 'Mot de passe requis'],
		},
		phone: {
			type: String,
			trim: true,
		},
		userType: {
			type: String,
			enum: {
				values: ['agent', 'apporteur'],
				message: 'Type utilisateur invalide',
			},
			required: [true, 'Type utilisateur requis'],
		},
		identityCardTempKey: {
			type: String,
			trim: true,
		},
		agentType: {
			type: String,
			enum: ['independent', 'commercial', 'employee'],
			trim: true,
		},
		tCard: {
			type: String,
			trim: true,
		},
		sirenNumber: {
			type: String,
			trim: true,
		},
		rsacNumber: {
			type: String,
			trim: true,
		},
		collaboratorCertificate: {
			type: String,
			trim: true,
		},
		emailVerificationCode: {
			type: String,
			required: [true, 'Code de vérification requis'],
		},
		emailVerificationExpires: {
			type: Date,
			required: [true, 'Date expiration code requise'],
		},
		createdAt: {
			type: Date,
			default: Date.now,
			expires: 86400, // TTL: 24 hours (86400 seconds) - MongoDB auto-deletes after this
		},
	},
	{
		timestamps: true,
	},
);

// Index for faster email lookups
pendingVerificationSchema.index({ email: 1 });

// Index for verification code lookups
pendingVerificationSchema.index({ emailVerificationCode: 1 });

// Hash password before saving pending verification to avoid storing plaintext
pendingVerificationSchema.pre('save', async function (next) {
	if (!this.isModified('password')) return next();
	try {
		const salt = await bcrypt.genSalt(12);
		this.password = await bcrypt.hash(this.password, salt);
		next();
	} catch (err) {
		next(err as Error);
	}
});

export const PendingVerification = mongoose.model<IPendingVerification>(
	'PendingVerification',
	pendingVerificationSchema,
);
