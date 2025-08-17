import { body} from 'express-validator';

// Base validation rules
const baseRules = {
  firstName: body('firstName')
    .trim()
    .escape() // Prevent XSS
    .isLength({ min: 2, max: 50 })
    .withMessage('Le prénom doit contenir entre 2 et 50 caractères')
    .matches(/^[a-zA-ZÀ-ÿ\u0100-\u017F\s'-]+$/) // Support French accents
    .withMessage('Le prénom ne peut contenir que des lettres, espaces, apostrophes et tirets'),

  lastName: body('lastName')
    .trim()
    .escape()
    .isLength({ min: 2, max: 50 })
    .withMessage('Le nom doit contenir entre 2 et 50 caractères')
    .matches(/^[a-zA-ZÀ-ÿ\u0100-\u017F\s'-]+$/)
    .withMessage('Le nom ne peut contenir que des lettres, espaces, apostrophes et tirets'),

  email: body('email')
    .trim()
    .isEmail()
    .withMessage('Veuillez fournir une adresse email valide')
    .normalizeEmail({
      gmail_remove_dots: false,
      gmail_remove_subaddress: false,
      outlookdotcom_remove_subaddress: false,
      yahoo_remove_subaddress: false
    })
    .isLength({ max: 254 }) // RFC 5321 limit
    .withMessage('L\'email ne peut pas dépasser 254 caractères'),

  password: body('password')
    .isLength({ min: 8, max: 128 }) // Increased minimum to match frontend
    .withMessage('Le mot de passe doit contenir entre 8 et 128 caractères')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])?.*$/)
    .withMessage('Le mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre'),

  // French phone number validation
  phone: body('phone')
    .optional({ checkFalsy: true })
    .trim()
    .matches(/^(?:(?:\+33|0)[1-9])(?:[0-9]{8})$/)
    .withMessage('Veuillez fournir un numéro de téléphone français valide')
    .customSanitizer((value) => {
      if (!value) return value;
      // Normalize phone format
      return value.replace(/\s+/g, '').replace(/^(\+33)/, '0');
    }),

  userType: body('userType')
    .optional()
    .isIn(['agent', 'apporteur'])
    .withMessage('Le type d\'utilisateur doit être "agent" ou "apporteur"'),
};

// Professional info validation rules
const professionalInfoRules = {
  postalCode: body('professionalInfo.postalCode')
    .optional()
    .trim()
    .matches(/^[0-9]{5}$/)
    .withMessage('Le code postal doit contenir exactement 5 chiffres'),

  city: body('professionalInfo.city')
    .optional()
    .trim()
    .escape()
    .isLength({ min: 2, max: 100 })
    .withMessage('Le nom de la ville doit contenir entre 2 et 100 caractères')
    .matches(/^[a-zA-ZÀ-ÿ\u0100-\u017F\s'-]+$/)
    .withMessage('Le nom de la ville ne peut contenir que des lettres, espaces, apostrophes et tirets'),

  interventionRadius: body('professionalInfo.interventionRadius')
    .optional()
    .isInt({ min: 1, max: 200 })
    .withMessage('Le rayon d\'intervention doit être entre 1 et 200 km')
    .toInt(),

  network: body('professionalInfo.network')
    .optional()
    .isIn(['IAD', 'Century21', 'Orpi', 'Independant', 'Autre'])
    .withMessage('Réseau invalide'),

  siretNumber: body('professionalInfo.siretNumber')
    .optional()
    .trim()
    .matches(/^[0-9]{14}$/)
    .withMessage('Le numéro SIRET doit contenir exactement 14 chiffres'),

  yearsExperience: body('professionalInfo.yearsExperience')
    .optional()
    .isInt({ min: 0, max: 50 })
    .withMessage('Les années d\'expérience doivent être entre 0 et 50')
    .toInt(),

  personalPitch: body('professionalInfo.personalPitch')
    .optional()
    .trim()
    .escape()
    .isLength({ max: 1000 })
    .withMessage('La présentation personnelle ne peut pas dépasser 1000 caractères'),

  mandateTypes: body('professionalInfo.mandateTypes')
    .optional()
    .isArray()
    .withMessage('Les types de mandat doivent être un tableau')
    .custom((value) => {
      if (!Array.isArray(value)) return false;
      const validTypes = ['simple', 'exclusif', 'co-mandat'];
      return value.every(type => validTypes.includes(type));
    })
    .withMessage('Types de mandat invalides'),

  coveredCities: body('professionalInfo.coveredCities')
    .optional()
    .isArray()
    .withMessage('Les villes couvertes doivent être un tableau')
    .custom((value) => {
      if (!Array.isArray(value)) return false;
      return value.every(city => 
        typeof city === 'string' && 
        city.length >= 2 && 
        city.length <= 100 &&
        /^[a-zA-ZÀ-ÿ\u0100-\u017F\s'-]+$/.test(city)
      );
    })
    .withMessage('Noms de villes invalides'),

  collaborateWithAgents: body('professionalInfo.collaborateWithAgents')
    .optional()
    .isBoolean()
    .withMessage('La collaboration avec les agents doit être un booléen')
    .toBoolean(),

  shareCommission: body('professionalInfo.shareCommission')
    .optional()
    .isBoolean()
    .withMessage('Le partage de commission doit être un booléen')
    .toBoolean(),

  independentAgent: body('professionalInfo.independentAgent')
    .optional()
    .isBoolean()
    .withMessage('Agent indépendant doit être un booléen')
    .toBoolean(),

  alertsEnabled: body('professionalInfo.alertsEnabled')
    .optional()
    .isBoolean()
    .withMessage('Les alertes activées doivent être un booléen')
    .toBoolean(),

  alertFrequency: body('professionalInfo.alertFrequency')
    .optional()
    .isIn(['quotidien', 'hebdomadaire'])
    .withMessage('La fréquence d\'alerte doit être "quotidien" ou "hebdomadaire"'),
};

// Combined validation schemas
export const signupValidation = [
  baseRules.firstName,
  baseRules.lastName,
  baseRules.email,
  baseRules.password,
  baseRules.phone,
  baseRules.userType,
];

export const loginValidation = [
  baseRules.email,
  body('password')
    .notEmpty()
    .withMessage('Le mot de passe est requis')
    .isLength({ min: 1 })
    .withMessage('Le mot de passe ne peut pas être vide'),
];

export const updateProfileValidation = [
  body('firstName')
    .optional()
    .trim()
    .escape()
    .isLength({ min: 2, max: 50 })
    .withMessage('Le prénom doit contenir entre 2 et 50 caractères')
    .matches(/^[a-zA-ZÀ-ÿ\u0100-\u017F\s'-]+$/)
    .withMessage('Le prénom ne peut contenir que des lettres, espaces, apostrophes et tirets'),

  body('lastName')
    .optional()
    .trim()
    .escape()
    .isLength({ min: 2, max: 50 })
    .withMessage('Le nom doit contenir entre 2 et 50 caractères')
    .matches(/^[a-zA-ZÀ-ÿ\u0100-\u017F\s'-]+$/)
    .withMessage('Le nom ne peut contenir que des lettres, espaces, apostrophes et tirets'),

  body('phone')
    .optional({ checkFalsy: true })
    .trim()
    .matches(/^(?:(?:\+33|0)[1-9])(?:[0-9]{8})$/)
    .withMessage('Veuillez fournir un numéro de téléphone français valide'),

  body('profileImage')
    .optional({ checkFalsy: true })
    .isURL({ protocols: ['http', 'https'], require_protocol: true })
    .withMessage('L\'image de profil doit être une URL valide')
    .isLength({ max: 500 })
    .withMessage('L\'URL de l\'image ne peut pas dépasser 500 caractères'),
];

export const verifyEmailValidation = [
  baseRules.email,
  body('code')
    .trim()
    .isLength({ min: 6, max: 6 })
    .withMessage('Le code de vérification doit contenir exactement 6 chiffres')
    .isNumeric()
    .withMessage('Le code de vérification ne peut contenir que des chiffres'),
];

export const forgotPasswordValidation = [
  baseRules.email,
];

export const resetPasswordValidation = [
  baseRules.email,
  body('code')
    .trim()
    .isLength({ min: 6, max: 6 })
    .withMessage('Le code de réinitialisation doit contenir exactement 6 chiffres')
    .isNumeric()
    .withMessage('Le code de réinitialisation ne peut contenir que des chiffres'),
  body('newPassword')
    .isLength({ min: 8, max: 128 })
    .withMessage('Le mot de passe doit contenir entre 8 et 128 caractères')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])?.*$/)
    .withMessage('Le mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre'),
];

export const completeProfileValidation = [
  professionalInfoRules.postalCode,
  professionalInfoRules.city,
  professionalInfoRules.interventionRadius,
  professionalInfoRules.network,
  professionalInfoRules.siretNumber,
  professionalInfoRules.yearsExperience,
  professionalInfoRules.personalPitch,
  professionalInfoRules.mandateTypes,
  professionalInfoRules.coveredCities,
  professionalInfoRules.collaborateWithAgents,
  professionalInfoRules.shareCommission,
  professionalInfoRules.independentAgent,
  professionalInfoRules.alertsEnabled,
  professionalInfoRules.alertFrequency,
];

export const resendVerificationValidation = [
  baseRules.email,
];
