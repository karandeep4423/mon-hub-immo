/**
 * Centralized hooks exports
 * Import hooks from here for consistency
 */

// Authentication
export {
	useAuth,
	useRequireAuth,
	useProtectedRoute,
	useProfileStatus,
	useUserTypeHelpers,
} from './useAuth';

// Socket listeners (NEW - reusable patterns)
export {
	useSocketListener,
	useSocketListeners,
	useSocketListenerConditional,
} from './useSocketListener';

// Data fetching (NEW - consistent API patterns)
export { useFetch, usePaginatedFetch } from './useFetch';

// Chat
export { useChat } from './useChat';

// Notifications
export { useNotification } from './useNotification';

// Appointments
export { useAppointmentNotifications } from './useAppointmentNotifications';

// Collaboration
export { useCollaborationData } from './useCollaborationData';
export { useCollaborationActions } from './useCollaborationActions';

// Dashboard
export { useDashboardStats } from './useDashboardStats';

// Location
export { useLocationHistory } from './useLocationHistory';

// Forms
export { useForm } from './useForm';
export { usePropertyForm } from './usePropertyForm';

// Utils
export { useDebounce } from './useDebounce';
export { useClickOutside } from './useClickOutside';
export { useDebouncedSearch } from './useDebouncedSearch';
