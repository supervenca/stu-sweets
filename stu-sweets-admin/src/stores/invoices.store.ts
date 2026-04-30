// NOT IN USE FOR NOW (COULD BE ADDED BACK LATER)

import api from "../api/httpClient";
import toast from "react-hot-toast";
import { useOrdersStore } from "./orders.store";

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

export async function generateInvoice(orderId: number) {
  try {
    await toast.promise(
      api.post("/internal/invoices", { orderId }),
      {
        loading: "Generating invoice...",
        success: "Invoice ready!",
        error: "Failed to generate invoice",
      });

      useOrdersStore.setState((state) => ({
      orders: state.orders.map((o) =>
        o.id === orderId ? { ...o, invoiceExists: true } : o
      ),
    }));

  } catch (err) {
    console.error(err);
    toast.error("Error generating invoice");
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