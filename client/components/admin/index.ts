// Centralized exports for modern admin components
// Use these imports instead of importing from individual files

// UI Components (import directly from components/ui)
export { StatCard } from '@/components/ui/StatCard';
export { DataTable } from '@/components/ui/DataTable';
export { Badge } from '@/components/ui/Badge';
export { Button } from '@/components/ui/Button';

// Layout
export { default as AdminLayout } from './AdminLayout';
export { default as HeaderAdmin } from './HeaderAdmin';
export { default as SidebarAdminModern } from './SidebarAdmin';

// Dashboard
export { default as DashboardAdminModern } from './DashboardAdmin';
export { default as AdminStatsClient } from './AdminStatsClient';

// Tables
export { default as AdminPropertiesTableModern } from './AdminPropertiesTable';
export { default as AdminCollaborationsTableModern } from './AdminCollaborationsTable';

// Admin UI Components
export * from './ui';

// Admin Sub-Components
export * from './users';
export * from './collaborations';
export * from './properties';

// Design System
export { designTokens } from '@/lib/constants/designTokens';
export type { DesignTokens } from '@/lib/constants/designTokens';
