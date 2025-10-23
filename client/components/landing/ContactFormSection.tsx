import { RefObject } from 'react';
import { LANDING_TEXT } from '@/lib/constants/text';

interface ContactFormSectionProps {
	formRef: RefObject<HTMLFormElement | null>;
	onSubmit: (event: React.FormEvent) => Promise<void>;
	loading: boolean;
	message: string | null;
	messageType: 'success' | 'error';
}

export const ContactFormSection = ({
	formRef,
	onSubmit,
	loading,
	message,
	messageType,
}: ContactFormSectionProps) => {
	return (
		<section className="bg-brand py-16 px-6 flex flex-col items-center text-center">
			<h2 className="text-xl font-semibold mb-2 text-white">
				{LANDING_TEXT.launchOfferTitle}
				<br />
				{LANDING_TEXT.launchOfferSubtitle}
			</h2>
			<p className="mb-6 text-white max-w-xl">
				{LANDING_TEXT.launchOfferDescription}
			</p>
			<div className="flex  flex-col-reverse sm:flex-row items-center justify-center gap-14">
				<div className="bg-white text-gray-900 w-full max-w-md p-6 rounded-lg shadow">
					<h3 className="text-lg font-semibold mb-4">
						{LANDING_TEXT.formTitle}
					</h3>
					<form
						className="space-y-4"
						onSubmit={onSubmit}
						ref={formRef}
					>
						<input
							type="text"
							name="name"
							placeholder={LANDING_TEXT.namePlaceholder}
							className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[var(--brand-focus)] focus:border-transparent"
							required
							disabled={loading}
						/>
						<input
							type="email"
							name="email"
							placeholder={LANDING_TEXT.emailPlaceholder}
							className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[var(--brand-focus)] focus:border-transparent"
							required
							disabled={loading}
						/>
						<input
							type="tel"
							name="phone"
							placeholder={LANDING_TEXT.phonePlaceholder}
							className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[var(--brand-focus)] focus:border-transparent"
							disabled={loading}
						/>
						<button
							type="submit"
							disabled={loading}
							className="bg-brand text-white w-full py-2 rounded font-semibold hover:bg-brand-dark transition disabled:opacity-50 disabled:cursor-not-allowed"
						>
							{loading
								? LANDING_TEXT.submitting
								: LANDING_TEXT.signUpNow}
						</button>
					</form>

					{message && (
						<div
							className={`mt-4 p-3 rounded text-sm ${
								messageType === 'success'
									? 'bg-green-100 text-green-700'
									: 'bg-red-100 text-red-700'
							}`}
						>
							{message}
						</div>
					)}
				</div>
			</div>
		</section>
	);
};
