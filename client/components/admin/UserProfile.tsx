
"use client";
import React, { useState } from 'react';
import Image from 'next/image';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { ProfileAvatar } from '@/components/ui/ProfileAvatar';
import { Briefcase, CheckCircle2, FileText, Image as ImageIcon, Phone, ShieldX, User, XCircle } from 'lucide-react';

interface UserProfile {
  _id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string | null;
  userType?: string;
  profileImage?: string | null;
  isValidated?: boolean;
  isBlocked?: boolean;
  professionalInfo?: {
    network?: string;
    identityCard?: { url?: string; key?: string; uploadedAt?: string } | null;
  } | null;
  propertiesCount?: number;
  collaborationsActive?: number;
  collaborationsClosed?: number;
}

interface UserProfileModernProps {
  user: UserProfile;
  onValidate: (id: string, value: boolean) => Promise<void>;
  onBlock: (id: string, value: boolean) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

type ConfirmAction = 'validate' | 'invalidate' | 'block' | 'unblock' | 'delete' | null;

type KnownUserType = '' | 'agent' | 'apporteur' | 'admin';

const StatCard: React.FC<{ icon: React.ReactNode; label: string; value?: number; colorClass?: string }> = ({ icon, label, value, colorClass }) => (
  <div className={`flex items-center p-4 rounded-lg ${colorClass || ''}`}>
    <div className="mr-4">{icon}</div>
    <div>
      <p className="text-sm font-medium text-gray-600">{label}</p>
      <p className="text-2xl font-bold text-gray-900">{value ?? 0}</p>
    </div>
  </div>
);

const InfoRow: React.FC<{ icon?: React.ReactNode; label: string; value?: React.ReactNode }> = ({ icon, label, value }) => (
  <div className="flex items-center text-sm">
    <div className="w-6 mr-2 text-gray-500">{icon}</div>
    <span className="font-medium text-gray-700 mr-2">{label}:</span>
    <span className="text-gray-900">{value || '-'}</span>
  </div>
);

export function UserProfileModern({ user, onValidate, onBlock, onDelete }: UserProfileModernProps) {
  const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim();
  const [pendingAction, setPendingAction] = useState<ConfirmAction>(null);
  const [isLoading, setIsLoading] = useState(false);

  const getActionDetails = (action: ConfirmAction) => {
    switch (action) {
      case 'validate':
        return {
          title: 'Valider l\'utilisateur',
          description: `Êtes-vous sûr de vouloir valider ${fullName} ? Cet utilisateur aura accès à toutes les fonctionnalités de la plateforme.`,
          confirmText: 'Valider',
          cancelText: 'Annuler',
          variant: 'primary' as const,
        };
      case 'invalidate':
        return {
          title: 'Invalider l\'utilisateur',
          description: `Êtes-vous sûr de vouloir invalider ${fullName} ? Cet utilisateur perdra accès aux fonctionnalités de la plateforme.`,
          confirmText: 'Invalider',
          cancelText: 'Annuler',
          variant: 'danger' as const,
        };
      case 'block':
        return {
          title: 'Bloquer l\'utilisateur',
          description: `Êtes-vous sûr de vouloir bloquer ${fullName} ? Cet utilisateur ne pourra plus accéder à la plateforme.`,
          confirmText: 'Bloquer',
          cancelText: 'Annuler',
          variant: 'danger' as const,
        };
      case 'unblock':
        return {
          title: 'Débloquer l\'utilisateur',
          description: `Êtes-vous sûr de vouloir débloquer ${fullName} ? Cet utilisateur retrouvera l\'accès à la plateforme.`,
          confirmText: 'Débloquer',
          cancelText: 'Annuler',
          variant: 'primary' as const,
        };
      case 'delete':
        return {
          title: 'Supprimer l\'utilisateur',
          description: `Cette action est irréversible. Toutes les annonces, collaborations et messages de ${fullName} seront définitivement supprimés. Êtes-vous sûr de vouloir continuer ?`,
          confirmText: 'Supprimer définitivement',
          cancelText: 'Annuler',
          variant: 'danger' as const,
        };
      default:
        return { title: '', description: '', confirmText: '', cancelText: '', variant: 'primary' as const };
    }
  };

  const handleConfirmAction = async () => {
    setIsLoading(true);
    try {
      switch (pendingAction) {
        case 'validate':
          await onValidate(user._id, true);
          break;
        case 'invalidate':
          await onValidate(user._id, false);
          break;
        case 'block':
          await onBlock(user._id, true);
          break;
        case 'unblock':
          await onBlock(user._id, false);
          break;
        case 'delete':
          await onDelete(user._id);
          break;
      }
    } finally {
      setIsLoading(false);
      setPendingAction(null);
    }
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-1 space-y-8">
          <Card className="overflow-hidden shadow-lg">
            <div className="bg-gray-50 p-6">
              <div className="flex items-center">
                <ProfileAvatar
                  user={{
                    // ProfileAvatar expects a User-like shape; map minimal compatible fields
                    _id: user._id,
                    firstName: user.firstName || '',
                    lastName: user.lastName || '',
                    profileImage: user.profileImage ?? undefined,
                    email: user.email || '',
                    phone: user.phone ?? '',
                    userType: (user.userType ?? '') as KnownUserType,
                    // map admin flags to a couple expected boolean fields
                    isEmailVerified: !!user.isValidated,
                    profileCompleted: false,
                  }}
                  size="2xl"
                />
                <div className="ml-5">
                  <h3 className="text-2xl font-bold text-gray-900">{fullName}</h3>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex flex-wrap gap-2">
                <Badge variant={user.isValidated ? 'success' : 'error'} className="flex items-center">
                  {user.isValidated ? <CheckCircle2 className="w-4 h-4 mr-1.5" /> : <XCircle className="w-4 h-4 mr-1.5" />}
                  {user.isValidated ? 'Vérifié' : 'Non Vérifié'}
                </Badge>
                <Badge variant={user.isBlocked ? 'error' : 'secondary'} className="flex items-center">
                  {user.isBlocked ? <ShieldX className="w-4 h-4 mr-1.5" /> : <CheckCircle2 className="w-4 h-4 mr-1.5" />}
                  {user.isBlocked ? 'Bloqué' : 'Actif'}
                </Badge>
                <Badge variant="gray" className="capitalize">{user.userType}</Badge>
              </div>

              <hr className="border-gray-200" />
              
              <InfoRow icon={<Phone size={16} />} label="Téléphone" value={user.phone} />
              <InfoRow icon={<Briefcase size={16} />} label="Réseau" value={user.professionalInfo?.network} />

              <hr className="border-gray-200" />

              <div className="space-y-3">
                <h3 className="font-semibold text-gray-800">Actions Administrateur</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {user.isValidated ? (
                    <Button variant="outline" size="sm" onClick={() => setPendingAction('invalidate')} disabled={isLoading}>
                      Invalider
                    </Button>
                  ) : (
                    <Button variant="primary" size="sm" onClick={() => setPendingAction('validate')} disabled={isLoading}>
                      Valider
                    </Button>
                  )}
                  {user.isBlocked ? (
                    <Button variant="success" size="sm" onClick={() => setPendingAction('unblock')} disabled={isLoading}>
                      Débloquer
                    </Button>
                  ) : (
                    <Button variant="danger" size="sm" onClick={() => setPendingAction('block')} disabled={isLoading}>
                      Bloquer
                    </Button>
                  )}
                </div>
                <Button variant="danger" size="sm" onClick={() => setPendingAction('delete')} disabled={isLoading} className="w-full">
                  Supprimer l&apos;utilisateur
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-2 space-y-8">
          <Card className="shadow-lg">
            <div className="p-6">
              <h3 className="text-xl font-semibold">Statistiques</h3>
            </div>
            <div className="p-6 pt-0 grid grid-cols-1 md:grid-cols-3 gap-4">
              <StatCard
                icon={<FileText size={24} className="text-blue-500" />}
                label="Annonces"
                value={user.propertiesCount}
                colorClass="bg-blue-50"
              />
              <StatCard
                icon={<CheckCircle2 size={24} className="text-green-500" />}
                label="Collab. actives"
                value={user.collaborationsActive}
                colorClass="bg-green-50"
              />
              <StatCard
                icon={<XCircle size={24} className="text-purple-500" />}
                label="Collab. clôturées"
                value={user.collaborationsClosed}
                colorClass="bg-purple-50"
              />
            </div>
          </Card>
          
          <Card className="shadow-lg">
            <div className="p-6">
              <h3 className="text-xl font-semibold">Documents</h3>
            </div>
            <div className="p-6 pt-0 space-y-6">
              <div>
                <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
                  <ImageIcon size={18} className="mr-2" /> Photo de profil
                </h4>
                {user.profileImage ? (
                  <a href={user.profileImage} target="_blank" rel="noopener noreferrer">
                    <div className="w-32 h-32 relative rounded-lg overflow-hidden border shadow-sm">
                      <Image src={user.profileImage} alt="Profile" fill className="object-cover" unoptimized />
                    </div>
                  </a>
                ) : (
                  <p className="text-sm text-gray-500">Non fournie.</p>
                )}
              </div>
              <hr className="border-gray-200" />
              <div>
                <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
                  <User size={18} className="mr-2" /> Carte d&apos;identité
                </h4>
                {user.professionalInfo?.identityCard?.url ? (
                  <a href={user.professionalInfo.identityCard.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    Voir le document
                  </a>
                ) : (
                  <p className="text-sm text-gray-500">Non fournie.</p>
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmDialog
        isOpen={pendingAction !== null}
        title={getActionDetails(pendingAction).title}
        description={getActionDetails(pendingAction).description}
        confirmText={getActionDetails(pendingAction).confirmText}
        cancelText={getActionDetails(pendingAction).cancelText}
        onConfirm={handleConfirmAction}
        onCancel={() => setPendingAction(null)}
        loading={isLoading}
        variant={getActionDetails(pendingAction).variant}
      />
    </div>
  );
}
