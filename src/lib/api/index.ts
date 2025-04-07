import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://navalivai20.vercel.app/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getProducts = async (query = '', page = 1, limit = 24) => {
  const response = await api.get('/products', {
    params: { q: query, limit, offset: (page - 1) * limit },
  });
  return response.data;
};
