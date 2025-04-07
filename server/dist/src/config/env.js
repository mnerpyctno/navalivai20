"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const dotenv_1 = require("dotenv");
const zod_1 = require("zod");
const path_1 = __importDefault(require("path"));
// Загружаем переменные окружения
const envPath = path_1.default.resolve(__dirname, '../../.env');
(0, dotenv_1.config)({ path: envPath });
// Проверяем наличие обязательных переменных
const requiredEnvVars = [
    'MOYSKLAD_TOKEN',
    'TELEGRAM_BOT_TOKEN',
    'TELEGRAM_BOT_USERNAME',
    'TELEGRAM_SECRET_KEY',
    'NEXT_PUBLIC_WEBAPP_URL'
];
for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
        console.error(`Ошибка: ${envVar} не установлен в .env файле`);
        process.exit(1);
    }
}
const envSchema = zod_1.z.object({
    // API Tokens
    MOYSKLAD_TOKEN: zod_1.z.string(),
    // Database
    databaseUrl: zod_1.z.string().url().optional(),
    // Supabase
    supabaseUrl: zod_1.z.string().url().optional(),
    supabaseKey: zod_1.z.string().optional(),
    supabaseServiceKey: zod_1.z.string().optional(),
    // Telegram
    TELEGRAM_BOT_TOKEN: zod_1.z.string(),
    TELEGRAM_BOT_USERNAME: zod_1.z.string(),
    TELEGRAM_SECRET_KEY: zod_1.z.string(),
    NEXT_PUBLIC_WEBAPP_URL: zod_1.z.string(),
    // Cache TTL
    cacheTtl: zod_1.z.object({
        products: zod_1.z.number().default(3600),
        categories: zod_1.z.number().default(86400),
        stock: zod_1.z.number().default(300),
        images: zod_1.z.number().default(86400)
    }),
    // CORS
    CLIENT_URL: zod_1.z.string().default('http://localhost:3000'),
    // API URL
    API_URL: zod_1.z.string().default('http://localhost:3002'),
    // Server URL
    SERVER_URL: zod_1.z.string().default('http://localhost:3002')
});
// Парсим переменные окружения
exports.env = envSchema.parse({
    MOYSKLAD_TOKEN: process.env.MOYSKLAD_TOKEN,
    CLIENT_URL: process.env.CORS_ORIGIN || 'http://localhost:3000',
    API_URL: process.env.API_URL || 'http://localhost:3002',
    SERVER_URL: process.env.SERVER_URL || 'http://localhost:3002',
    databaseUrl: process.env.DATABASE_URL,
    supabaseUrl: process.env.SUPABASE_URL,
    supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN,
    TELEGRAM_BOT_USERNAME: process.env.TELEGRAM_BOT_USERNAME,
    TELEGRAM_SECRET_KEY: process.env.TELEGRAM_SECRET_KEY,
    NEXT_PUBLIC_WEBAPP_URL: process.env.NEXT_PUBLIC_WEBAPP_URL,
    cacheTtl: {
        products: Number(process.env.CACHE_TTL_PRODUCTS) || 3600,
        categories: Number(process.env.CACHE_TTL_CATEGORIES) || 86400,
        stock: Number(process.env.CACHE_TTL_STOCK) || 300,
        images: Number(process.env.CACHE_TTL_IMAGES) || 86400
    }
});
