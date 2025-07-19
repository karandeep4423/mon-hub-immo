'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

export const UserTypeSelection: React.FC = () => {
  const router = useRouter();

  const userTypes = [
    {
      id: 'agent',
      icon: '👤',
      title: 'Agent Immobilier',
      description: 'Professionnel de l\'immobilier',
    },
    {
      id: 'apporteur',
      icon: '💝',
      title: 'Apporteur d\'affaires',
      description: 'Apporteur de clients',
    },
    {
      id: 'partenaire',
      icon: '🏢',
      title: 'Accès Partenaire',
      description: 'Partenaire professionnel',
    },
  ];

  const handleUserTypeSelect = (userType: string) => {
    router.push(`/auth/login?type=${userType}`);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 text-center pt-16 pb-8 px-6">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
          hub<span className="text-cyan-500">immo</span>
        </h1>
        
        <div className="space-y-2 mb-8">
          <p className="text-xl font-semibold text-gray-800">
            Bienvenue sur Hubimmo
          </p>
          <p className="text-lg text-gray-600">
            Le 1er réseau social immobilier collaboratif
          </p>
        </div>

        <h2 className="text-lg font-medium text-gray-800 mb-8">
          Choisissez votre accès:
        </h2>
      </div>

      {/* User Type Cards */}
      <div className="flex-1 px-6 pb-8">
        <div className="max-w-sm mx-auto space-y-4">
          {userTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => handleUserTypeSelect(type.id)}
              className="w-full bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl p-4 transition-all duration-200 active:scale-95"
            >
              <div className="flex items-center space-x-4">
                <div className="text-2xl">{type.icon}</div>
                <div className="text-left">
                  <h3 className="font-semibold text-gray-900">{type.title}</h3>
                  <p className="text-sm text-gray-600">{type.description}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Bottom indicator */}
      <div className="flex-shrink-0 pb-6">
        <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto"></div>
      </div>
    </div>
  );
};
