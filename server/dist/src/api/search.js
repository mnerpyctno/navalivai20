"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const moysklad_1 = require("../config/moysklad");
const router = express_1.default.Router();
router.get('/', async (req, res) => {
    var _a, _b;
    try {
        const { q: query, limit = 24, offset = 0 } = req.query;
        console.log('Search request received:', { query, limit, offset });
        if (!query) {
            console.log('No search query provided');
            return res.status(400).json({ error: 'Search query is required' });
        }
        const encodedQuery = encodeURIComponent(query);
        console.log('Encoded query:', encodedQuery);
        const requestParams = {
            expand: 'images,salePrices,productFolder,images.rows,images.rows.miniature,images.rows.tiny,images.rows.meta,images.rows.title,images.rows.type,images.rows.mediaType',
            filter: `name~${encodedQuery}`,
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: 'name,asc'
        };
        console.log('Request params:', requestParams);
        const response = await moysklad_1.moySkladClient.get('/entity/product', { params: requestParams });
        console.log('MoySklad response status:', response.status);
        console.log('MoySklad response data:', response.data);
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
        const products = response.data.rows.map((product) => {
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
            const finalImageUrl = transformImageUrl(imageUrl);
            // Получаем информацию о наличии
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
                size: response.data.meta.size,
                limit: parseInt(limit),
                offset: parseInt(offset)
            }
        });
    }
    catch (error) {
        console.error('Search error details:', {
            message: error.message,
            response: (_a = error.response) === null || _a === void 0 ? void 0 : _a.data,
            status: (_b = error.response) === null || _b === void 0 ? void 0 : _b.status,
            stack: error.stack
        });
        res.status(500).json({ error: 'Failed to search products' });
    }
});
exports.default = router;
