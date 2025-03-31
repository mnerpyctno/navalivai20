export interface Category {
  id: string;
  name: string;
  image: string;
}

export const categories: Category[] = [
  {
    id: '1',
    name: 'Жидкости',
    image: '/categories/liquids.png'
  },
  {
    id: '2',
    name: 'Одноразки',
    image: '/categories/disposables.png'
  },
  {
    id: '3',
    name: 'Расходники',
    image: '/categories/consumables.png'
  },
  {
    id: '4',
    name: 'Снюс',
    image: '/categories/snus.png'
  },
  {
    id: '5',
    name: 'Устройства',
    image: '/categories/devices.png'
  },
  {
    id: '6',
    name: 'Еда и напитки',
    image: '/categories/food.png'
  }
]; 