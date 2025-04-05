import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

class RateLimiter {
  private queue: Array<() => Promise<any>> = [];
  private isProcessing = false;
  private lastRequestTime = 0;
  private readonly minInterval = 200; // Минимальный интервал между запросами в мс

  async enqueue<T>(request: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await request();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });

      this.processQueue();
    });
  }

  private async processQueue() {
    if (this.isProcessing || this.queue.length === 0) return;

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
    } finally {
      this.isProcessing = false;
      if (this.queue.length > 0) {
        this.processQueue();
      }
    }
  }
}

export function createRateLimitedAxiosClient(baseClient: AxiosInstance): AxiosInstance {
  const rateLimiter = new RateLimiter();

  const rateLimitedClient = axios.create({
    ...baseClient.defaults,
  });

  rateLimitedClient.interceptors.request.use(async (config: AxiosRequestConfig) => {
    return rateLimiter.enqueue(() => baseClient.request(config));
  });

  return rateLimitedClient;
} 