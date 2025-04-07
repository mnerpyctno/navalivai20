"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRateLimitedAxiosClient = createRateLimitedAxiosClient;
const axios_1 = __importDefault(require("axios"));
class RateLimiter {
    constructor() {
        this.queue = [];
        this.isProcessing = false;
        this.lastRequestTime = 0;
        this.minInterval = 200; // Минимальный интервал между запросами в мс
    }
    async enqueue(request) {
        return new Promise((resolve, reject) => {
            this.queue.push(async () => {
                try {
                    const result = await request();
                    resolve(result);
                }
                catch (error) {
                    reject(error);
                }
            });
            this.processQueue();
        });
    }
    async processQueue() {
        if (this.isProcessing || this.queue.length === 0)
            return;
        this.isProcessing = true;
        try {
            const now = Date.now();
            const timeSinceLastRequest = now - this.lastRequestTime;
            const timeToWait = Math.max(0, this.minInterval - timeSinceLastRequest);
            if (timeToWait > 0) {
                await new Promise(resolve => setTimeout(resolve, timeToWait));
            }
            const request = this.queue.shift();
            if (request) {
                this.lastRequestTime = Date.now();
                await request();
            }
        }
        finally {
            this.isProcessing = false;
            if (this.queue.length > 0) {
                this.processQueue();
            }
        }
    }
}
function createRateLimitedAxiosClient(baseClient) {
    const rateLimiter = new RateLimiter();
    const rateLimitedClient = axios_1.default.create({
        ...baseClient.defaults,
    });
    rateLimitedClient.interceptors.request.use(async (config) => {
        return rateLimiter.enqueue(() => baseClient.request(config));
    });
    return rateLimitedClient;
}
