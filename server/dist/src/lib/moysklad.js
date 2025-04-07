"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MoySkladAPI = void 0;
const axios_1 = __importDefault(require("axios"));
class MoySkladAPI {
    constructor() {
        this.baseUrl = 'https://api.moysklad.ru/api/remap/1.2';
        this.token = process.env.MOYSKLAD_TOKEN || '';
        if (!this.token) {
            throw new Error('MOYSKLAD_TOKEN is not set');
        }
    }
    static getInstance() {
        if (!MoySkladAPI.instance) {
            MoySkladAPI.instance = new MoySkladAPI();
        }
        return MoySkladAPI.instance;
    }
    getHeaders() {
        return {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'application/json',
        };
    }
    async upsertCustomer(userId, customerData) {
        try {
            // Поиск существующего клиента
            const response = await axios_1.default.get(`${this.baseUrl}/entity/counterparty`, {
                headers: this.getHeaders(),
                params: {
                    filter: `code=${userId}`,
                },
            });
            const existingCustomer = response.data.rows[0];
            if (existingCustomer) {
                // Обновление существующего клиента
                const updatedCustomer = await axios_1.default.put(`${this.baseUrl}/entity/counterparty/${existingCustomer.id}`, {
                    ...existingCustomer,
                    ...customerData,
                }, {
                    headers: this.getHeaders(),
                });
                return updatedCustomer.data;
            }
            else {
                // Создание нового клиента
                const newCustomer = await axios_1.default.post(`${this.baseUrl}/entity/counterparty`, {
                    ...customerData,
                    code: userId,
                }, {
                    headers: this.getHeaders(),
                });
                return newCustomer.data;
            }
        }
        catch (error) {
            console.error('Error in upsertCustomer:', error);
            throw error;
        }
    }
}
exports.MoySkladAPI = MoySkladAPI;
