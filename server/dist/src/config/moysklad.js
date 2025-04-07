"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.moySkladImageClient = exports.moySkladClient = void 0;
const axios_1 = __importDefault(require("axios"));
const env_1 = require("./env");
exports.moySkladClient = axios_1.default.create({
    baseURL: 'https://api.moysklad.ru/api/remap/1.2',
    headers: {
        'Authorization': `Bearer ${env_1.env.MOYSKLAD_TOKEN}`,
        'Content-Type': 'application/json;charset=utf-8',
        'Accept': 'application/json;charset=utf-8',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
    },
    timeout: 30000
});
// Добавляем перехватчик для логирования запросов
exports.moySkladClient.interceptors.request.use((config) => {
    console.log('MoySklad request details:', {
        url: config.url,
        method: config.method,
        params: config.params,
        headers: config.headers,
        baseURL: config.baseURL,
        timestamp: new Date().toISOString()
    });
    return config;
});
// Добавляем перехватчик для логирования ответов
exports.moySkladClient.interceptors.response.use((response) => {
    var _a, _b, _c, _d, _e;
    // Проверяем, что это запрос продуктов и находим нужный продукт
    if (((_a = response.config.url) === null || _a === void 0 ? void 0 : _a.includes('/entity/product')) && !response.config.url.includes('/images')) {
        const targetProduct = (_b = response.data.rows) === null || _b === void 0 ? void 0 : _b.find((row) => row.id === '43916c6f-0ce2-11f0-0a80-0c4900510119');
        if (targetProduct) {
            console.log('🔍 Target product API response:', {
                url: response.config.url,
                method: response.config.method,
                status: response.status,
                statusText: response.statusText,
                product: {
                    id: targetProduct.id,
                    name: targetProduct.name,
                    images: {
                        meta: (_c = targetProduct.images) === null || _c === void 0 ? void 0 : _c.meta,
                        rows: (_e = (_d = targetProduct.images) === null || _d === void 0 ? void 0 : _d.rows) === null || _e === void 0 ? void 0 : _e.map((img) => ({
                            id: img.id,
                            title: img.title,
                            filename: img.filename,
                            miniature: img.miniature,
                            tiny: img.tiny,
                            meta: img.meta
                        }))
                    }
                },
                timestamp: new Date().toISOString()
            });
        }
    }
    return response;
}, (error) => {
    var _a, _b, _c, _d, _e;
    console.error('MoySklad error details:', {
        url: (_a = error.config) === null || _a === void 0 ? void 0 : _a.url,
        method: (_b = error.config) === null || _b === void 0 ? void 0 : _b.method,
        status: (_c = error.response) === null || _c === void 0 ? void 0 : _c.status,
        statusText: (_d = error.response) === null || _d === void 0 ? void 0 : _d.statusText,
        data: (_e = error.response) === null || _e === void 0 ? void 0 : _e.data,
        timestamp: new Date().toISOString()
    });
    return Promise.reject(error);
});
exports.moySkladImageClient = axios_1.default.create({
    baseURL: '',
    headers: {
        'Authorization': `Bearer ${env_1.env.MOYSKLAD_TOKEN}`,
        'Accept': 'image/*'
    },
    responseType: 'arraybuffer'
});
// Добавляем перехватчик для логирования запросов
exports.moySkladImageClient.interceptors.request.use((config) => {
    console.log('MoySklad image request:', {
        url: config.url,
        method: config.method,
        headers: config.headers,
        timestamp: new Date().toISOString()
    });
    return config;
});
exports.moySkladImageClient.interceptors.response.use((response) => {
    console.log('MoySklad image response:', {
        status: response.status,
        headers: response.headers,
        contentType: response.headers['content-type'],
        contentLength: response.headers['content-length'],
        timestamp: new Date().toISOString()
    });
    return response;
}, (error) => {
    var _a, _b, _c;
    console.error('MoySklad image error:', {
        error: error.message,
        url: (_a = error.config) === null || _a === void 0 ? void 0 : _a.url,
        status: (_b = error.response) === null || _b === void 0 ? void 0 : _b.status,
        headers: (_c = error.response) === null || _c === void 0 ? void 0 : _c.headers,
        timestamp: new Date().toISOString()
    });
    return Promise.reject(error);
});
