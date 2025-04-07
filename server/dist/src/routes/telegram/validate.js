"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateTelegramData = validateTelegramData;
const telegram_1 = require("../../config/telegram");
const crypto_1 = require("crypto");
async function validateTelegramData(req, res) {
    try {
        const { initData } = req.body;
        if (!initData) {
            return res.status(400).json({ ok: false, error: 'No init data provided' });
        }
        // Разбираем строку initData
        const searchParams = new URLSearchParams(initData);
        const hash = searchParams.get('hash');
        searchParams.delete('hash');
        // Сортируем оставшиеся параметры
        const params = Array.from(searchParams.entries())
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([key, value]) => `${key}=${value}`)
            .join('\n');
        // Создаем HMAC-SHA256
        const hmac = (0, crypto_1.createHmac)('sha256', telegram_1.TELEGRAM_CONFIG.secretKey);
        hmac.update(params);
        const calculatedHash = hmac.digest('hex');
        // Сравниваем хеши
        if (calculatedHash === hash) {
            res.json({ ok: true });
        }
        else {
            res.status(400).json({ ok: false, error: 'Invalid hash' });
        }
    }
    catch (error) {
        console.error('Error validating Telegram data:', error);
        res.status(500).json({ ok: false, error: 'Validation failed' });
    }
}
