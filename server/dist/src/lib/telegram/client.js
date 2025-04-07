"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.telegramClient = void 0;
const axios_1 = __importDefault(require("axios"));
const telegram_1 = require("../../config/telegram");
const crypto_1 = require("crypto");
class TelegramClient {
    constructor() {
        this.client = axios_1.default.create({
            baseURL: `https://api.telegram.org/bot${telegram_1.TELEGRAM_CONFIG.botToken}`,
            timeout: 10000
        });
    }
    static getInstance() {
        if (!TelegramClient.instance) {
            TelegramClient.instance = new TelegramClient();
        }
        return TelegramClient.instance;
    }
    async sendMessage(params) {
        return this.client.post('/sendMessage', params);
    }
    validateWebAppData(data) {
        const { hash, ...dataWithoutHash } = data;
        const dataCheckString = Object.entries(dataWithoutHash)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([key, value]) => `${key}=${value}`)
            .join('\n');
        const secretKey = (0, crypto_1.createHash)('sha256')
            .update(telegram_1.TELEGRAM_CONFIG.botToken)
            .digest();
        const expectedHash = (0, crypto_1.createHmac)('sha256', secretKey)
            .update(dataCheckString)
            .digest('hex');
        return hash === expectedHash;
    }
}
exports.telegramClient = TelegramClient.getInstance();
