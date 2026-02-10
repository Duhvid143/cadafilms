/** @type {import('next').NextConfig} */
const nextConfig = {
    transpilePackages: ['firebase', 'undici'],
    experimental: {
        serverActions: {
            allowedOrigins: ['localhost:3000', 'cadafilms.com', 'www.cadafilms.com']
        }
    },
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'firebasestorage.googleapis.com',
            },
        ],
    },
    async headers() {
        return [
            {
                source: '/(.*)',
                headers: [
                    { key: 'X-Frame-Options', value: 'DENY' },
                    { key: 'X-Content-Type-Options', value: 'nosniff' },
                    { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
                    { key: 'X-DNS-Prefetch-Control', value: 'on' },
                    { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
                ],
            },
        ];
    },
};

module.exports = nextConfig;
