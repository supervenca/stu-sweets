export interface OrderItemDto {
  productId: number;
  quantity: number;
  price: number;
}

export interface CreateOrderDto {
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  comment?: string;
  items: OrderItemDto[];
}

export interface UpdateOrderDto {
  status?: "PENDING" | "PAID" | "FULFILLED" | "CANCELED";
}
