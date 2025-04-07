"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const moysklad_1 = require("../../config/moysklad");
const errorHandler_1 = require("../../utils/errorHandler");
const router = (0, express_1.Router)();
// Получение списка категорий
router.get('/', async (req, res) => {
    try {
        const response = await moysklad_1.moySkladClient.get('/entity/productfolder');
        res.json(response.data);
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
        res.json(response.data);
    }
    catch (error) {
        (0, errorHandler_1.handleMoySkladError)(error, res);
    }
});
exports.default = router;
