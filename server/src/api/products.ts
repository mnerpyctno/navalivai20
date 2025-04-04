import { Router } from 'express';
import { moySkladClient } from '../config/moysklad';
import { handleMoySkladError } from '../utils/errorHandler';
import { Product, MoySkladProduct } from '../../../src/types/product';
import { env } from '../config/env';

const router = Router();

// Получение списка продуктов
router.get('/', async (req, res) => {
  try {
    console.log('Products API request:', {
      query: req.query,
      timestamp: new Date().toISOString()
    });

    const response = await moySkladClient.get('/entity/product', {
      params: {
        expand: 'images,salePrices,productFolder,images.rows,images.rows.miniature,images.rows.tiny,images.rows.meta,images.rows.title,images.rows.type,images.rows.mediaType',
        filter: 'archived=false',
        limit: 100,
        order: 'name,asc'
      }
    });

    // Находим продукт с нужным ID
    const targetProduct = response.data.rows.find((row: any) => row.id === '43916c6f-0ce2-11f0-0a80-0c4900510119');
    
    if (targetProduct) {
      console.log('🔍 Target product details:', {
        id: targetProduct.id,
        name: targetProduct.name,
        images: {
          meta: targetProduct.images?.meta,
          rows: targetProduct.images?.rows?.map((img: any) => ({
            id: img.id,
            title: img.title,
            filename: img.filename,
            miniature: {
              href: img.miniature?.href,
              type: img.miniature?.type,
              mediaType: img.miniature?.mediaType
            },
            tiny: {
              href: img.tiny?.href,
              type: img.tiny?.type,
              mediaType: img.tiny?.mediaType
            },
            meta: img.meta
          }))
        },
        timestamp: new Date().toISOString()
      });

      // Получаем URL изображения
      const imageUrl = targetProduct.images?.rows?.[0]?.miniature?.href || targetProduct.images?.rows?.[0]?.tiny?.href;
      
      console.log('🔗 Target product image URL:', {
        productId: targetProduct.id,
        productName: targetProduct.name,
        rawImageUrl: imageUrl,
        miniatureUrl: targetProduct.images?.rows?.[0]?.miniature?.href,
        tinyUrl: targetProduct.images?.rows?.[0]?.tiny?.href,
        timestamp: new Date().toISOString()
      });

      // Преобразуем URL в формат miniature-prod.moysklad.ru
      const transformImageUrl = (url: string | null) => {
        if (!url) return null;
        
        // Извлекаем ID организации и изображения из URL
        const matches = url.match(/\/download\/([^/]+)\/([^/]+)/);
        if (!matches) return url;
        
        const [_, orgId, imageId] = matches;
        return `https://miniature-prod.moysklad.ru/miniature/${orgId}/documentminiature/${imageId}`;
      };

      const finalImageUrl = transformImageUrl(imageUrl);
      
      console.log('🎯 Target product final image URL:', {
        productId: targetProduct.id,
        productName: targetProduct.name,
        hasImageUrl: !!imageUrl,
        originalImageUrl: imageUrl,
        transformedImageUrl: finalImageUrl,
        timestamp: new Date().toISOString()
      });
    }

    const products = response.data.rows.map((product: any) => {
      // Подробное логирование цен
      console.log('💰 Product prices:', {
        productId: product.id,
        productName: product.name,
        allPrices: product.salePrices?.map((price: any) => ({
          type: price.priceType?.name,
          value: price.value,
          currency: price.currency?.name
        })),
        timestamp: new Date().toISOString()
      });

      // Пробуем найти цену в следующем порядке:
      // 1. Цена продажи
      // 2. Розничная цена
      // 3. Цена
      // 4. Первая доступная цена
      const retailPrice = product.salePrices?.find((price: { priceType?: { name: string } }) => 
        price.priceType?.name === 'Цена продажи' || 
        price.priceType?.name === 'Розничная цена' ||
        price.priceType?.name === 'Цена'
      ) || product.salePrices?.[0];

      // Если цена существует, делим на 100, иначе 0
      const price = retailPrice?.value ? retailPrice.value / 100 : 0;
      
      // Получаем URL изображения
      const imageUrl = product.images?.rows?.[0]?.miniature?.href || null;
      
      // Преобразуем URL в формат miniature-prod.moysklad.ru
      const transformImageUrl = (url: string | null) => {
        if (!url) return null;
        
        // Извлекаем ID организации и изображения из URL
        const matches = url.match(/\/download\/([^/]+)\/([^/]+)/);
        if (!matches) return url;
        
        const [_, orgId, imageId] = matches;
        return `https://miniature-prod.moysklad.ru/miniature/${orgId}/documentminiature/${imageId}`;
      };

      const finalImageUrl = transformImageUrl(imageUrl);
      
      console.log('🎯 Product data:', {
        productId: product.id,
        productName: product.name,
        price: price,
        originalImageUrl: imageUrl,
        transformedImageUrl: finalImageUrl,
        timestamp: new Date().toISOString()
      });

      return {
        id: product.id,
        name: product.name,
        description: product.description || '',
        price: price,
        imageUrl: finalImageUrl,
        categoryId: product.productFolder?.id || '',
        categoryName: product.productFolder?.name || '',
        available: !product.archived,
        stock: 0
      };
    });

    res.json({ rows: products });
  } catch (error) {
    console.error('Error fetching products:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    });
    handleMoySkladError(error, res);
  }
});

// Получение изображений продукта
router.get('/products/:id/images', async (req, res) => {
  try {
    const { id } = req.params;
    const response = await moySkladClient.get(`/entity/product/${id}`, {
      params: {
        expand: 'images'
      }
    });

    const images = response.data.images?.rows?.map((image: any) => ({
      ...image,
      miniature: {
        ...image.miniature,
        href: `/api/moysklad/image?url=${image.miniature.href}`
      }
    })) || [];

    res.json(images);
  } catch (error) {
    handleMoySkladError(error, res);
  }
});

// Получение продукта по ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log('🔍 Modal window product request:', {
      productId: id,
      params: req.params,
      query: req.query,
      timestamp: new Date().toISOString()
    });
    
    const response = await moySkladClient.get(`/entity/product/${id}`, {
      params: {
        expand: 'images,salePrices,productFolder,images.rows,images.rows.miniature,images.rows.tiny,images.rows.meta,images.rows.title,images.rows.type,images.rows.mediaType'
      }
    });
    const product = response.data;

    console.log('📦 Modal window raw product data:', {
      id: product.id,
      name: product.name,
      salePrices: product.salePrices,
      images: product.images,
      timestamp: new Date().toISOString()
    });

    // Получаем URL изображения
    const imageUrl = product.images?.rows?.[0]?.miniature?.href || null;
    
    // Преобразуем URL в формат miniature-prod.moysklad.ru
    const transformImageUrl = (url: string | null) => {
      if (!url) return null;
      
      // Извлекаем ID организации и изображения из URL
      const matches = url.match(/\/download\/([^/]+)\/([^/]+)/);
      if (!matches) return url;
      
      const [_, orgId, imageId] = matches;
      return `https://miniature-prod.moysklad.ru/miniature/${orgId}/documentminiature/${imageId}`;
    };

    const finalImageUrl = transformImageUrl(imageUrl);
    
    // Пробуем найти цену в следующем порядке:
    // 1. Цена продажи
    // 2. Розничная цена
    // 3. Цена
    // 4. Первая доступная цена
    const retailPrice = product.salePrices?.find((price: { priceType?: { name: string } }) => 
      price.priceType?.name === 'Цена продажи' || 
      price.priceType?.name === 'Розничная цена' ||
      price.priceType?.name === 'Цена'
    ) || product.salePrices?.[0];

    // Если цена существует, делим на 100, иначе 0
    const price = retailPrice?.value ? retailPrice.value / 100 : 0;
    
    console.log('🎯 Modal window product data:', {
      productId: product.id,
      productName: product.name,
      salePrices: product.salePrices,
      retailPrice,
      finalPrice: price,
      hasImageUrl: !!imageUrl,
      originalImageUrl: imageUrl,
      transformedImageUrl: finalImageUrl,
      timestamp: new Date().toISOString()
    });

    const finalProduct = {
      id: product.id,
      name: product.name,
      description: product.description || '',
      price,
      imageUrl: finalImageUrl,
      categoryId: product.productFolder?.id,
      categoryName: product.productFolder?.name,
      article: product.article || '',
      weight: product.weight || 0,
      volume: product.volume || 0,
      isArchived: product.archived || false,
      available: true
    };

    console.log('✅ Modal window response:', {
      ...finalProduct,
      hasImage: !!imageUrl,
      timestamp: new Date().toISOString()
    });

    res.json(finalProduct);
  } catch (error) {
    console.error('❌ Modal window error:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      params: req.params,
      timestamp: new Date().toISOString()
    });
    handleMoySkladError(error, res);
  }
});

// Получение категорий
router.get('/categories', async (req, res) => {
  try {
    const response = await moySkladClient.get('/entity/productfolder');
    res.json(response.data);
  } catch (error) {
    handleMoySkladError(error, res);
  }
});

export default router;