import prisma from "../prisma/client.js";
import { CreateOrderDto, UpdateOrderDto } from "../types/order.js";

export async function getAllOrders() {
  return prisma.order.findMany({
    include: { items: true },
  });
}

export async function getOrderById(id: number) {
  return prisma.order.findUnique({
    where: { id },
    include: { items: true },
  });
}

export async function createOrder(data: CreateOrderDto) {
  const total = data.items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return prisma.order.create({
    data: {
      customerName: data.customerName,
      customerEmail: data.customerEmail,
      customerPhone: data.customerPhone ?? null,
      comment: data.comment ?? null,
      total,
      items: {
        create: data.items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
          price: i.price,
        })),
      },
    },
    include: { items: true },
  });
}

export async function updateOrder(id: number, data: UpdateOrderDto) {
  return prisma.order.update({
    where: { id },
    data,
  });
}

export async function deleteOrder(id: number) {
  return prisma.order.delete({ where: { id } });
}
