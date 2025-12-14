import prisma from "../prisma/client.js";
import { CreateOrderDto, UpdateOrderDto } from "../types/order.js";
import { HttpError } from "../utils/httpError.js";

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
  const total = data.items.reduce(
    (sum, i) => sum + i.price * i.quantity,
    0
  );

  return prisma.$transaction(async (tx) => {
    const order = await tx.order.create({
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

    return order;
  });
}

export async function updateOrder(id: number, data: UpdateOrderDto) {
  try {
    return await prisma.order.update({
      where: { id },
      data,
    });
  } catch (e: any) {
    if (e.code === "P2025") {
      throw new HttpError(404, "Order not found");
    }
    throw e;
  }
}

export async function deleteOrder(id: number) {
  try {
    return await prisma.order.delete({ where: { id } });
  } catch (e: any) {
    if (e.code === "P2025") {
      throw new HttpError(404, "Order not found");
    }
    throw e;
  }
}
