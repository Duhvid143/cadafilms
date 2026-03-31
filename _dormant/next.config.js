/** @type {import('next').NextConfig} */
const nextConfig = {
    transpilePackages: ['firebase', 'undici'],
    experimental: {
        serverActions: {
            allowedOrigins: ['localhost:3000', 'cadafilms.com']
        }
    }
};

module.exports = nextConfig;
