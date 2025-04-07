"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const moysklad_1 = require("../../config/moysklad");
const env_1 = require("../../config/env");
const router = (0, express_1.Router)();
// Кэш для изображений
const imageCache = new Map();
const CACHE_TTL = env_1.env.cacheTtl.images || 3600000; // 1 час по умолчанию
// Маршрут для обработки изображений по ID
router.get('/:imageId', async (req, res) => {
    try {
        const { imageId } = req.params;
        if (!imageId) {
            console.log('No image ID provided:', {
                params: req.params,
                timestamp: new Date().toISOString()
            });
            return res.status(400).json({ error: 'Image ID is required' });
        }
        const imageUrl = `https://api.moysklad.ru/api/remap/1.2/download/${imageId}`;
        console.log('Image request details:', {
            imageId,
            imageUrl,
            timestamp: new Date().toISOString()
        });
        // Проверяем кэш
        const cachedImage = imageCache.get(imageUrl);
        if (cachedImage && Date.now() - cachedImage.timestamp < CACHE_TTL) {
            console.log('Using cached image:', {
                imageId,
                timestamp: new Date().toISOString()
            });
            res.set('Content-Type', cachedImage.contentType);
            return res.send(cachedImage.data);
        }
        const response = await moysklad_1.moySkladImageClient.get(imageUrl, {
            responseType: 'arraybuffer',
            headers: {
                'Accept': 'image/*'
            }
        });
        console.log('Image response details:', {
            status: response.status,
            headers: response.headers,
            contentType: response.headers['content-type'],
            contentLength: response.headers['content-length'],
            timestamp: new Date().toISOString()
        });
        // Сохраняем в кэш
        imageCache.set(imageUrl, {
            data: response.data,
            contentType: response.headers['content-type'] || 'image/jpeg',
            timestamp: Date.now()
        });
        res.set('Content-Type', response.headers['content-type']);
        res.send(response.data);
    }
    catch (error) {
        console.error('Error processing image:', {
            error: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined,
            imageId: req.params.imageId,
            timestamp: new Date().toISOString()
        });
        res.status(500).json({ error: 'Failed to fetch image' });
    }
});
// Маршрут для обработки изображений по URL
router.get('/', async (req, res) => {
    try {
        const { url } = req.query;
        if (!url) {
            console.log('No image URL provided:', {
                query: req.query,
                timestamp: new Date().toISOString()
            });
            return res.status(400).json({ error: 'URL is required' });
        }
        // Декодируем URL
        const decodedUrl = decodeURIComponent(url);
        console.log('Image request details:', {
            originalUrl: url,
            decodedUrl,
            timestamp: new Date().toISOString()
        });
        // Проверяем кэш
        const cachedImage = imageCache.get(decodedUrl);
        if (cachedImage && Date.now() - cachedImage.timestamp < CACHE_TTL) {
            console.log('Using cached image:', {
                url: decodedUrl,
                timestamp: new Date().toISOString()
            });
            res.set('Content-Type', cachedImage.contentType);
            return res.send(cachedImage.data);
        }
        // Если URL уже содержит miniature=true, удаляем его
        const cleanUrl = decodedUrl.replace(/\?miniature=true$/, '');
        console.log('Fetching image from:', {
            cleanUrl,
            timestamp: new Date().toISOString()
        });
        const response = await moysklad_1.moySkladImageClient.get(cleanUrl, {
            responseType: 'arraybuffer',
            headers: {
                'Accept': 'image/*'
            }
        });
        console.log('Image response details:', {
            status: response.status,
            headers: response.headers,
            contentType: response.headers['content-type'],
            contentLength: response.headers['content-length'],
            timestamp: new Date().toISOString()
        });
        // Сохраняем в кэш
        imageCache.set(decodedUrl, {
            data: response.data,
            contentType: response.headers['content-type'] || 'image/jpeg',
            timestamp: Date.now()
        });
        res.set('Content-Type', response.headers['content-type']);
        res.send(response.data);
    }
    catch (error) {
        console.error('Error processing image:', {
            error: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined,
            url: req.query.url,
            timestamp: new Date().toISOString()
        });
        res.status(500).json({ error: 'Failed to fetch image' });
    }
});
exports.default = router;
