import type { Request, Response, NextFunction } from "express";
import {
  getAllInvoices,
  getInvoiceById,
  getInvoiceByOrderId,
  createInvoice,
  updateInvoice,
  deleteInvoice,
} from "../services/invoice.service.js";
import { CreateInvoiceDto, UpdateInvoiceDto } from "../types/invoices.js";
import { generateInvoicePdf } from "../utils/invoicePdfGenerator.js";
import { HttpError } from "../utils/httpError.js";

export async function getAllInvoicesController(req: Request, res: Response) {
  const invoices = await getAllInvoices();
  return res.json(invoices);
}

export async function getInvoiceByIdController(req: Request, res: Response) {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) throw new HttpError(400, "Invalid invoice id");

  const invoice = await getInvoiceById(id);
  if (!invoice) throw new HttpError(404, "Invoice not found");

  return res.json(invoice);
}

export async function getInvoiceByOrderController(req: Request, res: Response, next: NextFunction) {
  try {
    const orderId = Number(req.params.orderId);

    const invoice = await getInvoiceByOrderId(orderId);

    if (!invoice) {
      throw new HttpError(404, "Invoice not found");
    }

    const pdf = await generateInvoicePdf(invoice);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=invoice_${invoice.id}.pdf`
    );
    res.send(pdf);
  } catch (err) {
    next(err);
  }
}

export async function createInvoiceController(req: Request, res: Response) {
  const data: CreateInvoiceDto = req.body;
  const invoice = await createInvoice(data);
  return res.status(201).json(invoice);
}

export async function updateInvoiceController(req: Request, res: Response) {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) throw new HttpError(400, "Invalid invoice id");

  const data: UpdateInvoiceDto = req.body;
  const invoice = await updateInvoice(id, data);
  return res.json(invoice);
}

export async function deleteInvoiceController(req: Request, res: Response) {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) throw new HttpError(400, "Invalid invoice id");

  const result = await deleteInvoice(id);
  return res.json(result);
}