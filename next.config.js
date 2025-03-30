/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['online.moysklad.ru'],
  },
  env: {
    MOYSKLAD_TOKEN: process.env.MOYSKLAD_TOKEN,
  }
}

module.exports = nextConfig 