export interface InvoiceItem {
  quantity: number;
  price: number;
  product?: {
    name: string;
  };
}

export interface InvoiceOrder {
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  items: InvoiceItem[];
}

export interface Invoice {
  id: number;
  orderId: number;
  issuedAt: string;
  paid: boolean;
  total: number;
  pdfUrl?: string;
  note?: string;

  order?: InvoiceOrder;
}

export interface CreateInvoiceDto {
  orderId: number;
  note?: string;
}

export interface UpdateInvoiceDto {
  paid?: boolean;
  note?: string;
}