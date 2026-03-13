import prisma from "../prisma/client.js";
import { Invoice, CreateInvoiceDto, UpdateInvoiceDto } from "../types/invoices.js";
import { HttpError } from "../utils/httpError.js";
import { Decimal } from "@prisma/client/runtime/library.js";
// import { generateInvoicePdf } from "../utils/invoicePdfGenerator.js";
// import path from "path";
// import fs from "fs";


export async function getAllInvoices(): Promise<Invoice[]> {
  const invoices = await prisma.invoice.findMany({
    include: { order: { include: { items: { include: { product: true } } } } },
  });

  return invoices.map(mapInvoice);
}

export async function getInvoiceById(id: number): Promise<Invoice | null> {
  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: { order: { include: { items: { include: { product: true } } } } },
  });

  return invoice ? mapInvoice(invoice) : null;
}

export async function getInvoiceByOrderId(orderId: number): Promise<Invoice | null> {
  const invoice = await prisma.invoice.findFirst({
    where: { orderId },
    include: { order: { include: { items: { include: { product: true } } } } },
  });

  return invoice ? mapInvoice(invoice) : null;
}

export async function createInvoice(data: CreateInvoiceDto): Promise<Invoice> {
  const order = await prisma.order.findUnique({
    where: { id: data.orderId },
    include: { items: true },
  });
  if (!order) throw new HttpError(404, "Order not found");

  // считаем total через Decimal
  const total = order.items.reduce((sum, i) => sum + Number(i.price) * i.quantity, 0);

  const invoice = await prisma.invoice.create({
    data: {
      orderId: data.orderId,
      note: data.note,
      total,
    },
  });

  return mapInvoice(invoice);
}

export async function updateInvoice(id: number, data: UpdateInvoiceDto): Promise<Invoice> {
  try {
    const invoice = await prisma.invoice.update({
      where: { id },
      data,
    });
    return mapInvoice(invoice);
  } catch (e: any) {
    if (e.code === "P2025") throw new HttpError(404, "Invoice not found");
    throw e;
  }
}

export async function deleteInvoice(id: number): Promise<{ success: boolean }> {
  try {
    await prisma.invoice.delete({ where: { id } });
    return { success: true };
  } catch (e: any) {
    if (e.code === "P2025") throw new HttpError(404, "Invoice not found");
    throw e;
  }
}

/** Маппинг Prisma Invoice → фронтенд Invoice */
function mapInvoice(invoice: any): Invoice {
  return {
    id: invoice.id,
    orderId: invoice.orderId,
    issuedAt: invoice.issuedAt.toISOString(),
    paid: invoice.paid,
    total: Number(invoice.total),
    pdfUrl: invoice.pdfUrl ?? undefined,
    note: invoice.note ?? undefined,

    order: invoice.order
      ? {
          customerName: invoice.order.customerName,
          customerEmail: invoice.order.customerEmail,
          customerPhone: invoice.order.customerPhone,
          items: invoice.order.items,
        }
      : undefined,
  };
}