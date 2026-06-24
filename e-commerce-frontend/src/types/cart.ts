export interface CartItem {
  productId: number;
  title: string;
  price: number;
  quantity: number;
  image: string;
}

export interface CartResponse {
  id: number;
  userId: number;
  items: CartItem[];
}

export interface AddToCartRequest {
  userId: number;
  productId: number;
  quantity: number;
}
