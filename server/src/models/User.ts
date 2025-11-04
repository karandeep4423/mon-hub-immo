import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
	firstName: string;
	lastName: string;
	email: string;
	password: string;
	phone?: string;
	userType: 'agent' | 'apporteur' | 'admin' ;
	isEmailVerified: boolean;
	profileImage?: string;
	lastSeen?: Date;

	// Profile completion status
	profileCompleted: boolean;

	// Professional information for agents
	professionalInfo?: {
		postalCode?: string;
		city?: string;
		interventionRadius?: number;
		coveredCities?: string[];
		network?: string;
		siretNumber?: string;
		mandateTypes?: ('simple' | 'exclusif' | 'co-mandat')[];
		yearsExperience?: number;
		personalPitch?: string;
		collaborateWithAgents?: boolean;
		shareCommission?: boolean;
		independentAgent?: boolean;
		alertsEnabled?: boolean;
		alertFrequency?: 'quotidien' | 'hebdomadaire';
	};

	// Email verification
	emailVerificationCode?: string;
	emailVerificationExpires?: Date;

	// Password reset
	passwordResetCode?: string;
	passwordResetExpires?: Date;

	createdAt: Date;
	updatedAt: Date;
	comparePassword(candidatePassword: string): Promise<boolean>;

	accountLockedUntil?: Date;
	failedLoginAttempts?: number;
	passwordHistory?: string[];
	identityCard?: {
		number?: string;
		issuedBy?: string;
		issuedDate?: Date;
	};
	searchPreferences?: {
		preferredRadius?: number;
		lastSearchLocations?: string[];
	};
}

const userSchema = new Schema<IUser>(
	{
		accountLockedUntil: { type: Date, default: null },
		failedLoginAttempts: { type: Number, default: 0 },
		passwordHistory: [{ type: String }],
		identityCard: {
		number: String,
		issuedBy: String,
		issuedDate: Date,
		},
		searchPreferences: {
		preferredRadius: { type: Number, default: 20 },
		lastSearchLocations: [String],
		},
		firstName: {
			type: String,
			trim: true,
		},
		lastName: {
			type: String,
			trim: true,
		},
		email: {
			type: String,
			unique: true,
			lowercase: true,
			trim: true,
		},
		password: {
			type: String,
			select: false,
		},
		phone: {
			type: String,
			trim: true,
		},
		userType: {
		type: String,
		enum: {
			values: ['agent', 'apporteur', 'admin'],
			message: 'Type d\'utilisateur invalide',
		},
		required: [true, 'Le type d\'utilisateur est requis'],
		},
		isEmailVerified: {
			type: Boolean,
			default: false,
		},
		profileImage: {
			type: String,
			default: null,
			maxlength: [500, "URL de l'image trop longue"],
			validate: {
				validator: function (url: string) {
					if (!url) return true;
					try {
						new URL(url);
						return (
							url.startsWith('http://') ||
							url.startsWith('https://')
						);
					} catch {
						return false;
					}
				},
				message: "URL de l'image invalide",
			},
		},
		profileCompleted: {
			type: Boolean,
			default: false,
		},
		lastSeen: {
			type: Date,
			default: null,
		},
		professionalInfo: {
			postalCode: {
				type: String,
				trim: true,
				match: [/^[0-9]{5}$/, 'Code postal doit contenir 5 chiffres'],
			},
			city: {
				type: String,
				trim: true,
				maxlength: [100, 'Nom de ville trop long'],
				match: [
					/^[a-zA-ZÀ-ÿ\u0100-\u017F\s'-]+$/,
					'Nom de ville invalide',
				],
			},
			interventionRadius: {
				type: Number,
				min: [1, "Rayon d'intervention minimum 1 km"],
				max: [200, "Rayon d'intervention maximum 200 km"],
				default: 20,
			},
			coveredCities: [
				{
					type: String,
					trim: true,
					maxlength: [100, 'Nom de ville trop long'],
					match: [
						/^[a-zA-ZÀ-ÿ\u0100-\u017F\s'-]+$/,
						'Nom de ville invalide',
					],
				},
			],
			network: {
				type: String,
				enum: {
					values: [
						'IAD',
						'Century21',
						'Orpi',
						'Independant',
						'Autre',
					],
					message: 'Réseau invalide',
				},
				default: 'IAD',
			},
			siretNumber: {
				type: String,
				trim: true,
				match: [
					/^[0-9]{14}$/,
					'Numéro SIRET doit contenir 14 chiffres',
				],
			},
			mandateTypes: [
				{
					type: String,
					enum: {
						values: ['simple', 'exclusif', 'co-mandat'],
						message: 'Type de mandat invalide',
					},
				},
			],
			yearsExperience: {
				type: Number,
				min: [0, "Années d'expérience ne peut pas être négative"],
				max: [50, "Années d'expérience maximum 50 ans"],
			},
			personalPitch: {
				type: String,
				maxlength: [
					1000,
					'Bio personnelle trop longue (max 1000 caractères)',
				],
			},
			collaborateWithAgents: {
				type: Boolean,
				default: true,
			},
			shareCommission: {
				type: Boolean,
				default: false,
			},
			independentAgent: {
				type: Boolean,
				default: false,
			},
			alertsEnabled: {
				type: Boolean,
				default: false,
			},
			alertFrequency: {
				type: String,
				enum: {
					values: ['quotidien', 'hebdomadaire'],
					message: "Fréquence d'alerte invalide",
				},
				default: 'quotidien',
			},
		},
		emailVerificationCode: {
			type: String,
			select: false,
			match: [/^[0-9]{6}$/, 'Code de vérification invalide'],
		},
		emailVerificationExpires: {
			type: Date,
			select: false,
		},
		passwordResetCode: {
			type: String,
			select: false,
			match: [/^[0-9]{6}$/, 'Code de réinitialisation invalide'],
		},
		passwordResetExpires: {
			type: Date,
			select: false,
		},
	},
	{
		timestamps: true,
	},
);

// Indexes for performance
// 'email' already has `unique: true` on the schema path, so we don't redeclare it here to avoid duplicate index warnings
userSchema.index({ emailVerificationCode: 1 });
userSchema.index({ emailVerificationExpires: 1 });
userSchema.index({ passwordResetCode: 1 });
userSchema.index({ passwordResetExpires: 1 });
userSchema.index({ userType: 1 });
userSchema.index({ profileCompleted: 1 });
userSchema.index({ 'professionalInfo.postalCode': 1 });
userSchema.index({ 'professionalInfo.city': 1 });

// Compound indexes
userSchema.index({
	email: 1,
	emailVerificationCode: 1,
	emailVerificationExpires: 1,
});

userSchema.index({
	userType: 1,
	'professionalInfo.postalCode': 1,
	'professionalInfo.interventionRadius': 1,
});

// Pre-save middleware for password hashing
userSchema.pre('save', async function (next) {
	if (!this.isModified('password')) return next();

	try {
		const salt = await bcrypt.genSalt(12);
		this.password = await bcrypt.hash(this.password, salt);
		next();
	} catch (error) {
		next(error as Error);
	}
});

// Pre-save middleware for phone number normalization
userSchema.pre('save', function (next) {
	if (this.phone) {
		this.phone = this.phone.replace(/\s+/g, '').replace(/^(\+33)/, '0');
	}
	next();
});

// Compare password method
userSchema.methods.comparePassword = async function (
	candidatePassword: string,
): Promise<boolean> {
	return bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.model<IUser>('User', userSchema);
