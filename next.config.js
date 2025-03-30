/** @type {import('next').NextConfig} */
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development'
})

const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['online.moysklad.ru'],
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
            value: "default-src 'self' https://online.moysklad.ru; img-src 'self' https://online.moysklad.ru data:; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline';"
          }
        ]
      }
    ]
  }
}

module.exports = withPWA(nextConfig) 