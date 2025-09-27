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
	},
};

export default nextConfig;
