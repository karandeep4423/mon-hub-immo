/**
 * Centralized API Endpoints
 * All backend API routes in one place
 */

export const API_BASE = '/api' as const;

// ============================================================================
// AUTH
// ============================================================================

export const AUTH_ENDPOINTS = {
	SIGNUP: '/auth/signup',
	LOGIN: '/auth/login',
	LOGOUT: '/auth/logout',
	VERIFY_EMAIL: '/auth/verify-email',
	RESEND_VERIFICATION: '/auth/resend-verification',
	FORGOT_PASSWORD: '/auth/forgot-password',
	RESET_PASSWORD: '/auth/reset-password',
	SET_PASSWORD: '/auth/set-password',
	REFRESH_TOKEN: '/auth/refresh',
	PROFILE: '/auth/profile',
	COMPLETE_PROFILE: '/auth/complete-profile',
	PREFERENCES: '/auth/search-preferences',
} as const;

// ============================================================================
// PROPERTIES
// ============================================================================

export const PROPERTIES_ENDPOINTS = {
	LIST: '/properties',
	DETAIL: (id: string) => `/properties/${id}`,
	CREATE: '/properties',
	UPDATE: (id: string) => `/properties/${id}`,
	DELETE: (id: string) => `/properties/${id}`,
	FAVORITES: '/properties/favorites',
	TOGGLE_FAVORITE: (id: string) => `/properties/${id}/favorite`,
} as const;

// ============================================================================
// SEARCH ADS
// ============================================================================

export const SEARCH_ADS_ENDPOINTS = {
	LIST: '/search-ads',
	DETAIL: (id: string) => `/search-ads/${id}`,
	CREATE: '/search-ads',
	UPDATE: (id: string) => `/search-ads/${id}`,
	DELETE: (id: string) => `/search-ads/${id}`,
	MY_ADS: '/search-ads/my-ads',
} as const;

// ============================================================================
// COLLABORATION
// ============================================================================

export const COLLABORATION_ENDPOINTS = {
	LIST: '/collaboration',
	DETAIL: (id: string) => `/collaboration/${id}`,
	CREATE: '/collaboration',
	RESPOND: (id: string) => `/collaboration/${id}/respond`,
	CANCEL: (id: string) => `/collaboration/${id}/cancel`,
	COMPLETE: (id: string) => `/collaboration/${id}/complete`,
	UPDATE_PROGRESS: (id: string) => `/collaboration/${id}/progress`,
	ADD_NOTE: (id: string) => `/collaboration/${id}/notes`,
	GENERATE_CONTRACT: (id: string) => `/collaboration/${id}/contract`,
	UPDATE_FEES: (id: string) => `/collaboration/${id}/fees`,
	UPDATE_CLIENT: (id: string) => `/collaboration/${id}/client`,
} as const;

// ============================================================================
// APPOINTMENTS
// ============================================================================

export const APPOINTMENTS_ENDPOINTS = {
	LIST: '/appointments',
	DETAIL: (id: string) => `/appointments/${id}`,
	CREATE: '/appointments',
	UPDATE: (id: string) => `/appointments/${id}`,
	CANCEL: (id: string) => `/appointments/${id}/cancel`,
	CONFIRM: (id: string) => `/appointments/${id}/confirm`,
	RESCHEDULE: (id: string) => `/appointments/${id}/reschedule`,
	COMPLETE: (id: string) => `/appointments/${id}/complete`,
	AVAILABILITY: '/appointments/availability',
	SLOTS: '/appointments/slots',
} as const;

// ============================================================================
// CHAT
// ============================================================================

export const CHAT_ENDPOINTS = {
	CONVERSATIONS: '/chat/conversations',
	MESSAGES: (userId: string) => `/chat/messages/${userId}`,
	SEND: '/chat/messages',
	READ: (userId: string) => `/chat/messages/read/${userId}`,
	DELETE: (messageId: string) => `/chat/messages/${messageId}`,
	TYPING: '/chat/typing',
} as const;

// ============================================================================
// AGENTS
// ============================================================================

export const AGENTS_ENDPOINTS = {
	LIST: '/agents',
	DETAIL: (id: string) => `/agents/${id}`,
	SEARCH: '/agents/search',
} as const;

// ============================================================================
// NOTIFICATIONS
// ============================================================================

export const NOTIFICATIONS_ENDPOINTS = {
	LIST: '/notifications',
	MARK_READ: (id: string) => `/notifications/${id}/read`,
	MARK_ALL_READ: '/notifications/read-all',
	DELETE: (id: string) => `/notifications/${id}`,
	PREFERENCES: '/notifications/preferences',
} as const;

// ============================================================================
// UPLOAD
// ============================================================================

export const UPLOAD_ENDPOINTS = {
	IMAGE: '/upload/image',
	FILE: '/upload/file',
	MULTIPLE: '/upload/multiple',
} as const;
