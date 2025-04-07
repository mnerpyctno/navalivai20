"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const products_1 = __importDefault(require("./products"));
const categories_1 = __importDefault(require("./categories"));
const image_1 = __importDefault(require("./moysklad/image"));
const search_1 = __importDefault(require("./search"));
const stock_1 = __importDefault(require("./stock"));
const cart_1 = __importDefault(require("./cart"));
const router = (0, express_1.Router)();
router.use((req, res, next) => {
    console.log('API request:', {
        method: req.method,
        url: req.url,
        query: req.query,
        timestamp: new Date().toISOString()
    });
    next();
});
// Проверка работоспособности сервера
router.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
});
router.use('/products', products_1.default);
router.use('/categories', categories_1.default);
router.use('/moysklad/image', image_1.default);
router.use('/search', search_1.default);
router.use('/stock', stock_1.default);
router.use('/cart', cart_1.default);
exports.default = router;
