import type { Request, Response } from "express";
import {
  getAllOrders,
  getOrderById,
  createOrder,
  updateOrder,
  deleteOrder,
} from "../services/order.service.js";
import { HttpError } from "../utils/httpError.js";

// GET ALL
export async function getAllOrdersController(req: Request, res: Response) {
  const orders = await getAllOrders();
  return res.json(orders);
}

// GET BY ID
export async function getOrderByIdController(req: Request, res: Response) {
  const id = Number(req.params.id);

  if (Number.isNaN(id)) {
    throw new HttpError(400, "Invalid order id");
  }

  const order = await getOrderById(id);

  if (!order) {
    throw new HttpError(404, "Order not found");
  }

  return res.json(order);
}

// CREATE
export async function createOrderController(req: Request, res: Response) {
  const { customerName, customerEmail, customerPhone, comment, items } = req.body;

  if (!customerName || !customerEmail) {
    throw new HttpError(400, "customerName and customerEmail are required");
  }

  if (!Array.isArray(items) || items.length === 0) {
    throw new HttpError(400, "items must be a non-empty array");
  }

  for (const item of items) {
    if (
      typeof item.productId !== "number" ||
      typeof item.quantity !== "number" ||
      typeof item.price !== "number"
    ) {
      throw new HttpError(400, "Invalid order item structure");
    }
  }

  const order = await createOrder({
    customerName,
    customerEmail,
    customerPhone,
    comment,
    items,
  });

  return res.status(201).json(order);
}

// UPDATE
export async function updateOrderController(req: Request, res: Response) {
  const id = Number(req.params.id);
  const data = req.body;

  if (Number.isNaN(id)) {
    throw new HttpError(400, "Invalid order id");
  }

  const updated = await updateOrder(id, data);

  if (!updated) {
    throw new HttpError(404, "Order not found");
  }

  return res.json(updated);
}

// DELETE
export async function deleteOrderController(req: Request, res: Response) {
  const id = Number(req.params.id);

  if (Number.isNaN(id)) {
    throw new HttpError(400, "Invalid order id");
  }

  await deleteOrder(id);

  return res.json({ success: true });
}
