import type { Product } from './product';

export interface Wishlist {
  id: number;
  userId: number;
  products: Product[];
}
