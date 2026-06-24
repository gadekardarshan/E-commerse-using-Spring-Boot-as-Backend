export interface OrderItem {
  productId: number;
  title: string;
  price: number;
  quantity: number;
  image: string;
}

export interface Order {
  id: number;
  userId: number;
  totalAmount: number;
  shippingAddress: string;
  phone: string;
  status: string;
  orderDate: string;
  items: OrderItem[];
}
