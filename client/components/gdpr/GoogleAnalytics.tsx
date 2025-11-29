'use client';

import { useEffect } from 'react';
import Script from 'next/script';
import { usePathname, useSearchParams } from 'next/navigation';
import { useCookieConsent } from '@/context/CookieConsentContext';
import * as gtag from '@/lib/gtag';

export default function GoogleAnalytics() {
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const { consent } = useCookieConsent();

	// Track page views
	useEffect(() => {
		if (consent.analytics && pathname) {
			const url = pathname + searchParams.toString();
			gtag.pageview(url);
		}
	}, [pathname, searchParams, consent.analytics]);

	// If no IDs are present, don't render anything
	if (!gtag.GA_TRACKING_ID && !gtag.ADS_ID) {
		return null;
	}

	// Only render scripts if consent is granted
	if (!consent.analytics && !consent.marketing) {
		return null;
	}

	return (
		<>
			{/* Global Site Tag (gtag.js) - Google Analytics */}
			<Script
				strategy="afterInteractive"
				src={`https://www.googletagmanager.com/gtag/js?id=${gtag.GA_TRACKING_ID || gtag.ADS_ID}`}
			/>
			<Script
				id="gtag-init"
				strategy="afterInteractive"
				dangerouslySetInnerHTML={{
					__html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            
            ${
				consent.analytics && gtag.GA_TRACKING_ID
					? `gtag('config', '${gtag.GA_TRACKING_ID}', {
                page_path: window.location.pathname,
              });`
					: ''
			}

            ${
				consent.marketing && gtag.ADS_ID
					? `gtag('config', '${gtag.ADS_ID}');`
					: ''
			}
          `,
				}}
			/>
		</>
	);
}
