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
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  comment?: string;
  status?: "PENDING" | "PAID" | "FULFILLED" | "CANCELED" | "CONFIRMED";
  total?: number;
}

