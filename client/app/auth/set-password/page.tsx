'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { authService } from '@/lib/api/authApi';
import { setPasswordSchema } from '@/lib/validation';
import { useForm } from '@/hooks/useForm';
import { authToastError, showPasswordResetSuccess } from '@/lib/utils/authToast';

export default function SetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');

  useEffect(() => {
    const e = searchParams.get('email');
    if (e) setEmail(e);
    const t = searchParams.get('token');
    if (t) setToken(t);
  }, [searchParams]);

  const { values, errors, handleInputChange, setErrors, isSubmitting, handleSubmit } = useForm({
    initialValues: { token: '', newPassword: '', confirmPassword: '' },
    onSubmit: async (data: any) => {
      try {
        if (data.newPassword !== data.confirmPassword) {
          setErrors({ confirmPassword: 'Les mots de passe ne correspondent pas' });
          authToastError('Les mots de passe ne correspondent pas');
          return;
        }

        const payload = { email, token: data.token, newPassword: data.newPassword };
        setPasswordSchema.parse(payload);

        const res = await authService.setPasswordFromInvite(payload);
        if (res.success) {
          showPasswordResetSuccess();
          setTimeout(() => router.push('/auth/login'), 1500);
        } else {
          authToastError(res.message || 'Erreur lors de la mise à jour du mot de passe');
        }
      } catch (err: unknown) {
        authToastError('Erreur lors de la mise à jour du mot de passe');
      }
    }
  });

  return (
    <AuthLayout title="Définir mon mot de passe">
      <div className="max-w-md mx-auto py-8">
        <h2 className="text-xl font-semibold mb-4">Définir un nouveau mot de passe</h2>
        <p className="text-sm text-gray-600 mb-4">Entrez le token reçu par email et définissez votre mot de passe.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Email" value={email} onChange={() => {}} disabled />
          {/* Token comes from the invite link; users don't need to enter it */}
          {!token && (
            <div className="text-sm text-yellow-700 bg-yellow-100 p-2 rounded">Le token d'invitation est manquant dans l'URL. Veuillez utiliser le lien reçu par email ou contacter un administrateur.</div>
          )}
          <input type="hidden" name="token" value={token || values.token} />
          <Input label="Nouveau mot de passe" name="newPassword" type="password" value={values.newPassword} onChange={handleInputChange} error={errors.newPassword} />
          <Input label="Confirmer mot de passe" name="confirmPassword" type="password" value={values.confirmPassword} onChange={handleInputChange} error={errors.confirmPassword} />
          <div className="pt-4">
            <Button type="submit" loading={isSubmitting} className="w-full" disabled={!token}>Définir le mot de passe</Button>
          </div>
        </form>
      </div>
    </AuthLayout>
  );
}
