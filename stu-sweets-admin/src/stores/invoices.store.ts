import api from "../api/httpClient";
import toast from "react-hot-toast";

export async function fetchInvoices() {
  try {
    const res = await api.get("/internal/invoices");
    return res.data;
  } catch (err) {
    console.error(err);
    toast.error("Failed to fetch invoices");
    return [];
  }
}

export async function downloadInvoice(orderId: number) {
  try {
    const res = await api.get(`/internal/invoices/order/${orderId}`, {
      responseType: "blob",
    });

    const url = window.URL.createObjectURL(
      new Blob([res.data], { type: "application/pdf" })
    );

    const link = document.createElement("a");
    link.href = url;
    link.download = `invoice_order_${orderId}.pdf`;

    document.body.appendChild(link);
    link.click();
    link.remove();

    window.URL.revokeObjectURL(url);

    toast.success("Invoice downloaded");
  } catch (err) {
    console.error(err);
    toast.error("Failed to download invoice");
  }
}