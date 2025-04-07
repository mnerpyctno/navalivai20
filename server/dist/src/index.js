"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const apiRouter_1 = __importDefault(require("./api/apiRouter"));
const app = (0, express_1.default)();
const port = process.env.PORT || 3002;
// Настройка CORS
app.use((0, cors_1.default)({
    origin: '*', // Разрешаем все источники
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));
// Middleware
app.use(express_1.default.json());
app.use((req, res, next) => {
    console.log('Incoming request:', {
        method: req.method,
        url: req.url,
        query: req.query,
        timestamp: new Date().toISOString()
    });
    next();
});
// Подключаем все API роуты через единый роутер
app.use('/api', apiRouter_1.default);
// Обработка ошибок
app.use((err, req, res, next) => {
    console.error('Global error handler:', err.stack);
    res.status(500).json({ error: 'Internal Server Error' });
});
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
