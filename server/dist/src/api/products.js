"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const moysklad_1 = require("../config/moysklad");
const errorHandler_1 = require("../utils/errorHandler");
const router = (0, express_1.Router)();
// Преобразуем URL в формат miniature-prod.moysklad.ru
const transformImageUrl = (url) => {
    if (!url)
        return null;
    // Извлекаем ID организации и изображения из URL
    const matches = url.match(/\/download\/([^/]+)\/([^/]+)/);
    if (!matches)
        return url;
    const [_, orgId, imageId] = matches;
    return `https://miniature-prod.moysklad.ru/miniature/${orgId}/documentminiature/${imageId}`;
};
// Получение остатков для продукта
async function getProductStock(productId) {
    var _a;
    try {
        const stockResponse = await moysklad_1.moySkladClient.get('/report/stock/bystore', {
            params: {
                filter: `product=https://api.moysklad.ru/api/remap/1.2/entity/product/${productId}`
            }
        });
        if (!stockResponse.data.rows || !stockResponse.data.rows.length) {
            return {
                stock: 0,
                reserve: 0,
                inTransit: 0,
                available: false
            };
        }
        const stockItem = stockResponse.data.rows[0];
        const stockByStore = ((_a = stockItem.stockByStore) === null || _a === void 0 ? void 0 : _a[0]) || {};
        return {
            stock: stockByStore.stock || 0,
            reserve: stockByStore.reserve || 0,
            inTransit: stockByStore.inTransit || 0,
            available: (stockByStore.stock || 0) - (stockByStore.reserve || 0) > 0
        };
    }
    catch (error) {
        console.error('Error fetching product stock:', error);
        throw error;
    }
}
// Получение списка продуктов
router.get('/', async (req, res) => {
    try {
        const { limit = 24, offset = 0, categoryId } = req.query;
        // Формируем параметры запроса
        const params = {
            expand: 'images,salePrices,productFolder,images.rows,images.rows.miniature,images.rows.tiny,images.rows.meta,images.rows.title,images.rows.type,images.rows.mediaType',
            filter: 'archived=false',
            limit: categoryId ? 100 : limit,
            offset: categoryId ? 0 : offset,
            order: 'name,asc'
        };
        // Получаем продукты
        const response = await moysklad_1.moySkladClient.get('/entity/product', {
            params
        });
        let filteredProducts = response.data.rows;
        let totalSize = response.data.meta.size;
        // Если указан categoryId, фильтруем товары на сервере
        if (categoryId) {
            filteredProducts = filteredProducts.filter((product) => { var _a; return ((_a = product.productFolder) === null || _a === void 0 ? void 0 : _a.id) === categoryId; });
            totalSize = filteredProducts.length;
            // Применяем пагинацию после фильтрации
            const startIndex = parseInt(offset);
            const endIndex = startIndex + parseInt(limit);
            filteredProducts = filteredProducts.slice(startIndex, endIndex);
        }
        // Получаем остатки для всех продуктов
        const stockResponse = await moysklad_1.moySkladClient.get('/report/stock/bystore');
        // Создаем карту остатков по ID продукта
        const stockMap = new Map();
        if (stockResponse.data.rows) {
            stockResponse.data.rows.forEach((item) => {
                var _a;
                if (item.meta && item.meta.href) {
                    const productId = item.meta.href.split('/').pop();
                    const stockByStore = ((_a = item.stockByStore) === null || _a === void 0 ? void 0 : _a[0]) || {};
                    const stock = stockByStore.stock || 0;
                    const reserve = stockByStore.reserve || 0;
                    stockMap.set(productId, {
                        stock,
                        available: stock - reserve > 0
                    });
                }
            });
        }
        const products = filteredProducts.map((product) => {
            var _a, _b, _c, _d, _e, _f, _g, _h;
            // Пробуем найти цену в следующем порядке:
            // 1. Цена продажи
            // 2. Розничная цена
            // 3. Цена
            // 4. Первая доступная цена
            const retailPrice = ((_a = product.salePrices) === null || _a === void 0 ? void 0 : _a.find((price) => {
                var _a, _b, _c;
                return ((_a = price.priceType) === null || _a === void 0 ? void 0 : _a.name) === 'Цена продажи' ||
                    ((_b = price.priceType) === null || _b === void 0 ? void 0 : _b.name) === 'Розничная цена' ||
                    ((_c = price.priceType) === null || _c === void 0 ? void 0 : _c.name) === 'Цена';
            })) || ((_b = product.salePrices) === null || _b === void 0 ? void 0 : _b[0]);
            // Если цена существует, делим на 100, иначе 0
            const price = (retailPrice === null || retailPrice === void 0 ? void 0 : retailPrice.value) ? retailPrice.value / 100 : 0;
            // Получаем URL изображения
            const imageUrl = ((_f = (_e = (_d = (_c = product.images) === null || _c === void 0 ? void 0 : _c.rows) === null || _d === void 0 ? void 0 : _d[0]) === null || _e === void 0 ? void 0 : _e.miniature) === null || _f === void 0 ? void 0 : _f.href) || null;
            const finalImageUrl = transformImageUrl(imageUrl);
            const stockInfo = stockMap.get(product.id) || {
                stock: 0,
                available: false
            };
            return {
                id: product.id,
                name: product.name,
                description: product.description || '',
                price: price,
                imageUrl: finalImageUrl,
                categoryId: ((_g = product.productFolder) === null || _g === void 0 ? void 0 : _g.id) || '',
                categoryName: ((_h = product.productFolder) === null || _h === void 0 ? void 0 : _h.name) || '',
                available: !product.archived && stockInfo.available,
                stock: stockInfo.stock
            };
        });
        res.json({
            rows: products,
            meta: {
                size: totalSize,
                limit: parseInt(limit),
                offset: parseInt(offset)
            }
        });
    }
    catch (error) {
        (0, errorHandler_1.handleMoySkladError)(error, res);
    }
});
// Получение изображений продукта
router.get('/:id/images', async (req, res) => {
    var _a, _b;
    try {
        const { id } = req.params;
        const response = await moysklad_1.moySkladClient.get(`/entity/product/${id}`, {
            params: {
                expand: 'images,images.rows,images.rows.miniature,images.rows.tiny,images.rows.meta'
            }
        });
        const images = ((_b = (_a = response.data.images) === null || _a === void 0 ? void 0 : _a.rows) === null || _b === void 0 ? void 0 : _b.map((image) => {
            var _a, _b;
            return ({
                ...image,
                miniature: {
                    ...image.miniature,
                    downloadHref: transformImageUrl((_a = image.miniature) === null || _a === void 0 ? void 0 : _a.href)
                },
                tiny: {
                    ...image.tiny,
                    downloadHref: transformImageUrl((_b = image.tiny) === null || _b === void 0 ? void 0 : _b.href)
                }
            });
        })) || [];
        res.json({ rows: images });
    }
    catch (error) {
        (0, errorHandler_1.handleMoySkladError)(error, res);
    }
});
// Получение продукта по ID
router.get('/:id', async (req, res) => {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    try {
        const { id } = req.params;
        console.log('🔍 Modal window product request:', {
            productId: id,
            params: req.params,
            query: req.query,
            timestamp: new Date().toISOString()
        });
        const response = await moysklad_1.moySkladClient.get(`/entity/product/${id}`, {
            params: {
                expand: 'images,salePrices,productFolder,images.rows,images.rows.miniature,images.rows.tiny,images.rows.meta,images.rows.title,images.rows.type,images.rows.mediaType'
            }
        });
        const product = response.data;
        console.log('📦 Modal window raw product data:', {
            id: product.id,
            name: product.name,
            salePrices: product.salePrices,
            images: product.images,
            timestamp: new Date().toISOString()
        });
        // Получаем URL изображения
        const imageUrl = ((_d = (_c = (_b = (_a = product.images) === null || _a === void 0 ? void 0 : _a.rows) === null || _b === void 0 ? void 0 : _b[0]) === null || _c === void 0 ? void 0 : _c.miniature) === null || _d === void 0 ? void 0 : _d.href) || null;
        const finalImageUrl = transformImageUrl(imageUrl);
        // Пробуем найти цену в следующем порядке:
        // 1. Цена продажи
        // 2. Розничная цена
        // 3. Цена
        // 4. Первая доступная цена
        const retailPrice = ((_e = product.salePrices) === null || _e === void 0 ? void 0 : _e.find((price) => {
            var _a, _b, _c;
            return ((_a = price.priceType) === null || _a === void 0 ? void 0 : _a.name) === 'Цена продажи' ||
                ((_b = price.priceType) === null || _b === void 0 ? void 0 : _b.name) === 'Розничная цена' ||
                ((_c = price.priceType) === null || _c === void 0 ? void 0 : _c.name) === 'Цена';
        })) || ((_f = product.salePrices) === null || _f === void 0 ? void 0 : _f[0]);
        // Если цена существует, делим на 100, иначе 0
        const price = (retailPrice === null || retailPrice === void 0 ? void 0 : retailPrice.value) ? retailPrice.value / 100 : 0;
        // Получаем остатки для продукта
        const stockData = await getProductStock(id);
        const result = {
            id: product.id,
            name: product.name,
            description: product.description || '',
            price: price,
            imageUrl: finalImageUrl,
            categoryId: ((_g = product.productFolder) === null || _g === void 0 ? void 0 : _g.id) || '',
            categoryName: ((_h = product.productFolder) === null || _h === void 0 ? void 0 : _h.name) || '',
            article: product.article || '',
            weight: product.weight || 0,
            volume: product.volume || 0,
            isArchived: product.archived || false,
            available: !product.archived && stockData.available,
            stock: stockData.stock || 0,
            hasImage: !!finalImageUrl
        };
        res.json(result);
    }
    catch (error) {
        (0, errorHandler_1.handleMoySkladError)(error, res);
    }
});
// Получение категорий
router.get('/categories', async (req, res) => {
    try {
        const response = await moysklad_1.moySkladClient.get('/entity/productfolder');
        res.json(response.data);
    }
    catch (error) {
        (0, errorHandler_1.handleMoySkladError)(error, res);
    }
});
exports.default = router;
