import { Router } from 'express';
import { moySkladClient } from '../config/moysklad';
import { handleMoySkladError } from '../utils/errorHandler';
<<<<<<< HEAD
import { Product, MoySkladProduct, StockInfo } from '../types/product';
=======
import { Product, MoySkladProduct } from '../../../src/types/product';
>>>>>>> 403f6ea (Last version)
import { env } from '../config/env';

const router = Router();

<<<<<<< HEAD
// Преобразуем URL в формат miniature-prod.moysklad.ru
const transformImageUrl = (url: string | null) => {
  if (!url) return null;
  
  // Извлекаем ID организации и изображения из URL
  const matches = url.match(/\/download\/([^/]+)\/([^/]+)/);
  if (!matches) return url;
  
  const [_, orgId, imageId] = matches;
  return `https://miniature-prod.moysklad.ru/miniature/${orgId}/documentminiature/${imageId}`;
};

// Получение остатков для продукта
async function getProductStock(productId: string): Promise<StockInfo> {
  try {
    const stockResponse = await moySkladClient.get('/report/stock/bystore', {
      params: {
        filter: `product=https://api.moysklad.ru/api/remap/1.2/entity/product/${productId}`
      }
    });

    if (!stockResponse.data.rows || !stockResponse.data.rows.length) {
      return {
        stock: 0,
        reserve: 0,
        inTransit: 0,
        available: false
      };
    }

    const stockItem = stockResponse.data.rows[0];
    const stockByStore = stockItem.stockByStore?.[0] || {};
    
    return {
      stock: stockByStore.stock || 0,
      reserve: stockByStore.reserve || 0,
      inTransit: stockByStore.inTransit || 0,
      available: (stockByStore.stock || 0) - (stockByStore.reserve || 0) > 0
    };
  } catch (error) {
    console.error('Error fetching product stock:', error);
    throw error;
  }
}

// Получение списка продуктов
router.get('/', async (req, res) => {
  try {
    const { q = '', limit = 24, offset = 0 } = req.query;

    console.log('Запрос продуктов:', {
      query: { q, limit, offset },
      timestamp: new Date().toISOString()
    });

    const params: any = {
      filter: `archived=false;name~=${q}`,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string),
      expand: 'images,salePrices,productFolder'
    };

    const response = await moySkladClient.get('/entity/product', { params });

    if (!response.data || !response.data.rows) {
      console.error('Ошибка: Пустой ответ от API МойСклад для продуктов.');
      return res.status(500).json({ error: 'Ошибка сервера при получении продуктов' });
    }

    const products = response.data.rows.map((product: any) => ({
      id: product.id,
      name: product.name,
      description: product.description || '',
      price: product.salePrices?.[0]?.value / 100 || 0,
      imageUrl: product.images?.rows?.[0]?.miniature?.href || null,
      categoryId: product.productFolder?.id || '',
      available: !product.archived
    }));

    res.json({
      rows: products,
      meta: response.data.meta
    });
  } catch (error) {
    const err = error as any; // Приведение типа
    console.error('Ошибка при получении продуктов:', {
      message: err instanceof Error ? err.message : 'Unknown error',
      stack: err instanceof Error ? err.stack : undefined,
      response: err.response?.data,
      status: err.response?.status
    });
    res.status(500).json({ error: 'Ошибка сервера при получении продуктов' });
=======
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
>>>>>>> 403f6ea (Last version)
  }
});

// Получение изображений продукта
<<<<<<< HEAD
router.get('/:id/images', async (req, res) => {
=======
router.get('/products/:id/images', async (req, res) => {
>>>>>>> 403f6ea (Last version)
  try {
    const { id } = req.params;
    const response = await moySkladClient.get(`/entity/product/${id}`, {
      params: {
<<<<<<< HEAD
        expand: 'images,images.rows,images.rows.miniature,images.rows.tiny,images.rows.meta'
=======
        expand: 'images'
>>>>>>> 403f6ea (Last version)
      }
    });

    const images = response.data.images?.rows?.map((image: any) => ({
      ...image,
      miniature: {
        ...image.miniature,
<<<<<<< HEAD
        downloadHref: transformImageUrl(image.miniature?.href)
      },
      tiny: {
        ...image.tiny,
        downloadHref: transformImageUrl(image.tiny?.href)
      }
    })) || [];

    res.json({ rows: images });
=======
        href: `/api/moysklad/image?url=${image.miniature.href}`
      }
    })) || [];

    res.json(images);
>>>>>>> 403f6ea (Last version)
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
<<<<<<< HEAD
    const finalImageUrl = transformImageUrl(imageUrl);

=======
    
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
    
>>>>>>> 403f6ea (Last version)
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
<<<<<<< HEAD

    // Получаем остатки для продукта
    const stockData = await getProductStock(id);

    const result = {
      id: product.id,
      name: product.name,
      description: product.description || '',
      price: price,
      imageUrl: finalImageUrl,
      categoryId: product.productFolder?.id || '',
      categoryName: product.productFolder?.name || '',
=======
    
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
>>>>>>> 403f6ea (Last version)
      article: product.article || '',
      weight: product.weight || 0,
      volume: product.volume || 0,
      isArchived: product.archived || false,
<<<<<<< HEAD
      available: !product.archived && stockData.available,
      stock: stockData.stock || 0,
      hasImage: !!finalImageUrl
    };

    res.json(result);
  } catch (error) {
=======
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
>>>>>>> 403f6ea (Last version)
    handleMoySkladError(error, res);
  }
});

// Получение категорий
router.get('/categories', async (req, res) => {
  try {
<<<<<<< HEAD
    console.log('Запрос категорий:', {
      timestamp: new Date().toISOString()
    });

    const response = await moySkladClient.get('/entity/productfolder');

    if (!response.data || !response.data.rows) {
      console.error('Ошибка: Пустой ответ от API МойСклад для категорий.');
      return res.status(500).json({ error: 'Ошибка сервера при получении категорий' });
    }

    const categories = response.data.rows.map((category: any) => ({
      id: category.id,
      name: category.name,
      description: category.description || '',
      parentId: category.pathName || null
    }));

    res.json(categories);
  } catch (error) {
    const err = error as any; // Приведение типа
    console.error('Ошибка при получении категорий:', {
      message: err instanceof Error ? err.message : 'Unknown error',
      stack: err instanceof Error ? err.stack : undefined,
      response: err.response?.data,
      status: err.response?.status
    });
    res.status(500).json({ error: 'Ошибка сервера при получении категорий' });
=======
    const response = await moySkladClient.get('/entity/productfolder');
    res.json(response.data);
  } catch (error) {
    handleMoySkladError(error, res);
>>>>>>> 403f6ea (Last version)
  }
});

export default router;