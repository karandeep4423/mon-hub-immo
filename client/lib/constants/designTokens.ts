/**
 * Centralized design system tokens for admin dashboard
 * Single source of truth for colors, gradients, spacing, shadows, etc.
 */

export const designTokens = {
	colors: {
		primary: '#00BCE4',
		secondary: '#6C5FE8',
		success: '#10B981',
		warning: '#F59E0B',
		danger: '#EF4444',
		info: '#3B82F6',
		gray: {
			50: '#F9FAFB',
			100: '#F3F4F6',
			200: '#E5E7EB',
			300: '#D1D5DB',
			400: '#9CA3AF',
			500: '#6B7280',
			600: '#4B5563',
			700: '#374151',
			800: '#1F2937',
			900: '#111827',
		},
	},
	gradients: {
		blue: 'linear-gradient(135deg, #00BCE4 0%, #0FA9D6 100%)',
		purple: 'linear-gradient(135deg, #6C5FE8 0%, #8B7FFF 100%)',
		emerald: 'linear-gradient(135deg, #10B981 0%, #34D399 100%)',
		rose: 'linear-gradient(135deg, #EC4899 0%, #F43F5E 100%)',
	},
	shadows: {
		sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
		base: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
		md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
		lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
		xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
		card: '0 4px 12px 0 rgba(0, 0, 0, 0.08)',
		'card-hover': '0 12px 24px 0 rgba(0, 0, 0, 0.15)',
	},
	spacing: {
		xs: '0.25rem',
		sm: '0.5rem',
		md: '1rem',
		lg: '1.5rem',
		xl: '2rem',
		'2xl': '2.5rem',
		'3xl': '3rem',
	},
	radius: {
		sm: '0.375rem',
		md: '0.5rem',
		lg: '1rem',
		xl: '1.5rem',
		'2xl': '2rem',
		full: '9999px',
	},
	transitions: {
		fast: '150ms',
		base: '200ms',
		slow: '300ms',
		slower: '500ms',
	},
	typography: {
		fontFamily: {
			sans: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif',
		},
		fontSize: {
			xs: '0.75rem',
			sm: '0.875rem',
			base: '1rem',
			lg: '1.125rem',
			xl: '1.25rem',
			'2xl': '1.5rem',
			'3xl': '1.875rem',
			'4xl': '2.25rem',
		},
		fontWeight: {
			normal: 400,
			medium: 500,
			semibold: 600,
			bold: 700,
		},
	},
} as const;

export type DesignTokens = typeof designTokens;
