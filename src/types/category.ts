export interface Category {
  id: string;
  name: string;
  parentId?: string;
  description?: string;
  imageUrl?: string;
}

export interface MoySkladCategory {
  id: string;
  name: string;
  parentId?: string;
  description?: string;
  imageUrl?: string;
  meta: {
    href: string;
    type: string;
    mediaType: string;
  };
} 