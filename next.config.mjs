/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'ne-games.com' },
      { protocol: 'https', hostname: 'www.ne-games.com' },
      { protocol: 'https', hostname: 'flagcdn.com' },
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://chatling.ai https://*.chatling.ai https://*.paypal.com https://*.paypal.cn https://*.paypalobjects.com https://*.cardinalcommerce.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https: blob:; font-src 'self' https: data:; connect-src 'self' https://ne-games.com https://api.counterapi.dev https://chatling.ai https://*.chatling.ai https://*.paypal.com https://*.paypalobjects.com https://*.cardinalcommerce.com; frame-src 'self' https://chatling.ai https://*.chatling.ai https://*.paypal.com https://*.cardinalcommerce.com https://www.youtube.com https://player.vimeo.com; object-src 'none'; base-uri 'self'; form-action 'self';",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
