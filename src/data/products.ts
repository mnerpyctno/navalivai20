export interface Product {
  id: string;
  name: string;
  price: number;
  oldPrice?: number;
  image: string | null;
  categoryId: string;
  available: boolean;
}

export const products: Product[] = [
  {
    id: '1',
    name: 'Жидкость "Мятная свежесть"',
    price: 29.99,
    oldPrice: 34.99,
    image: '/products/liquid1.png',
    categoryId: '1',
    available: true
  },
  {
    id: '2',
    name: 'Одноразка "Blueberry Ice"',
    price: 19.99,
    image: '/products/disposable1.png',
    categoryId: '2',
    available: true
  },
  {
    id: '3',
    name: 'Сменный испаритель',
    price: 9.99,
    image: '/products/coil1.png',
    categoryId: '3',
    available: true
  },
  {
    id: '4',
    name: 'Снюс "Mint"',
    price: 14.99,
    image: '/products/snus1.png',
    categoryId: '4',
    available: true
  },
  {
    id: '5',
    name: 'Pod-система "Mini"',
    price: 39.99,
    image: '/products/device1.png',
    categoryId: '5',
    available: true
  },
  {
    id: '6',
    name: 'Энергетик "Power"',
    price: 4.99,
    image: '/products/drink1.png',
    categoryId: '6',
    available: true
  }
]; 