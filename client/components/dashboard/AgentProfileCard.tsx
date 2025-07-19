'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '../ui/Button';
import { ProfileUpdateModal } from './ProfileUpdateModal';
import { User } from '@/types/auth';

interface AgentProfileCardProps {
  user: User;
}

export const AgentProfileCard: React.FC<AgentProfileCardProps> = ({ user }) => {
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const router = useRouter();

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Profil Agent</h3>
          <div className="flex gap-3">
            {!user.profileCompleted && (
              <Button
                onClick={() => router.push('/auth/complete-profile')}
                className="bg-cyan-600 hover:bg-cyan-700 text-white"
                size="sm"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Compléter
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowUpdateModal(true)}
              className="flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              <span>Modifier</span>
            </Button>
          </div>
        </div>

        {/* Basic Profile Info */}
        <div className="flex items-center space-x-6 mb-6">
          <div className="w-20 h-20 bg-cyan-600 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
            {user.profileImage ? (
              <img
                src={user.profileImage}
                alt={`${user.firstName} ${user.lastName}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  target.nextElementSibling!.classList.remove('hidden');
                }}
              />
            ) : null}
            <span className={`text-white font-semibold text-xl ${user.profileImage ? 'hidden' : ''}`}>
              {user.firstName.charAt(0)}{user.lastName.charAt(0)}
            </span>
          </div>
          <div>
            <h4 className="text-xl font-semibold text-gray-900">
              {user.firstName} {user.lastName}
            </h4>
            <p className="text-gray-600">Agent Immobilier</p>
            <div className="flex items-center mt-2">
              <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                user.profileCompleted 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {user.profileCompleted ? 'Profil complété' : 'Profil incomplet'}
              </span>
            </div>
          </div>
        </div>

        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <p className="text-sm font-medium text-gray-600">Email</p>
            <p className="text-base text-gray-900">{user.email}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Téléphone</p>
            <p className="text-base text-gray-900">{user.phone || 'Non renseigné'}</p>
          </div>
        </div>

        {/* Professional Information - Only if profile is completed */}
        {user.profileCompleted && user.professionalInfo && (
          <>
            <hr className="my-6" />
            <h4 className="text-md font-semibold text-gray-900 mb-4">Informations professionnelles</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-cyan-600">
                  {user.professionalInfo?.interventionRadius || 20}km
                </p>
                <p className="text-sm text-gray-600">Rayon d&apos;intervention</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-cyan-600">
                  {user.professionalInfo?.yearsExperience || 0}
                </p>
                <p className="text-sm text-gray-600">Années d&apos;expérience</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-cyan-600">
                  {user.professionalInfo?.network || 'N/A'}
                </p>
                <p className="text-sm text-gray-600">Réseau</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm font-medium text-gray-600">Secteur d&apos;activité</p>
                <p className="text-base text-gray-900">
                  {user.professionalInfo?.city} ({user.professionalInfo?.postalCode})
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">SIRET</p>
                <p className="text-base text-gray-900">
                  {user.professionalInfo?.siretNumber || 'Non renseigné'}
                </p>
              </div>
              {user.professionalInfo?.personalPitch && (
                <div className="md:col-span-2">
                  <p className="text-sm font-medium text-gray-600">Bio personnelle</p>
                  <p className="text-base text-gray-900 mt-1">
                    {user.professionalInfo.personalPitch}
                  </p>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Update Modal */}
      <ProfileUpdateModal
        isOpen={showUpdateModal}
        onClose={() => setShowUpdateModal(false)}
        user={user}
      />
    </>
  );
};
