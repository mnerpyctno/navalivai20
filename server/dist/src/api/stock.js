"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const moysklad_1 = require("../config/moysklad");
const errorHandler_1 = require("../utils/errorHandler");
const router = (0, express_1.Router)();
// Получение остатков для всех товаров
router.get('/', async (req, res) => {
    try {
        console.log('Stock API request:', {
            query: req.query,
            timestamp: new Date().toISOString()
        });
        // Получаем остатки по складам
        const stockResponse = await moysklad_1.moySkladClient.get('/report/stock/bystore');
        // Преобразуем ответ в удобный формат
        const stockData = [];
        if (stockResponse.data.rows) {
            stockResponse.data.rows.forEach((item) => {
                var _a;
                if (item.meta && item.meta.href) {
                    const productId = item.meta.href.split('/').pop();
                    const stockByStore = ((_a = item.stockByStore) === null || _a === void 0 ? void 0 : _a[0]) || {};
                    const stock = stockByStore.stock || 0;
                    const reserve = stockByStore.reserve || 0;
                    stockData.push({
                        productId,
                        stock,
                        reserve,
                        inTransit: stockByStore.inTransit || 0,
                        available: stock - reserve > 0
                    });
                }
            });
        }
        res.json(stockData);
    }
    catch (error) {
        console.error('Error fetching stock:', {
            error: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined,
            timestamp: new Date().toISOString()
        });
        (0, errorHandler_1.handleMoySkladError)(error, res);
    }
});
// Получение остатков для конкретного товара
router.get('/:productId', async (req, res) => {
    var _a;
    try {
        const { productId } = req.params;
        console.log('Stock API request for product:', {
            productId,
            timestamp: new Date().toISOString()
        });
        // Получаем остатки по складам для конкретного товара
        const stockResponse = await moysklad_1.moySkladClient.get('/report/stock/bystore', {
            params: {
                filter: `product=https://api.moysklad.ru/api/remap/1.2/entity/product/${productId}`
            }
        });
        if (!stockResponse.data.rows || !stockResponse.data.rows.length) {
            return res.status(404).json({ error: 'Product stock not found' });
        }
        const stockItem = stockResponse.data.rows[0];
        const stockByStore = ((_a = stockItem.stockByStore) === null || _a === void 0 ? void 0 : _a[0]) || {};
        const stock = stockByStore.stock || 0;
        const reserve = stockByStore.reserve || 0;
        const stockData = {
            productId,
            stock,
            reserve,
            inTransit: stockByStore.inTransit || 0,
            available: stock - reserve > 0
        };
        res.json(stockData);
    }
    catch (error) {
        console.error('Error fetching product stock:', {
            error: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined,
            timestamp: new Date().toISOString()
        });
        (0, errorHandler_1.handleMoySkladError)(error, res);
    }
});
exports.default = router;
