import type { Request, Response } from "express";
import {
  getAllOrders,
  getOrderById,
  createOrder,
  updateOrder,
  deleteOrder,
} from "../services/order.service.js";

// Получить все заказы
export async function getAllOrdersController(req: Request, res: Response) {
  const orders = await getAllOrders();
  res.json(orders);
}

// Получить заказ по id
export async function getOrderByIdController(req: Request, res: Response) {
  const id = Number(req.params.id);
  const order = await getOrderById(id);

  if (!order) return res.status(404).json({ error: "Order not found" });

  res.json(order);
}

// Создать заказ
export async function createOrderController(req: Request, res: Response) {
  const { customerName, customerEmail, customerPhone, comment, items } = req.body;

  if (!customerName || !customerEmail || !Array.isArray(items)) {
    return res.status(400).json({ error: "customerName, customerEmail and items[] are required" });
  }

  try {
    const order = await createOrder({ customerName, customerEmail, customerPhone, comment, items });
    res.status(201).json(order);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
}

// Обновить заказ
export async function updateOrderController(req: Request, res: Response) {
  const id = Number(req.params.id);
  const data = req.body;

  try {
    const updated = await updateOrder(id, data);
    res.json(updated);
  } catch (e: any) {
    res.status(404).json({ error: "Error" });
  }
}

// Удалить заказ
export async function deleteOrderController(req: Request, res: Response) {
  const id = Number(req.params.id);

  try {
    await deleteOrder(id);
    res.json({ success: true });
  } catch (e: any) {
    res.status(404).json({ error: "Order not found" });
  }
}