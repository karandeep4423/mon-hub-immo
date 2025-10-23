/**
 * Centralized hooks exports
 * Import hooks from here for consistency
 */

// Authentication
export {
	useAuth,
	useProtectedRoute,
	useProfileStatus,
	useUserTypeHelpers,
} from './useAuth';
export { useRequireAuth } from './useRequireAuth';

// Socket listeners (NEW - reusable patterns)
export {
	useSocketListener,
	useSocketListeners,
	useSocketListenerConditional,
} from './useSocketListener';

// Data fetching (NEW - consistent API patterns)
export { useFetch, usePaginatedFetch } from './useFetch';

// Mutations (NEW - consistent write operations)
export { useMutation, useOptimisticMutation } from './useMutation';
export type {
	UseMutationOptions,
	UseMutationResult,
	MutationResponse,
} from './useMutation';

// Address & Location search
export { useAddressSearch } from './useAddressSearch';
export type { AddressSuggestion } from './useAddressSearch';

// Chat
export { useChat } from './useChat';

// Form validation (NEW - reusable validation patterns)
export { useFormValidation, commonValidationRules } from './useFormValidation';
export type {
	ValidationRule,
	FieldValidation,
	ValidationSchema,
	StepValidationSchema,
} from './useFormValidation';

// Notifications
export { useNotification } from './useNotification';

// Appointments
export { useAppointmentNotifications } from './useAppointmentNotifications';

// Autocomplete
export { useAutocomplete } from './useAutocomplete';

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

// Property
export { usePropertyFilters } from './usePropertyFilters';
export { usePropertyActions } from './usePropertyActions';

// Utils
export { useDebounce } from './useDebounce';
export { useClickOutside } from './useClickOutside';
export { useDebouncedSearch } from './useDebouncedSearch';
