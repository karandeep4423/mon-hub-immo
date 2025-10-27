'use client';
import { useRef, useState, useEffect } from 'react';
import { ContactApi, type ContactFormData } from '@/lib/api/contactApi';
import { Features } from '@/lib/constants';
// Migrated: Features.Landing.LANDING_UI_TEXT;
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import {
	HeroSection,
	BenefitsSection,
	ProfessionalSection,
	ContactFormSection,
	PlatformFeaturesSection,
	TargetAudienceSection,
	Footer,
} from '@/components/landing';

export default function LandingPage() {
	const scrollToForm = () => {
		formRef.current?.scrollIntoView({ behavior: 'smooth' });
	};

	const formRef = useRef<HTMLFormElement>(null);
	const router = useRouter();
	const { user, loading: authLoading } = useAuth();
	const [loading, setLoading] = useState(false);
	const [message, setMessage] = useState<string | null>(null);
	const [messageType, setMessageType] = useState<'success' | 'error'>(
		'success',
	);
	const [isRedirecting, setIsRedirecting] = useState(false);

	async function handleSubmit(event: React.FormEvent) {
		event.preventDefault();
		setLoading(true);
		setMessage(null);

		if (!formRef.current) return;

		const formData = new FormData(formRef.current);
		const data: ContactFormData = {
			name: formData.get('name') as string,
			email: formData.get('email') as string,
			phone: (formData.get('phone') as string) || undefined,
		};

		try {
			const result = await ContactApi.sendContactForm(data);

			if (result.success) {
				setMessage(result.message);
				setMessageType('success');
				formRef.current.reset();
			} else {
				setMessage(result.message);
				setMessageType('error');
			}
		} catch {
			setMessage(Features.Landing.LANDING_UI_TEXT.sendError);
			setMessageType('error');
		} finally {
			setLoading(false);
		}
	}

	// Handle redirect if user is already authenticated
	useEffect(() => {
		if (!authLoading && user && !isRedirecting) {
			setIsRedirecting(true);
			router.push('/home');
		}
	}, [user, authLoading, router, isRedirecting]);

	// Show loading state while checking auth or redirecting
	if (authLoading || isRedirecting) {
		return (
			<PageLoader
				message={
					isRedirecting
						? Features.Landing.LANDING_UI_TEXT.redirecting
						: Features.Landing.LANDING_UI_TEXT.loading
				}
			/>
		);
	}

	// Don't render the form if user is authenticated (additional safety check)
	if (user) {
		return null;
	}

	return (
		<main className="bg-brand min-h-screen text-white font-sans">
			<HeroSection onScrollToForm={scrollToForm} />
			<BenefitsSection />
			<ProfessionalSection />
			<ContactFormSection
				formRef={formRef}
				onSubmit={handleSubmit}
				loading={loading}
				message={message}
				messageType={messageType}
			/>
			<PlatformFeaturesSection onScrollToForm={scrollToForm} />
			<TargetAudienceSection onScrollToForm={scrollToForm} />
			<Footer />
		</main>
	);
}
