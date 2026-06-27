export interface OrderItemDto {
  productId: number;
  quantity: number;

  message?: string;
  certificate?: boolean;

  cakeConfig?: {
    size: "SMALL" | "MEDIUM" | "LARGE";
    flavor: string;
    color: string;
    messageColor?: string;
  }
  
}

export interface CreateOrderDto {
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  comment?: string;
  items: OrderItemDto[];
  pickupDate?: string; // ISO date
}

export interface UpdateOrderDto {
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  comment?: string;
  status?: "PENDING" | "PAID" | "FULFILLED" | "CANCELED" | "CONFIRMED";
}

