export interface Invoice {
  id: number;
  orderId: number;
  issuedAt: string;
  paid: boolean;
  total: number; // приведем Decimal к number
  pdfUrl?: string;
  note?: string;
}

export interface CreateInvoiceDto {
  orderId: number;
  note?: string;
}

export interface UpdateInvoiceDto {
  paid?: boolean;
  note?: string;
}