export const getResponsiveStyles = (): string => `
	@media (max-width: 600px) {
		.container {
			width: 100% !important;
			border-radius: 0 !important;
		}
		.header {
			padding: 20px 15px !important;
		}
		.header h1 {
			font-size: 20px !important;
		}
		.content {
			padding: 20px 15px !important;
		}
		.code {
			font-size: 24px !important;
			letter-spacing: 2px !important;
		}
		.logo {
			font-size: 24px !important;
		}
	}
	@media (max-width: 480px) {
		.code {
			font-size: 20px !important;
		}
		.header h1 {
			font-size: 18px !important;
		}
	}
`;
