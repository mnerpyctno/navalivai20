"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TELEGRAM_CONFIG = void 0;
const env_1 = require("./env");
exports.TELEGRAM_CONFIG = {
    botToken: env_1.env.TELEGRAM_BOT_TOKEN,
    botUsername: env_1.env.TELEGRAM_BOT_USERNAME,
    secretKey: env_1.env.TELEGRAM_SECRET_KEY,
    webAppUrl: env_1.env.NEXT_PUBLIC_WEBAPP_URL,
    webhookUrl: `${env_1.env.NEXT_PUBLIC_WEBAPP_URL}/api/telegram/webhook`
};
