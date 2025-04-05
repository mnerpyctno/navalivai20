  async getProductById(id: string): Promise<MoySkladProduct> {
    const response = await moySkladApi.get('', {
      params: {
        method: 'get',
        url: `/entity/product/${id}`
      }
    });
    return response.data;
  }

  async getCategories(): Promise<MoySkladResponse<MoySkladCategory>> {
    const response = await moySkladApi.get('', {
      params: {
        method: 'get',
        url: '/entity/productfolder'
      }
    });
    return response.data;
  } 