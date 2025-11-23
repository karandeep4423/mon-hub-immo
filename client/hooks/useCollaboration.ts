import { useState, useEffect } from 'react';

export interface UserRef { _id: string; firstName?: string; lastName?: string; profileImage?: string | null }

export interface ProgressNote { _id: string; message?: string; createdBy?: UserRef | string; createdAt?: string }

export interface ProgressStep { stepName?: string; name?: string; status?: string; notes?: ProgressNote[] }

export interface CollaborationDetail {
  _id: string;
  postType?: string;
  postId?: Record<string, unknown> | null;
  postOwnerId?: UserRef;
  collaboratorId?: UserRef;
  status?: string;
  proposedCommission?: number;
  currentProgressStep?: string;
  activities?: Array<{ _id: string; type?: string; message?: string; createdBy?: UserRef | string; createdAt?: string }>;
  progressSteps?: ProgressStep[];
  createdAt?: string;
}

export function useCollaboration(id?: string) {
  const [collaboration, setCollaboration] = useState<CollaborationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);
    fetch(`http://localhost:4000/api/collaboration/${id}`, { credentials: 'include' })
      .then(r => r.ok ? r.json() : r.text().then(txt => { throw new Error(txt); }))
      .then(data => {
        if (data.error) setError(String(data.error));
        else setCollaboration(data.collaboration ?? data);
      })
      .catch(err => setError(String(err.message || err)))
      .finally(() => setLoading(false));
  }, [id]);

  // Admin action: close (cancel or complete)
  async function adminClose(action: 'cancel' | 'complete', completionReason?: string) {
    if (!id) throw new Error('Missing id');
  const body: Record<string, unknown> = { action };
  if (completionReason) (body as Record<string, unknown>)['completionReason'] = completionReason;
    const res = await fetch(`http://localhost:4000/api/collaboration/${id}/admin/close`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    return res.json();
  }

  // Admin action: force-complete (validate 'affaire_conclue')
  async function adminForceComplete() {
    if (!id) throw new Error('Missing id');
    const res = await fetch(`http://localhost:4000/api/collaboration/${id}/admin/force-complete`, {
      method: 'POST',
      credentials: 'include',
    });
    return res.json();
  }

  return { collaboration, loading, error, adminClose, adminForceComplete };
}
