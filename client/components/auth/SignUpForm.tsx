'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { authService } from '@/lib/auth';
import { signUpSchema, type SignUpFormData } from '@/lib/validation';
import { AUTH_TEXT } from '@/lib/constants/text';
import { ZodError } from 'zod';

export const SignUpForm: React.FC = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<SignUpFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    userType: '',
    password: '',
    confirmPassword: '',
    // Agent-specific fields
    agentType: '',
    tCard: '',
    sirenNumber: '',
    rsacNumber: '',
    collaboratorCertificate: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [step, setStep] = useState(1); // Étapes : 1 = Infos perso, 2 = Type, 3 = Détails pro, 4 = Mot de passe

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;

    // If userType changes and it's not 'agent', clear agent fields and jump to step 4 if "Apporteur"
    if (name === 'userType') {
      if (value === 'apporteur') {
        setFormData((prev) => ({
          ...prev,
          [name]: value,
          agentType: '',
          tCard: '',
          sirenNumber: '',
          rsacNumber: '',
          collaboratorCertificate: '',
        }));
        setStep(4); // Jump to step 4 if Apporteur is selected
      } else if (value !== 'agent') {
        setFormData((prev) => ({
          ...prev,
          [name]: value,
          agentType: '',
          tCard: '',
          sirenNumber: '',
          rsacNumber: '',
          collaboratorCertificate: '',
        }));
      } else {
        setFormData((prev) => ({ ...prev, [name]: value }));
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    // Clear field error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }

    // Clear confirm password error when password changes
    if (name === 'password' && errors.confirmPassword) {
      setErrors((prev) => ({ ...prev, confirmPassword: '' }));
    }

    // Clear confirm password error when confirm password changes and matches
    if (
      name === 'confirmPassword' &&
      errors.confirmPassword &&
      value === formData.password
    ) {
      setErrors((prev) => ({ ...prev, confirmPassword: '' }));
    }
  };

  const validateForm = () => {
    try {
      signUpSchema.parse(formData);
      return {};
    } catch (error) {
      if (error instanceof ZodError) {
        const newErrors: Record<string, string> = {};
        error.issues.forEach((err) => {
          if (err.path.length > 0) {
            newErrors[err.path[0] as string] = err.message;
          }
        });
        return newErrors;
      }
      return {};
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      setLoading(true);

      // Parse and transform data with Zod before sending
      const validatedData = signUpSchema.parse(formData);

      const response = await authService.signUp({
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        email: validatedData.email,
        phone: validatedData.phone,
        password: validatedData.password,
        confirmPassword: validatedData.confirmPassword,
        userType: validatedData.userType as '' | 'agent' | 'apporteur',
      });

      if (response.success) {
        toast.success(AUTH_TEXT.signupSuccess);
        router.push(
          `/auth/verify-email?email=${encodeURIComponent(validatedData.email)}&redirect=profile`,
        );
      } else {
        toast.error(response.message);
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      if (error instanceof ZodError) {
        const newErrors: Record<string, string> = {};
        error.issues.forEach((err) => {
          if (err.path.length > 0) {
            newErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(newErrors);
      } else if (error.response?.data?.errors) {
        const backendErrors: Record<string, string> = {};
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        error.response.data.errors.forEach((err: any) => {
          const field = err.path || err.param;
          backendErrors[field] = err.msg || err.message;
        });
        setErrors(backendErrors);
      } else {
        toast.error(
          error.response?.data?.message ||
            AUTH_TEXT.somethingWentWrong,
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrengthColor = () => {
    if (!formData.password) return 'bg-gray-200';
    if (formData.password.length < 6) return 'bg-red-400';
    if (formData.password.length < 8) return 'bg-yellow-400';
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password))
      return 'bg-yellow-400';
    return 'bg-green-400';
  };

  const getPasswordStrengthText = () => {
    if (!formData.password) return '';
    if (formData.password.length < 6) return 'Faible';
    if (formData.password.length < 8) return 'Moyen';
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password))
      return 'Moyen';
    return 'Fort';
  };

  const nextStep = () => {
    if (step === 1 && (!formData.lastName || !formData.firstName || !formData.email || !formData.phone)) {
      setErrors({
        lastName: !formData.lastName ? 'Le nom est requis' : '',
        firstName: !formData.firstName ? 'Le prénom est requis' : '',
        email: !formData.email ? 'L\'e-mail est requis' : '',
        phone: !formData.phone ? 'Le téléphone est requis' : '',
      });
      return;
    }
    if (step === 2 && !formData.userType) {
      setErrors({ userType: 'Le type d\'utilisateur est requis' });
      return;
    }
    if (step === 3 && formData.userType === 'agent' && !formData.agentType) {
      setErrors({ agentType: 'Le type d\'agent est requis' });
      return;
    }
    setStep(step + 1);
    setErrors({});
  };

  const prevStep = () => {
    setStep(step - 1);
    setErrors({});
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-start relative overflow-hidden">
      {/* Back Arrow */}
      <button
        onClick={() => router.push('/')}
        className="absolute top-40 left-8 w-12 h-12 bg-cyan-500 text-white rounded-full flex items-center justify-center hover:bg-cyan-600 transition-colors duration-200 shadow-md"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M10 19l-7-7m0 0l7-7m-7 7h18"
          />
        </svg>
      </button>

      {/* Header */}
      <div className="text-center pt-24 pb-12 px-6 z-10 w-full">
        <h6 className="text-3xl font-extrabold text-gray-900 mb-2 leading-tight">
          Commençons à écrire votre nouvelle histoire
        </h6>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Remplissez vos coordonnées pour être mis en relation
        </p>
        <div className="mt-6 flex justify-center space-x-6">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold ${
                step === s ? 'bg-cyan-500' : 'bg-gray-200'
              } transition-all duration-300`}
            >
              {s}
            </div>
          ))}
        </div>
      </div>

      {/* Form */}
      <div className="flex-1 px-6 pb-12 w-full z-10">
        <form onSubmit={handleSubmit} className="space-y-6">
          {step === 1 && (
            <>
              <div className="w-full max-w-2xl mx-auto">
                <label className="block text-lg font-medium text-gray-700 mb-1">Nom *</label>
                <Input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  error={errors.lastName}
                  placeholder="Entrez votre nom *"
                  required
                  className="w-full border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-300 py-4 px-6 text-lg text-gray-900 placeholder-gray-400"
                />
              </div>
              <div className="w-full max-w-2xl mx-auto">
                <label className="block text-lg font-medium text-gray-700 mb-1">Prénom *</label>
                <Input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  error={errors.firstName}
                  placeholder="Entrez votre prénom *"
                  required
                  className="w-full border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-300 py-4 px-6 text-lg text-gray-900 placeholder-gray-400"
                />
              </div>
              <div className="w-full max-w-2xl mx-auto">
                <label className="block text-lg font-medium text-gray-700 mb-1">E-mail *</label>
                <Input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  error={errors.email}
                  placeholder="Entrez votre e-mail *"
                  required
                  className="w-full border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-300 py-4 px-6 text-lg text-gray-900 placeholder-gray-400"
                />
              </div>
              <div className="w-full max-w-2xl mx-auto">
                <label className="block text-lg font-medium text-gray-700 mb-1">Téléphone *</label>
                <Input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  error={errors.phone}
                  placeholder="Entrez votre téléphone * (ex: 0123456789)"
                  required
                  className="w-full border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-300 py-4 px-6 text-lg text-gray-900 placeholder-gray-400"
                />
              </div>
            </>
          )}

          {step === 2 && (
            <div className="w-full max-w-2xl mx-auto text-center">
              <label
                htmlFor="userType"
                className="block text-lg font-medium text-gray-700 mb-4"
              >
                Je suis un(e)
              </label>
              <select
                id="userType"
                name="userType"
                value={formData.userType}
                onChange={handleChange}
                className="w-full px-6 py-4 border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-300 text-lg text-gray-900 bg-white text-center"
                required
              >
                <option value="" disabled className="text-gray-400">
                  Choisissez votre rôle
                </option>
                <option value="apporteur" className="text-gray-900">
                  Apporteur d'affaires
                </option>
                <option value="agent" className="text-gray-900">
                  Agent immobilier
                </option>
             
              </select>
              {errors.userType && (
                <p className="mt-3 text-lg text-red-600">{errors.userType}</p>
              )}
            </div>
          )}

          {step === 3 && formData.userType === 'agent' && (
				<div className="space-y-6 text-center">
					<label
						htmlFor="agentType"
						className="block text-lg font-medium text-gray-700 mb-4"
					>
						Type d'agent immobilier *
					</label>
					<select
						id="agentType"
						name="agentType"
						value={formData.agentType}
						onChange={handleChange}
						className="w-full max-w-2xl mx-auto px-6 py-4 border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-300 text-lg text-gray-900 bg-white text-center"
						required
					>
						<option value="" disabled className="text-gray-400">
						Choisissez votre type d'agent
						</option>
						<option value="independent" className="text-gray-900">
						Agent immobilier indépendant
						</option>
						<option value="commercial" className="text-gray-900">
						Agent commercial immobilier
						</option>
						<option value="employee" className="text-gray-900">
						Négociateur VRP employé d'agence
						</option>
					</select>
					{errors.agentType && (
						<p className="mt-3 text-lg text-red-600">{errors.agentType}</p>
					)}

					{formData.agentType === 'independent' && (
						<div className="space-y-6 text-center">
						<div className="w-full max-w-2xl mx-auto">
							<label className="block text-lg font-medium text-gray-700 mb-1">Carte professionnelle (T card)</label>
							<Input
							type="text"
							name="tCard"
							value={formData.tCard}
							onChange={handleChange}
							error={errors.tCard}
							placeholder="Numéro de carte T (optionnel)"
							className="w-full border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-300 py-4 px-6 text-lg text-gray-900 placeholder-gray-400"
							/>
						</div>
						<div className="w-full max-w-2xl mx-auto">
							<label className="block text-lg font-medium text-gray-700 mb-1">Numéro SIREN</label>
							<Input
							type="text"
							name="sirenNumber"
							value={formData.sirenNumber}
							onChange={handleChange}
							error={errors.sirenNumber}
							placeholder="Numéro SIREN (optionnel)"
							className="w-full border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-300 py-4 px-6 text-lg text-gray-900 placeholder-gray-400"
							/>
						</div>
						<p className="text-lg text-gray-600">
							* Veuillez fournir au moins une carte T ou un numéro SIREN
						</p>
						</div>
					)}

					{formData.agentType === 'commercial' && (
						<div className="space-y-6 text-center">
						<div className="w-full max-w-2xl mx-auto">
							<label className="block text-lg font-medium text-gray-700 mb-1">Numéro SIREN</label>
							<Input
							type="text"
							name="sirenNumber"
							value={formData.sirenNumber}
							onChange={handleChange}
							error={errors.sirenNumber}
							placeholder="Numéro SIREN (optionnel)"
							className="w-full border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-300 py-4 px-6 text-lg text-gray-900 placeholder-gray-400"
							/>
						</div>
						<div className="w-full max-w-2xl mx-auto">
							<label className="block text-lg font-medium text-gray-700 mb-1">{AUTH_TEXT.rsacNumber}</label>
							<Input
							type="text"
							name="rsacNumber"
							value={formData.rsacNumber}
							onChange={handleChange}
							error={errors.rsacNumber}
							placeholder="Numéro RSAC (optionnel)"
							className="w-full border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-300 py-4 px-6 text-lg text-gray-900 placeholder-gray-400"
							/>
						</div>
						<p className="text-lg text-gray-600">
							* Veuillez fournir au moins un numéro SIREN ou RSAC
						</p>
						</div>
					)}

					{formData.agentType === 'employee' && (
						<div className="w-full max-w-2xl mx-auto text-center">
						<label className="block text-lg font-medium text-gray-700 mb-1">Certificat d'autorisation de l'employeur</label>
						<Input
							type="text"
							name="collaboratorCertificate"
							value={formData.collaboratorCertificate}
							onChange={handleChange}
							error={errors.collaboratorCertificate}
							placeholder="Référence du certificat collaborateur"
							className="w-full border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-300 py-4 px-6 text-lg text-gray-900 placeholder-gray-400"
						/>
						<p className="text-lg text-gray-600 mt-4">
							* Certificat d'autorisation de votre employeur ou certificat de collaborateur requis
						</p>
						</div>
					)}
					</div>
          )}

          {step === 4 && (
            <>
              <div className="w-full max-w-2xl mx-auto relative">
                <label className="block text-lg font-medium text-gray-700 mb-1">Mot de passe *</label>
                <Input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  error={errors.password}
                  placeholder="Entrez votre mot de passe *"
                  required
                  className="w-full border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-300 py-4 px-6 text-lg text-gray-900 placeholder-gray-400 pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  )}
                </button>
              </div>

              {/* Password Strength Indicator */}
              {formData.password && (
                <div className="space-y-3 w-full max-w-2xl mx-auto">
                  <div className="flex items-center space-x-4">
                    <div className="flex-1 bg-gray-200 rounded-lg h-3">
                      <div
                        className={`h-3 rounded-lg transition-all duration-300 ${getPasswordStrengthColor()}`}
                        style={{
                          width:
                            formData.password.length < 6
                              ? '33%'
                              : formData.password.length < 8
                              ? '66%'
                              : !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(
                                  formData.password,
                                )
                              ? '66%'
                              : '100%',
                        }}
                      ></div>
                    </div>
                    <span className="text-lg font-medium text-gray-700">
                      {getPasswordStrengthText()}
                    </span>
                  </div>
                  <p className="text-lg text-gray-500">
                    Minimum 8 caractères, 1 majuscule, 1 minuscule, 1 chiffre
                  </p>
                </div>
              )}

              <div className="w-full max-w-2xl mx-auto relative">
                <label className="block text-lg font-medium text-gray-700 mb-1">Confirmer le mot de passe *</label>
                <Input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  error={errors.confirmPassword}
                  placeholder="Confirmez votre mot de passe *"
                  required
                  className="w-full border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-300 py-4 px-6 text-lg text-gray-900 placeholder-gray-400 pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showConfirmPassword ? (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  )}
                </button>
              </div>

              {/* Password Match Indicator */}
              {formData.confirmPassword && (
                <div className="flex items-center space-x-4 w-full max-w-2xl mx-auto">
                  {formData.password === formData.confirmPassword ? (
                    <>
                      <svg
                        className="w-6 h-6 text-green-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span className="text-lg font-medium text-green-600">
                        Les mots de passe correspondent
                      </span>
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-6 h-6 text-red-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                      <span className="text-lg font-medium text-red-600">
                        Les mots de passe ne correspondent pas
                      </span>
                    </>
                  )}
                </div>
              )}
            </>
          )}

          <hr className="border-gray-300 my-6" />
          <div className="flex justify-between mt-6 px-6">
            {step > 1 && (
              <Button
                onClick={prevStep}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 px-8 rounded-lg transition-all duration-300   font-medium"
              >
                Précédent
              </Button>
            )}
            <div className="flex-1" />
            {step < 4 ? (
              <Button
                onClick={nextStep}
                className="bg-cyan-500 hover:bg-cyan-600 text-white py-3 px-8 rounded-lg transition-all duration-300   font-medium"
              >
                Suivant
              </Button>
            ) : (
              <Button
                type="submit"
                loading={loading}
                className="bg-cyan-500 hover:bg-cyan-600 text-white py-3 px-8 rounded-lg transition-all duration-300  font-medium"
              >
                Créer mon compte
              </Button>
            )}
          </div>
        </form>

        <div className="text-center mt-8 px-6">
          <p className="text-lg text-gray-500">
            En créant un compte, vous acceptez nos{' '}
            <a href="#" className="text-cyan-500 hover:underline">
              conditions d'utilisation
            </a>
          </p>
        </div>

        <div className="text-center mt-6 px-6">
          <button
            type="button"
            onClick={() => router.push('/auth/login')}
            className="text-cyan-600 hover:text-cyan-500 font-medium text-lg transition-colors duration-200"
          >
            Déjà inscrit ? Se connecter
          </button>
        </div>
      </div>

      {/* Decorative Background */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-cyan-100 rounded-full -translate-x-1/3 -translate-y-1/3 opacity-30 blur-xl animate-pulse"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-200 rounded-full translate-x-1/3 translate-y-1/3 opacity-30 blur-xl animate-pulse delay-1000"></div>
    </div>
  );
};