export interface AuthResponse {
  success: boolean;
  message: string;
  user?: User;
  token?: string;
  requiresVerification?: boolean;
  codeSent?: boolean;
  requiresProfileCompletion?: boolean; // Add this
  errors?: ValidationError[];
}

// Update User interface
export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  userType: 'agent' | 'apporteur' | 'partenaire';
  isEmailVerified: boolean;
  profileImage?: string;
  profileCompleted: boolean; // Make sure this is included
  
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
  
  createdAt?: string;
  updatedAt?: string;
}


export interface AuthResponse {
  success: boolean;
  message: string;
  user?: User;
  token?: string;
  requiresVerification?: boolean;
  codeSent?: boolean;
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface SignUpData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  userType: 'buyer' | 'seller' | 'agent';
}

export interface LoginData {
  email: string;
  password: string;
}

export interface VerifyEmailData {
  email: string;
  code: string;
}

export interface ForgotPasswordData {
  email: string;
}

export interface ResetPasswordData {
  email: string;
  code: string;
  newPassword: string;
}
