"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupWebhook = setupWebhook;
exports.handleWebhook = handleWebhook;
const telegram_1 = require("../../config/telegram");
const client_1 = require("../../lib/telegram/client");
// Команды для бота
const commands = [
    {
        command: 'start',
        description: 'Открыть магазин'
    }
];
// Настройка меню бота
const menuButton = {
    type: 'web_app',
    text: 'Открыть магазин',
    web_app: {
        url: telegram_1.TELEGRAM_CONFIG.webAppUrl
    }
};
async function setupWebhook(req, res) {
    try {
        // Устанавливаем вебхук
        await fetch(`https://api.telegram.org/bot${telegram_1.TELEGRAM_CONFIG.botToken}/setWebhook?url=${telegram_1.TELEGRAM_CONFIG.webhookUrl}`);
        // Устанавливаем команды бота
        await fetch(`https://api.telegram.org/bot${telegram_1.TELEGRAM_CONFIG.botToken}/setMyCommands`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ commands }),
        });
        // Устанавливаем меню бота
        await fetch(`https://api.telegram.org/bot${telegram_1.TELEGRAM_CONFIG.botToken}/setChatMenuButton`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ menu_button: menuButton }),
        });
        res.json({ ok: true });
    }
    catch (error) {
        console.error('Error setting up bot:', error);
        res.status(500).json({ ok: false, error: 'Failed to set up bot' });
    }
}
async function handleWebhook(req, res) {
    var _a;
    try {
        const update = req.body;
        // Обработка команды /start
        if (((_a = update.message) === null || _a === void 0 ? void 0 : _a.text) === '/start') {
            const chatId = update.message.chat.id;
            await client_1.telegramClient.sendMessage({
                chat_id: chatId,
                text: 'Добро пожаловать в магазин Наваливай! Нажмите кнопку "Открыть магазин" чтобы начать покупки.',
                reply_markup: {
                    inline_keyboard: [[
                            {
                                text: 'Открыть магазин',
                                web_app: { url: telegram_1.TELEGRAM_CONFIG.webAppUrl }
                            }
                        ]]
                }
            });
        }
        res.json({ ok: true });
    }
    catch (error) {
        console.error('Error processing update:', error);
        res.status(500).json({ ok: false, error: 'Failed to process update' });
    }
}
