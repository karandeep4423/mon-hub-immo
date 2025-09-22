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
import { AUTH_TEXT } from '@/lib/constants/text';
import Link from 'next/link';

export const LoginWithUserType: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();

  const [selectedUserType, setSelectedUserType] = useState('agent');
  const [loading, setLoading] = useState(false);
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

  const userTypes = [
    { id: 'agent', icon: '👤', title: 'Agent Immobilier' },
    { id: 'apporteur', icon: '💝', title: 'Apporteur d\'affaires' },
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
          router.push('/auth/complete-profile');
        } else {
          router.push('/dashboard');
        }
      } else if (response.requiresVerification) {
        toast.warning(response.message);
        router.push(`/auth/verify-email?email=${encodeURIComponent(formData.email)}`);
      } else {
        toast.error(response.message);
      }
    } catch (error: any) {
      if (error.errors) {
        const validationErrors: Record<string, string> = {};
        error.errors.forEach((err: any) => {
          validationErrors[err.path[0]] = err.message;
        });
        setErrors(validationErrors);
      } else {
        toast.error(error.response?.data?.message || AUTH_TEXT.somethingWentWrong);
      }
    } finally {
      setLoading(false);
    }
  };

  const selectedType = userTypes.find((type) => type.id === selectedUserType);

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
      {/* Header */}
      {/* <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {AUTH_TEXT.brandName.split('hub')[0]}
          <span className="text-cyan-500">hub{AUTH_TEXT.brandName.split('hub')[1]}</span>
        </h1>
        <p className="text-sm text-gray-600">{AUTH_TEXT.collaborativeNetwork}</p>
      </div> */}

      {/* User Type Selection */}

	  <button
        onClick={() => router.push('/')}
        className="absolute top-40 left-8  w-12 h-12 bg-cyan-500 text-white rounded-full flex items-center justify-center hover:bg-cyan-600 transition-colors duration-200"
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

	  
      <div className="mb-6 flex justify-center space-x-4">
        {userTypes.map((type) => (
          <button
            key={type.id}
            onClick={() => setSelectedUserType(type.id)}
            className={`flex flex-col items-center p-4 rounded-lg border-2 ${
              selectedUserType === type.id
                ? 'bg-cyan-100 border-cyan-500'
                : 'bg-white border-gray-300 hover:bg-gray-50'
            } transition-all duration-200`}
          >
            <span className="text-2xl mb-2">{type.icon}</span>
            <span className="text-sm font-medium">{type.title}</span>
          </button>
        ))}
      </div>

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4">
        <Input
          label=""
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
          placeholder="Email"
          required
          className="w-full p-2 border rounded-lg"
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
          className="w-full p-2 border rounded-lg"
        />

        <Button
          type="submit"
          loading={loading}
          className="w-full bg-cyan-500 text-white p-2 rounded-lg hover:bg-cyan-600 transition-colors"
        >
          Connexion {selectedType?.title.split(' ')[0]}
        </Button>
      </form>

      {/* Sign Up Link */}
      <p className="mt-4 text-sm text-cyan-600">
        Pas encore inscrit ?{' '}
        <Link href="/auth/signup" className="font-medium hover:underline">
          Créer un compte
        </Link>
      </p>

		<Link href="/auth/forgot-password" className="text-sm text-cyan-600 hover:underline block text-right">
          Mot de passe oublié ?
        </Link>

      {/* Bottom Safe Area for Mobile */}
      <div className="pb-safe-area-inset-bottom sm:pb-0"></div>
    </div>
  );
};