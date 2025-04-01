/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['telegram.org', 'api.moysklad.ru', 'miniature-prod.moysklad.ru', 't.me'],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  experimental: {
    optimizeCss: false,
    optimizePackageImports: ['@fortawesome/free-solid-svg-icons', 'react-icons'],
  },
  // Отключаем генерацию статических страниц для 404 и 500
  output: 'standalone',
  poweredByHeader: false,
  webpack: (config, { dev, isServer }) => {
    // Оптимизация для production
    if (!dev && !isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          minSize: 20000,
          maxSize: 244000,
          minChunks: 1,
          maxAsyncRequests: 30,
          maxInitialRequests: 30,
          cacheGroups: {
            defaultVendors: {
              test: /[\\/]node_modules[\\/]/,
              priority: -10,
              reuseExistingChunk: true,
            },
            default: {
              minChunks: 2,
              priority: -20,
              reuseExistingChunk: true,
            },
          },
        },
      };
    }
    return config;
  },
}

module.exports = nextConfig 