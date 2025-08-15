'use client';

import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useAuth } from '@/hooks/useAuth';
import { authService } from '@/lib/auth';
import { User } from '@/types/auth';

interface ProfileUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
}

export const ProfileUpdateModal: React.FC<ProfileUpdateModalProps> = ({
  isOpen,
  onClose,
  user,
}) => {
  const { updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user.firstName,
    lastName: user.lastName,
    phone: user.phone || '',
    profileImage: user.profileImage || '',
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

    // Basic validation
    const newErrors: Record<string, string> = {};
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    } else if (formData.firstName.trim().length < 2) {
      newErrors.firstName = 'First name must be at least 2 characters';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    } else if (formData.lastName.trim().length < 2) {
      newErrors.lastName = 'Last name must be at least 2 characters';
    }

    if (formData.profileImage && !isValidUrl(formData.profileImage)) {
      newErrors.profileImage = 'Please enter a valid image URL';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setLoading(true);

      // Only send changed fields
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const changedFields: any = {};
      if (formData.firstName !== user.firstName) changedFields.firstName = formData.firstName.trim();
      if (formData.lastName !== user.lastName) changedFields.lastName = formData.lastName.trim();
      if (formData.phone !== (user.phone || '')) changedFields.phone = formData.phone.trim();
      if (formData.profileImage !== (user.profileImage || '')) changedFields.profileImage = formData.profileImage.trim();

      if (Object.keys(changedFields).length === 0) {
        toast.info('No changes detected');
        onClose();
        return;
      }

      const response = await authService.updateProfile(changedFields);
      
      if (response.success && response.user) {
        updateUser(response.user);
        toast.success(response.message || 'Profile updated successfully');
        onClose();
      } else {
        toast.error(response.message || 'Failed to update profile');
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      if (error.response?.data?.errors) {
        const validationErrors: Record<string, string> = {};
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        error.response.data.errors.forEach((err: any) => {
          validationErrors[err.path || err.param] = err.msg || err.message;
        });
        setErrors(validationErrors);
      } else {
        toast.error(error.response?.data?.message || 'Something went wrong');
      }
    } finally {
      setLoading(false);
    }
  };

  const isValidUrl = (string: string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const handleClose = () => {
    if (!loading) {
      setFormData({
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone || '',
        profileImage: user.profileImage || '',
      });
      setErrors({});
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Update Profile</h2>
          <button
            onClick={handleClose}
            disabled={loading}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="First Name"
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              error={errors.firstName}
              placeholder="John"
              required
              disabled={loading}
            />
            <Input
              label="Last Name"
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              error={errors.lastName}
              placeholder="Doe"
              required
              disabled={loading}
            />
          </div>

          <Input
            label="Phone Number"
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            error={errors.phone}
            placeholder="+1234567890"
            disabled={loading}
          />

          <Input
            label="Profile Image URL (Optional)"
            type="url"
            name="profileImage"
            value={formData.profileImage}
            onChange={handleChange}
            error={errors.profileImage}
            placeholder="https://example.com/image.jpg"
            helperText="Enter a valid image URL for your profile picture"
            disabled={loading}
          />

          {/* Current vs New Preview */}
          {(formData.profileImage || user.profileImage) && (
            <div className="flex items-center justify-center space-x-4 py-4">
              <div className="text-center">
                <p className="text-xs font-medium text-gray-600 mb-2">Current</p>
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center overflow-hidden">
                  {user.profileImage ? (
                    <img
                      src={user.profileImage}
                      alt="Current profile"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        target.nextElementSibling!.classList.remove('hidden');
                      }}
                    />
                  ) : null}
                  <span className={`text-white font-semibold text-sm ${user.profileImage ? 'hidden' : ''}`}>
                    {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                  </span>
                </div>
              </div>
              
              {formData.profileImage && formData.profileImage !== user.profileImage && (
                <>
                  <div className="text-gray-400">→</div>
                  <div className="text-center">
                    <p className="text-xs font-medium text-gray-600 mb-2">New</p>
                    <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center overflow-hidden">
                      <img
                        src={formData.profileImage}
                        alt="New profile"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          target.nextElementSibling!.classList.remove('hidden');
                        }}
                      />
                      <span className="text-white font-semibold text-sm hidden">
                        {formData.firstName.charAt(0)}{formData.lastName.charAt(0)}
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Read-only fields */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <h4 className="text-sm font-medium text-gray-700">Account Information (Read Only)</h4>
            <div className="grid grid-cols-1 gap-3 text-sm">
              <div>
                <span className="font-medium text-gray-600">Email:</span>
                <span className="ml-2 text-gray-900">{user.email}</span>
              </div>
              <div>
                <span className="font-medium text-gray-600">Account Type:</span>
                <span className="ml-2 text-gray-900 capitalize">{user.userType}</span>
              </div>
              <div>
                <span className="font-medium text-gray-600">Email Status:</span>
                <span className={`ml-2 px-2 py-1 text-xs font-semibold rounded-full ${
                  user.isEmailVerified 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {user.isEmailVerified ? 'Verified' : 'Not Verified'}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={loading}
              className="flex-1"
            >
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
