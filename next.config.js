/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
<<<<<<< HEAD
        hostname: 'online.moysklad.ru',
        pathname: '/static/**',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
=======
        hostname: 'miniature-prod.moysklad.ru',
        pathname: '/miniature/**',
      },
      {
        protocol: 'https',
        hostname: 'api.moysklad.ru',
        pathname: '/api/remap/1.2/download/**',
      },
      {
        protocol: 'https',
        hostname: 'storage.files.mow1.cloud.servers.ru',
        pathname: '/v1/**',
      }
    ],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 0,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    domains: ['miniature-prod.moysklad.ru', 'api.moysklad.ru', 'storage.files.mow1.cloud.servers.ru'],
  },
  async rewrites() {
    return [
      {
        source: '/telegram-web-app.js',
        destination: 'https://telegram.org/js/telegram-web-app.js',
      },
      {
        source: '/api/moysklad/image/:path*',
        destination: 'http://localhost:3002/api/moysklad/image/:path*',
      },
      {
        source: '/api/images/:path*',
        destination: 'http://localhost:3002/api/images/:path*',
      },
      {
        source: '/api/categories',
        destination: 'http://localhost:3002/api/categories',
      },
      {
        source: '/api/categories/:path*',
        destination: 'http://localhost:3002/api/categories/:path*',
      },
      {
        source: '/api/products',
        destination: 'http://localhost:3002/api/products',
      },
      {
        source: '/api/products/:path*',
        destination: 'http://localhost:3002/api/products/:path*',
      },
      {
        source: '/api/search',
        destination: 'http://localhost:3002/api/search',
      },
      {
        source: '/api/search/:path*',
        destination: 'http://localhost:3002/api/search/:path*',
      }
    ];
>>>>>>> 403f6ea (Last version)
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
<<<<<<< HEAD
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://telegram.org; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https:; font-src 'self' data: https://fonts.gstatic.com; connect-src 'self' https:;",
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
        ],
      },
    ];
  },
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['@prisma/client'],
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push('@prisma/client');
    }
=======
            value: "default-src 'self'; connect-src 'self' http://localhost:3000 http://localhost:3002 https://api.moysklad.ru https://telegram.org https://*.telegram.org; img-src 'self' https://miniature-prod.moysklad.ru https://api.moysklad.ru https://storage.files.mow1.cloud.servers.ru:8080 https://tinyimage-prod.moysklad.ru data:; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://telegram.org https://*.telegram.org; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com;"
          },
          {
            key: 'Access-Control-Allow-Origin',
            value: '*'
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, OPTIONS'
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization'
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
>>>>>>> 403f6ea (Last version)
    return config;
  },
};

module.exports = nextConfig; 