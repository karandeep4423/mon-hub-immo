import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
	images: {
		remotePatterns: [
			{
				protocol: 'https',
				hostname: 'monhubimmo.s3.amazonaws.com',
				port: '',
				pathname: '/**',
			},
		],
		// Disable optimization for S3 images to avoid 403 errors
		unoptimized: process.env.NODE_ENV === 'production',
	},
};

export default nextConfig;
