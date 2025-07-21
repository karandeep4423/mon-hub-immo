'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'react-toastify';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useAuth } from '@/hooks/useAuth';
import { authService } from '@/lib/auth';
import { loginSchema } from '@/lib/validation';
import { LoginData } from '@/types/auth';
import Link from 'next/link';

export const LoginWithUserType: React.FC = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { login, user, loading: authLoading } = useAuth(); // Assuming useAuth provides loading state

    const [selectedUserType, setSelectedUserType] = useState('agent');
    const [loading, setLoading] = useState(false);
    const [isRedirecting, setIsRedirecting] = useState(false);
    const [formData, setFormData] = useState<LoginData>({
        email: '',
        password: '',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        const typeFromUrl = searchParams.get('type');
        if (typeFromUrl) {
            setSelectedUserType(typeFromUrl);
        }
    }, [searchParams]);

    // Handle redirect if user is already authenticated
    useEffect(() => {
        if (!authLoading && user && !isRedirecting) {
            setIsRedirecting(true);
            router.push('/home');
        }
    }, [user, authLoading, router, isRedirecting]);

    // Show loading state while checking auth or redirecting
    if (authLoading || isRedirecting) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">
                        {isRedirecting ? 'Redirection...' : 'Chargement...'}
                    </p>
                </div>
            </div>
        );
    }

    // Don't render the form if user is authenticated (additional safety check)
    if (user) {
        return null;
    }

    const userTypes = [
        { id: 'agent', icon: '👤', title: 'Agent Immobilier' },
        { id: 'apporteur', icon: '💝', title: "Apporteur d'affaires" },
        { id: 'partenaire', icon: '🏢', title: 'Accès Partenaire' },
    ];

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: '' }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});

        try {
            loginSchema.parse(formData);
            setLoading(true);

            const response = await authService.login({
                ...formData,
            });

            if (response.success && response.token && response.user) {
                login(response.token, response.user);
                toast.success(response.message);

                if (response.requiresProfileCompletion) {
                    router.push('/home');
                } else {
                    router.push('/dashboard');
                }
            } else if (response.requiresVerification) {
                toast.warning(response.message);
                router.push(
                    `/auth/verify-email?email=${encodeURIComponent(formData.email)}`,
                );
            } else {
                toast.error(response.message);
            }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            if (error.errors) {
                const validationErrors: Record<string, string> = {};
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                error.errors.forEach((err: any) => {
                    validationErrors[err.path[0]] = err.message;
                });
                setErrors(validationErrors);
            } else {
                toast.error(
                    error.response?.data?.message || 'Une erreur est survenue.',
                );
            }
        } finally {
            setLoading(false);
        }
    };

    const selectedType = userTypes.find((type) => type.id === selectedUserType);

    return (
        <div className="min-h-screen bg-white flex flex-col">
            {/* Your existing JSX content remains the same */}
            {/* Header */}
            <div className="text-center pt-8 sm:pt-12 pb-6 sm:pb-8 px-4 sm:px-6">
                {/* Header content */}
            </div>

            {/* Content */}
            <div className="flex-1 px-4 sm:px-6 lg:px-8">
                <div className="max-w-sm sm:max-w-md mx-auto">
                    {/* User Type Buttons */}
                    <div className="mb-6 sm:mb-8">
                        <div className="flex flex-wrap justify-center gap-3">
                            {userTypes.map((type) => {
                                const isSelected = type.id === selectedUserType;

                                return (
                                    <button
                                        key={type.id}
                                        onClick={() =>
                                            setSelectedUserType(type.id)
                                        }
                                        className={`flex items-center space-x-2 px-4 py-3 rounded-xl border transition-all duration-200
                      ${isSelected ? 'bg-cyan-100 border-cyan-500 text-cyan-700' : 'bg-white border-gray-300 hover:border-gray-400 text-gray-700'}
                      active:scale-[0.98]`}
                                    >
                                        <span className="text-lg">
                                            {type.icon}
                                        </span>
                                        <span className="text-sm sm:text-base font-medium">
                                            {type.title}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Login Form */}
                    <form
                        onSubmit={handleSubmit}
                        className="space-y-4 sm:space-y-5"
                    >
                        <Input
                            label=""
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            error={errors.email}
                            placeholder="E-mail"
                            required
                            className="text-base sm:text-sm"
                        />

                        <Input
                            label=""
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            error={errors.password}
                            placeholder="Mot de passe"
                            required
                            className="text-base sm:text-sm"
                        />
                        <Link
                            className="text-sm left hover:text-blue-600 hover:font-semibold"
                            href="auth/forgot-password"
                        >
                            Mot de passe oublié ?
                        </Link>
                        <div className="pt-2">
                            <Button
                                type="submit"
                                loading={loading}
                                className="w-full bg-cyan-500 hover:bg-cyan-600 text-white transition-colors duration-200"
                                size="lg"
                            >
                                <span className="text-sm sm:text-base">
                                    Connexion{' '}
                                    {selectedType?.title.split(' ')[0]}
                                </span>
                            </Button>
                        </div>
                    </form>

                    {/* Sign Up Link */}
                    <div className="text-center mt-8 sm:mt-10 pb-6">
                        <button
                            type="button"
                            onClick={() =>
                                router.push(
                                    `/auth/signup?type=${selectedUserType}`,
                                )
                            }
                            className="text-cyan-600 hover:text-cyan-500 font-medium text-sm sm:text-base transition-colors duration-200 underline-offset-4 hover:underline"
                        >
                            Pas encore inscrit ? Créer un compte
                        </button>
                    </div>
                </div>
            </div>

            {/* Bottom Safe Area */}
            <div className="pb-safe-area-inset-bottom sm:pb-0"></div>
        </div>
    );
};
