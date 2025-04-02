/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['telegram.org', 'api.moysklad.ru', 'miniature-prod.moysklad.ru', 't.me'],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.moysklad.ru',
        pathname: '/api/remap/1.2/download/**',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; connect-src 'self' http://localhost:3000 http://localhost:3002 https://api.moysklad.ru https://telegram.org https://*.telegram.org; img-src 'self' https://api.moysklad.ru https://miniature-prod.moysklad.ru data:; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://telegram.org https://*.telegram.org; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com;"
          }
        ]
      }
    ]
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  experimental: {
    optimizeCss: false,
    optimizePackageImports: ['@fortawesome/free-solid-svg-icons', 'react-icons']
  },
  // Отключаем генерацию статических страниц для 404 и 500
  output: 'standalone',
  poweredByHeader: false,
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
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
    // Включаем подробное логирование
    config.infrastructureLogging = {
      level: 'verbose',
    };
    return config;
  },
  // Оптимизация предзагрузки ресурсов
  async rewrites() {
    return [
      {
        source: '/telegram-web-app.js',
        destination: 'https://telegram.org/js/telegram-web-app.js',
      },
      {
        source: '/api/images/:path*',
        destination: 'https://api.moysklad.ru/api/remap/1.2/download/:path*',
      }
    ];
  }
};

module.exports = nextConfig; 