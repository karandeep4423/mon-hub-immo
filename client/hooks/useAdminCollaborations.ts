import { useState, useEffect } from 'react';

// Adapte cette interface à la structure Collaboration de ton backend (exemple simplifié)
interface Collaboration {
  _id: string;
  postId?: any;
  postType?: string;
  postOwnerId?: { _id: string; firstName?: string; lastName?: string };
  collaboratorId?: { _id: string; firstName?: string; lastName?: string };
  status: string;
  createdAt: string;
  // Ajoute d'autres champs si besoin
}

export function useAdminCollaborations() {
  const [collaborations, setCollaborations] = useState<Collaboration[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);

    fetch('http://localhost:4000/api/collaboration/all', {
      credentials: 'include',
    })
      .then(res => res.json())
      .then(data => {
        console.log('[adminCollab] Réponse API complète:', data);
        setCollaborations(data.collaborations || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return { collaborations, loading };
}
