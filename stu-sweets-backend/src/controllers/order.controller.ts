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
  const parseResult = createOrderSchema.safeParse(req.body);
  if (!parseResult.success) {
    throw new HttpError(400, "Invalid input: " + parseResult.error.message);
  }

  const order = await createOrder(parseResult.data);
  return res.status(201).json(order);
}

// UPDATE
export async function updateOrderController(req: Request, res: Response) {
  const id = Number(req.params.id);

  // Проверяем корректность ID
  if (Number.isNaN(id)) {
    throw new HttpError(400, "Invalid order id");
  }

  // Валидация входящих данных через Zod
  const parseResult = updateOrderSchema.safeParse(req.body);
  if (!parseResult.success) {
    throw new HttpError(400, "Invalid input: " + parseResult.error.message);
  }

  // Преобразуем строковые числовые поля к числу, если нужно
  const dataToUpdate = { ...parseResult.data };
  if (dataToUpdate.total !== undefined) {
    dataToUpdate.total = Number(dataToUpdate.total);
    if (Number.isNaN(dataToUpdate.total)) {
      throw new HttpError(400, "Total must be a number");
    }
  }

  // Обновляем заказ
  const updated = await updateOrder(id, dataToUpdate);

  if (!updated) {
    throw new HttpError(404, "Order not found");
  }

  return res.json(updated);
}

// DELETE
export async function deleteOrderController(req: Request, res: Response) {
  const id = Number(req.params.id);
  const deleted = await deleteOrder(id);
  if (!deleted) throw new HttpError(404, "Order not found");
  return res.json({ success: true });
}
