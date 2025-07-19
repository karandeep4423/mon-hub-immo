'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useAuth } from '@/hooks/useAuth';
import { authService } from '@/lib/auth';
import { loginSchema } from '@/lib/validation';
import { LoginData } from '@/types/auth';

export const LoginForm: React.FC = () => {
  const router = useRouter();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<LoginData>({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    try {
      // Validate form data
      loginSchema.parse(formData);
      setLoading(true);

      const response = await authService.login(formData);
      
      if (response.success && response.token && response.user) {
        login(response.token, response.user);
        toast.success(response.message);
        router.push('/dashboard');
      } else if (response.requiresVerification) {
        toast.warning(response.message);
        router.push(`/auth/verify-email?email=${encodeURIComponent(formData.email)}`);
      } else {
        toast.error(response.message);
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      if (error.errors) {
        // Handle Zod validation errors
        const validationErrors: Record<string, string> = {};
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        error.errors.forEach((err: any) => {
          validationErrors[err.path[0]] = err.message;
        });
        setErrors(validationErrors);
      } else {
        toast.error(error.response?.data?.message || 'Something went wrong');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Input
        label="Email Address"
        type="email"
        name="email"
        value={formData.email}
        onChange={handleChange}
        error={errors.email}
        placeholder="john@example.com"
        required
      />

      <Input
        label="Password"
        type="password"
        name="password"
        value={formData.password}
        onChange={handleChange}
        error={errors.password}
        placeholder="Enter your password"
        required
      />

      <div className="flex items-center justify-end">
        <button
          type="button"
          onClick={() => router.push('/auth/forgot-password')}
          className="text-sm text-blue-600 hover:text-blue-500"
        >
          Forgot password?
        </button>
      </div>

      <Button
        type="submit"
        loading={loading}
        className="w-full"
        size="lg"
      >
        Sign In
      </Button>

      <div className="text-center">
        <button
          type="button"
          onClick={() => router.push('/auth/signup')}
          className="text-blue-600 hover:text-blue-500 text-sm"
        >
          Dont have an account? Sign up
        </button>
      </div>
    </form>
  );
};
