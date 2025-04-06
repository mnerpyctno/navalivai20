import axios from 'axios';

export class MoySkladAPI {
  private baseURL: string;
  private token: string;

  constructor(token: string) {
    this.baseURL = 'https://api.moysklad.ru/api/remap/1.2';
    this.token = token;
  }

  private getHeaders() {
    return {
      'Authorization': `Bearer ${this.token}`,
      'Content-Type': 'application/json'
    };
  }

  async getProducts(params?: any) {
    const response = await axios.get(`${this.baseURL}/entity/product`, {
      headers: this.getHeaders(),
      params
    });
    return response.data;
  }

  async getCategories() {
    const response = await axios.get(`${this.baseURL}/entity/productfolder`, {
      headers: this.getHeaders()
    });
    return response.data;
  }

  async getStock() {
    const response = await axios.get(`${this.baseURL}/report/stock/bystore`, {
      headers: this.getHeaders()
    });
    return response.data;
  }
} 