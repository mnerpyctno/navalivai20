import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://navalivai20.vercel.app';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getProducts = async (query: string = '', page: number = 1, limit: number = 24) => {
  try {
    const response = await api.get('/api/products', {
      params: {
        q: query,
        limit,
        offset: (page - 1) * limit
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

export const getProductById = async (id: string) => {
  try {
    const response = await api.get(`/api/products/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching product:', error);
    throw error;
  }
};

export const searchProducts = async (query: string) => {
  try {
    const response = await api.get('/api/search', {
      params: { q: query }
    });
    return response.data;
  } catch (error) {
    console.error('Error searching products:', error);
    throw error;
  }
};

export const getCategories = async () => {
  try {
    const response = await api.get('/api/categories');
    return response.data;
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
};

export const getStock = async (productId?: string) => {
  try {
    const url = productId ? `/api/stock/${productId}` : '/api/stock';
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching stock:', error);
    throw error;
  }
}; 