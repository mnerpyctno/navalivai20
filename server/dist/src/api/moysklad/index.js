"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const moysklad_1 = require("../../config/moysklad");
const image_1 = __importDefault(require("./image"));
const orders_1 = __importDefault(require("./orders"));
const categories_1 = __importDefault(require("./categories"));
const router = (0, express_1.Router)();
// Подключаем все роуты МойСклад
router.use('/image', image_1.default);
router.use('/orders', orders_1.default);
router.use('/categories', categories_1.default);
// Получение информации о компании
router.get('/company', async (req, res) => {
    try {
        const response = await moysklad_1.moySkladClient.get('entity/organization');
        res.json(response.data);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch company info' });
    }
});
// Получение информации о складах
router.get('/warehouses', async (req, res) => {
    try {
        const response = await moysklad_1.moySkladClient.get('entity/store');
        res.json(response.data);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch warehouses' });
    }
});
exports.default = router;
