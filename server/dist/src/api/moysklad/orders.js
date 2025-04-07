"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const moysklad_1 = require("../../config/moysklad");
const errorHandler_1 = require("../../utils/errorHandler");
const router = (0, express_1.Router)();
// Создание или обновление клиента
router.post('/customers', async (req, res) => {
    try {
        const { name, phone, email } = req.body;
        // Сначала ищем существующего клиента
        const searchResponse = await moysklad_1.moySkladClient.get('/entity/counterparty', {
            params: {
                filter: `phone=${phone}`
            }
        });
        if (searchResponse.data.rows.length > 0) {
            // Обновляем существующего клиента
            const customer = searchResponse.data.rows[0];
            const updateResponse = await moysklad_1.moySkladClient.put(`/entity/counterparty/${customer.id}`, {
                name,
                phone,
                email
            });
            res.json(updateResponse.data);
        }
        else {
            // Создаем нового клиента
            const createResponse = await moysklad_1.moySkladClient.post('/entity/counterparty', {
                name,
                phone,
                email
            });
            res.json(createResponse.data);
        }
    }
    catch (error) {
        (0, errorHandler_1.handleMoySkladError)(error, res);
    }
});
// Создание заказа
router.post('/orders', async (req, res) => {
    try {
        const { customerId, positions, description } = req.body;
        const response = await moysklad_1.moySkladClient.post('/entity/customerorder', {
            organization: {
                meta: {
                    href: process.env.MOYSKLAD_ORGANIZATION_HREF,
                    type: 'organization'
                }
            },
            agent: {
                meta: {
                    href: `/entity/counterparty/${customerId}`,
                    type: 'counterparty'
                }
            },
            positions,
            description
        });
        res.json(response.data);
    }
    catch (error) {
        (0, errorHandler_1.handleMoySkladError)(error, res);
    }
});
router.get('/', async (req, res) => {
    try {
        const response = await moysklad_1.moySkladClient.get('/entity/customerorder');
        res.json(response.data);
    }
    catch (error) {
        (0, errorHandler_1.handleMoySkladError)(error, res);
    }
});
exports.default = router;
