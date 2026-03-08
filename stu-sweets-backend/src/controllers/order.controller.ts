import type { Request, Response } from "express";
import {
  getAllOrders,
  getOrderById,
  createOrder,
  updateOrder,
  deleteOrder,
  addOrderItem,
  updateOrderItem,
  deleteOrderItem
} from "../services/order.service.js";
import { createOrderSchema, updateOrderSchema, addOrderItemSchema, updateOrderItemSchema } from "../schemas/order.schema.js";
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
  const parseResult = createOrderSchema.safeParse(req.body);
  if (!parseResult.success) throw new HttpError(400, "Invalid input: " + parseResult.error.message);

  const order = await createOrder(parseResult.data);
  return res.status(201).json(order);
}

export async function updateOrderController(req: Request, res: Response) {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) throw new HttpError(400, "Invalid order id");

  const parseResult = updateOrderSchema.safeParse(req.body);
  if (!parseResult.success) throw new HttpError(400, "Invalid input: " + parseResult.error.message);

  const dataToUpdate = { ...parseResult.data };
  if (dataToUpdate.total !== undefined) {
    dataToUpdate.total = Number(dataToUpdate.total);
    if (Number.isNaN(dataToUpdate.total)) throw new HttpError(400, "Total must be a number");
  }

  const updated = await updateOrder(id, dataToUpdate);
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

export async function addOrderItemController(req: Request, res: Response) {
  const orderId = Number(req.params.orderId);
  if (Number.isNaN(orderId)) throw new HttpError(400, "Invalid order id");

  const parseResult = addOrderItemSchema.safeParse(req.body);
  if (!parseResult.success) throw new HttpError(400, "Invalid input: " + parseResult.error.message);

  const item = await addOrderItem(orderId, parseResult.data);
  return res.status(201).json(item);
}

export async function updateOrderItemController(req: Request, res: Response) {
  const orderId = Number(req.params.orderId);
  const itemId = Number(req.params.itemId);
  if (Number.isNaN(orderId) || Number.isNaN(itemId)) throw new HttpError(400, "Invalid id");

  const parseResult = updateOrderItemSchema.safeParse(req.body);
  if (!parseResult.success) throw new HttpError(400, "Invalid input: " + parseResult.error.message);

  const updatedItem = await updateOrderItem(orderId, itemId, parseResult.data);
  if (!updatedItem) throw new HttpError(404, "Order or item not found");

  return res.json(updatedItem);
}

export async function deleteOrderItemController(req: Request, res: Response) {
  const orderId = Number(req.params.orderId);
  const itemId = Number(req.params.itemId);
  if (Number.isNaN(orderId) || Number.isNaN(itemId)) throw new HttpError(400, "Invalid id");

  const deleted = await deleteOrderItem(orderId, itemId);
  if (!deleted) throw new HttpError(404, "Order or item not found");

  return res.json({ success: true });
}