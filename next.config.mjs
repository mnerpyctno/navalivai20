import withPWA from 'next-pwa'

const pwaConfig = withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development'
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'online.moysklad.ru',
      },
      {
        protocol: 'https',
        hostname: 'miniature-prod.moysklad.ru',
      }
    ],
  },
  env: {
    MOYSKLAD_TOKEN: process.env.MOYSKLAD_TOKEN,
  },
  // Конфигурация для TWA
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; connect-src 'self' https://api.moysklad.ru; img-src 'self' https://online.moysklad.ru data:; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://telegram.org https://*.telegram.org; style-src 'self' 'unsafe-inline';"
          }
        ]
      }
    ]
  }
}

export default pwaConfig(nextConfig) 