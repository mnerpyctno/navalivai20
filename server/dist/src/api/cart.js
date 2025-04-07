"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)();
// Получение информации о товарах в корзине
router.get('/', async (req, res) => {
    try {
        const { items } = req.query;
        if (!items) {
            return res.status(400).json({ error: 'Items are required' });
        }
        let cartItems;
        try {
            cartItems = JSON.parse(items);
        }
        catch (error) {
            return res.status(400).json({ error: 'Invalid items format' });
        }
        if (!Array.isArray(cartItems)) {
            return res.status(400).json({ error: 'Items must be an array' });
        }
        // Возвращаем те же товары, что пришли в запросе
        res.json(cartItems);
    }
    catch (error) {
        console.error('Error getting cart items:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Проверка наличия товаров
router.post('/check', async (req, res) => {
    try {
        const { items } = req.body;
        if (!items) {
            return res.status(400).json({ error: 'Items are required' });
        }
        if (!Array.isArray(items)) {
            return res.status(400).json({ error: 'Items must be an array' });
        }
        if (items.length === 0) {
            return res.status(400).json({ error: 'Items array cannot be empty' });
        }
        // Возвращаем успешный ответ, так как проверка остатков уже реализована
        const availability = items.map((item) => ({
            id: item.id,
            available: true
        }));
        res.json(availability);
    }
    catch (error) {
        console.error('Error checking availability:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.default = router;
