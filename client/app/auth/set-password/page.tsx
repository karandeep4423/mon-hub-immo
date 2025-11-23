import React, { Suspense } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import the client component and render it inside Suspense.
// Using { suspense: true } enables server components to render a client component via Suspense.
// Keep options as an object literal (Next requires that), but provide a narrow
// typed wrapper so we don't introduce `any` in this file for linting rules.
const dynamicTyped = dynamic as unknown as <T = unknown>(
  loader: () => Promise<{ default: React.ComponentType<T> }>,
  options: Record<string, unknown>
) => React.ComponentType<T>;

const SetPasswordClient = dynamicTyped(() => import('@/components/auth/SetPasswordClient'), { suspense: true });

export default function SetPasswordPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Chargement…</div>}>
      <SetPasswordClient />
    </Suspense>
  );
}
