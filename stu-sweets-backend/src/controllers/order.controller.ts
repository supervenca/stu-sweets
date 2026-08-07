import type { Request, Response } from "express";
import {
  getAllOrders,
  getOrderById,
  createOrder,
  updateOrder,
  deleteOrder,
} from "../services/order.service.js";
import { createOrderSchema, updateOrderSchema } from "../schemas/order.schema.js";
import { HttpError } from "../utils/httpError.js";

export async function getAllOrdersPublicController(req: Request, res: Response) {
  const orders = await getAllOrders();
  return res.json(orders);
}

export async function getOrderByIdPublicController(req: Request, res: Response) {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) throw new HttpError(400, "Invalid order id");

  const order = await getOrderById(id);
  if (!order) throw new HttpError(404, "Order not found");

  return res.json(order);
}

export async function createOrderController(req: Request, res: Response) {
  const data = createOrderSchema.parse(req.body);

  const order = await createOrder(data);
  return res.status(201).json(order);
}

export async function updateOrderController(req: Request, res: Response) {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) throw new HttpError(400, "Invalid order id");

  const data = updateOrderSchema.parse(req.body);

  const updated = await updateOrder(id, data);
  if (!updated) throw new HttpError(404, "Order not found");

  return res.json(updated);
}

export async function deleteOrderController(req: Request, res: Response) {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) throw new HttpError(400, "Invalid order id");

  const deleted = await deleteOrder(id);
  if (!deleted) throw new HttpError(404, "Order not found");

  return res.json({ success: true });
}