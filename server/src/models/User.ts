import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone?: string;
    userType: 'agent' | 'apporteur' | 'partenaire';
    isEmailVerified: boolean;
    profileImage?: string;
    
    // Profile completion status
    profileCompleted: boolean;
    
    // Professional information for agents
    professionalInfo?: {
        postalCode?: string;
        city?: string;
        interventionRadius?: number; // in km
        coveredCities?: string[];
        network?: string; // IAD, Century21, etc.
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
}

const userSchema = new Schema<IUser>(
    {
        firstName: {
            type: String,
            required: [true, 'Prénom est requis'],
            trim: true,
            minlength: [2, 'Le prénom doit contenir au moins 2 caractères'],
            maxlength: [50, 'Le prénom doit contenir moins de 50 caractères'],
        },
        lastName: {
            type: String,
            required: [true, 'Nom est requis'],
            trim: true,
            minlength: [2, 'Le nom doit contenir au moins 2 caractères'],
            maxlength: [50, 'Le nom doit contenir moins de 50 caractères'],
        },
        email: {
            type: String,
            required: [true, 'Email est requis'],
            unique: true,
            lowercase: true,
            trim: true,
            match: [
                /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
                'Veuillez entrer un email valide',
            ],
        },
        password: {
            type: String,
            required: [true, 'Mot de passe est requis'],
            minlength: [6, 'Le mot de passe doit contenir au moins 6 caractères'],
            select: false,
        },
        phone: {
            type: String,
            trim: true,
            sparse: true,
        },
        userType: {
            type: String,
            enum: ['agent', 'apporteur', 'partenaire'],
            required: [true, 'Type d\'utilisateur est requis'],
        },
        isEmailVerified: {
            type: Boolean,
            default: false,
        },
        profileImage: {
            type: String,
            default: null,
        },
        profileCompleted: {
            type: Boolean,
            default: false,
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
            },
            interventionRadius: {
                type: Number,
                min: [1, 'Rayon d\'intervention minimum 1 km'],
                max: [200, 'Rayon d\'intervention maximum 200 km'],
                default: 20,
            },
            coveredCities: [{
                type: String,
                trim: true,
            }],
            network: {
                type: String,
                enum: ['IAD', 'Century21', 'Orpi', 'Independant', 'Autre'],
                default: 'IAD',
            },
            siretNumber: {
                type: String,
                trim: true,
                match: [/^[0-9]{14}$/, 'Numéro SIRET doit contenir 14 chiffres'],
            },
            mandateTypes: [{
                type: String,
                enum: ['simple', 'exclusif', 'co-mandat'],
            }],
            yearsExperience: {
                type: Number,
                min: [0, 'Années d\'expérience ne peut pas être négative'],
                max: [50, 'Années d\'expérience maximum 50 ans'],
            },
            personalPitch: {
                type: String,
                maxlength: [1000, 'Bio personnelle trop longue (max 1000 caractères)'],
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
                enum: ['quotidien', 'hebdomadaire'],
                default: 'quotidien',
            },
        },
        emailVerificationCode: {
            type: String,
            select: false,
        },
        emailVerificationExpires: {
            type: Date,
            select: false,
        },
        passwordResetCode: {
            type: String,
            select: false,
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
userSchema.index({ emailVerificationCode: 1 });
userSchema.index({ emailVerificationExpires: 1 });
userSchema.index({ userType: 1 });
userSchema.index({ profileCompleted: 1 });
userSchema.index({ 'professionalInfo.postalCode': 1 });
userSchema.index({ 'professionalInfo.city': 1 });

// Compound index for verification queries
userSchema.index({
    email: 1,
    emailVerificationCode: 1,
    emailVerificationExpires: 1,
});

// Compound index for geographic searches
userSchema.index({
    userType: 1,
    'professionalInfo.postalCode': 1,
    'professionalInfo.interventionRadius': 1,
});

// Hash password before saving
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

// Compare password method
userSchema.methods.comparePassword = async function (
    candidatePassword: string,
): Promise<boolean> {
    return bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.model<IUser>('User', userSchema);
