"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleMoySkladError = void 0;
const logger_1 = __importDefault(require("./logger"));
const handleMoySkladError = (error, res) => {
    var _a, _b, _c, _d, _e;
    logger_1.default.error('MoySklad API Error:', {
        error: error.message,
        response: (_a = error.response) === null || _a === void 0 ? void 0 : _a.data,
        status: (_b = error.response) === null || _b === void 0 ? void 0 : _b.status,
        stack: error.stack
    });
    if (error.response) {
        // Ошибка от API МойСклад
        res.status(error.response.status).json({
            error: ((_e = (_d = (_c = error.response.data) === null || _c === void 0 ? void 0 : _c.errors) === null || _d === void 0 ? void 0 : _d[0]) === null || _e === void 0 ? void 0 : _e.error) || 'Ошибка при обращении к API МойСклад',
            details: error.response.data
        });
    }
    else if (error.request) {
        // Ошибка сети
        logger_1.default.error('Network Error:', {
            error: error.message,
            stack: error.stack
        });
        res.status(500).json({
            error: 'Ошибка сети при обращении к API МойСклад',
            details: error.message
        });
    }
    else {
        // Другая ошибка
        logger_1.default.error('Unexpected Error:', {
            error: error.message,
            stack: error.stack
        });
        res.status(500).json({
            error: 'Внутренняя ошибка сервера',
            details: error.message
        });
    }
};
exports.handleMoySkladError = handleMoySkladError;
