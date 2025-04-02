import axios from 'axios';

const moySkladApi = axios.create({
  baseURL: 'https://api.moysklad.ru/api/remap/1.2',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

export const getStockReport = async (params: {
  limit?: number;
  offset?: number;
  expand?: string;
  moment?: string;
  groupBy?: string;
  stockMode?: string;
  store?: string;
  filter?: string;
  order?: string;
}) => {
  try {
    const response = await moySkladApi.get('report/stock/bystore', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching stock report:', error);
    throw error;
  }
};

export default moySkladApi; 