"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const axios_1 = __importDefault(require("axios"));
const app = (0, express_1.default)();
const port = 3001;
const DEBUG_TOKEN = '6175eccec09c995996334b76c28308771d4dc4eb';
const MS_TOKEN = process.env.MOYSKLAD_TOKEN || DEBUG_TOKEN;
const msClient = axios_1.default.create({
    baseURL: 'https://api.moysklad.ru/api/v1',
    headers: {
        'Authorization': `Bearer ${MS_TOKEN}`,
        'Content-Type': 'application/json'
    }
});
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});
app.get('/api/ms-proxy', async (req, res) => {
    var _a, _b, _c;
    try {
        const { method, url, params } = req.query;
        if (!method || !url) {
            return res.status(400).json({ error: 'Missing required parameters' });
        }
        const response = await msClient.request({
            method: method,
            url: url,
            params: params
        });
        res.json(response.data);
    }
    catch (error) {
        if (error.response) {
            res.status(error.response.status).json({
                error: error.response.data
            });
        }
        else if (error.request) {
            res.status(503).json({
                error: 'Service Unavailable - MoySklad API is not responding'
            });
        }
        else {
            res.status(500).json({
                error: error.message
            });
        }
    }
});
app.get('/api/images/:path*', async (req, res) => {
    try {
        const imageUrl = decodeURIComponent(req.params.path);
        const response = await axios_1.default.get(imageUrl, {
            responseType: 'arraybuffer',
            headers: {
                'Accept': 'image/*'
            }
        });

        res.setHeader('Content-Type', response.headers['content-type']);
        res.setHeader('Cache-Control', 'public, max-age=31536000');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.send(response.data);
    } catch (error) {
        console.error('Error fetching image:', error);
        res.status(500).json({ error: 'Failed to fetch image' });
    }
});
app.get('/api/moysklad/image/:path*', async (req, res) => {
    try {
        const imageId = req.params.path.split('?')[0];
        const response = await msClient.get(`/download/${imageId}`, {
            responseType: 'arraybuffer',
            headers: {
                'Accept': 'image/*',
                'Authorization': `Bearer ${MS_TOKEN}`
            }
        });

        res.setHeader('Content-Type', response.headers['content-type']);
        res.setHeader('Cache-Control', 'public, max-age=31536000');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.send(response.data);
    } catch (error) {
        console.error('Error fetching Moysklad image:', error);
        res.status(500).json({ error: 'Failed to fetch image' });
    }
});
app.use((err, req, res, next) => {
    console.error('Global error handler:', err.stack);
    res.status(500).json({ error: 'Something broke!' });
});
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
//# sourceMappingURL=index.js.map