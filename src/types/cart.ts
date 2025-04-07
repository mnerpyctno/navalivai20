// Removed unused import

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  stock: number;
  imageUrl?: string; // Add the imageUrl property
}