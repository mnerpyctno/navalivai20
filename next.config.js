/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['telegram.org', 'api.moysklad.ru', 'miniature-prod.moysklad.ru'],
  },
}

module.exports = nextConfig 