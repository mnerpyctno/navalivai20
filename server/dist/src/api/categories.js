"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const moysklad_1 = require("../config/moysklad");
const errorHandler_1 = require("../utils/errorHandler");
const router = (0, express_1.Router)();
// Кэш для категорий
const categoryCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 минут
// Получение списка категорий
router.get('/', async (req, res) => {
    try {
        // Проверяем кэш
        const cachedCategories = categoryCache.get('all');
        if (cachedCategories && Date.now() - cachedCategories.timestamp < CACHE_TTL) {
            console.log('Using cached categories');
            return res.json(cachedCategories.data);
        }
        const response = await moysklad_1.moySkladClient.get('/entity/productfolder', {
            params: {
                filter: 'archived=false',
                order: 'name,asc',
                limit: 100,
                offset: 0
            }
        });
        const categories = response.data.rows.map((category) => {
            var _a, _b;
            return ({
                id: category.id,
                name: category.name,
                description: category.description || '',
                image: ((_b = (_a = category.image) === null || _a === void 0 ? void 0 : _a.meta) === null || _b === void 0 ? void 0 : _b.href) || null
            });
        });
        // Сохраняем в кэш
        categoryCache.set('all', {
            data: categories,
            timestamp: Date.now()
        });
        res.json({
            rows: categories,
            meta: response.data.meta
        });
    }
    catch (error) {
        (0, errorHandler_1.handleMoySkladError)(error, res);
    }
});
// Получение категории по ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const response = await moysklad_1.moySkladClient.get(`/entity/productfolder/${id}`);
        const category = {
            id: response.data.id,
            name: response.data.name,
            description: response.data.description || '',
            image: '/default-category.jpg' // Временно используем дефолтное изображение
        };
        res.json(category);
    }
    catch (error) {
        (0, errorHandler_1.handleMoySkladError)(error, res);
    }
});
exports.default = router;
