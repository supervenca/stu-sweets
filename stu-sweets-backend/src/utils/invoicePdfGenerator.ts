import PDFDocument from "pdfkit";
import { Invoice } from "../types/invoices.js";

export function generateInvoicePdf(invoice: Invoice): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument();

    const buffers: Uint8Array[] = [];

    doc.on("data", buffers.push.bind(buffers));
    doc.on("end", () => {
      const pdfData = Buffer.concat(buffers);
      resolve(pdfData);
    });

    doc.on("error", reject);

    // ===== Content =====

    doc.fontSize(22).text("STU SWEETS", { align: "center" });
    doc.moveDown();

    doc.fontSize(16).text(`Invoice #${invoice.id}`);
    doc.text(`Order ID: ${invoice.orderId}`);
    doc.text(`Issued: ${new Date(invoice.issuedAt).toLocaleDateString()}`);
    doc.moveDown();

    doc.fontSize(14).text("Customer");
    doc.text(invoice.order?.customerName ?? "");
    doc.text(invoice.order?.customerEmail ?? "");
    doc.text(invoice.order?.customerPhone ?? "");
    doc.moveDown();

    doc.fontSize(14).text("Items:");
    doc.moveDown();

    const tableTop = doc.y;

    doc.fontSize(12);
    doc.text("Product", 50, tableTop);
    doc.text("Qty", 300, tableTop);
    doc.text("Price", 350, tableTop);
    doc.text("Total", 450, tableTop);

    doc.moveDown();
    doc.moveDown();

    invoice.order?.items?.forEach((item) => {
        const y = doc.y;

        const name = item.product?.name ?? "Product";
        const total = item.quantity * item.price;

        doc.text(name, 50, y);
        doc.text(String(item.quantity), 300, y);
        doc.text(`€${item.price}`, 350, y);
        doc.text(`€${total}`, 450, y);

        doc.moveDown();
    });

    doc.moveDown();
    doc.fontSize(16).text(`Total: €${invoice.total}`);

    doc.end();
  });
}