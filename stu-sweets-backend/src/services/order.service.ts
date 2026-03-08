import prisma from "../prisma/client.js";
import { CreateOrderDto, UpdateOrderDto, OrderItemDto } from "../types/order.js";
import { HttpError } from "../utils/httpError.js";

export async function getAllOrders() {
  return prisma.order.findMany({
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
  });
}

export async function getOrderById(id: number) {
  return prisma.order.findUnique({
    where: { id },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
  });
}

export async function createOrder(data: CreateOrderDto) {
  return prisma.$transaction(async (tx) => {
    // Получаем продукты из БД, чтобы подставить цены при необходимости
    const productIds = data.items.map((i) => i.productId);
    const products = await tx.product.findMany({
      where: { id: { in: productIds } },
    });
    const productsMap = new Map(products.map((p) => [p.id, p]));

    // Формируем items с гарантированным price
    const itemsData = data.items.map((i) => {
      const product = productsMap.get(i.productId);
      if (!product) throw new HttpError(404, `Product ${i.productId} not found`);
      return {
        productId: i.productId,
        quantity: i.quantity,
        price: i.price ?? product.price, // если price не передан, берем цену из продукта
      };
    });

    // Считаем total
    const total = itemsData.reduce((sum, i) => sum + (typeof i.price === 'number' ? i.price : i.price.toNumber()) * i.quantity, 0);

    const order = await tx.order.create({
      data: {
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        customerPhone: data.customerPhone ?? null,
        comment: data.comment ?? null,
        total,
        items: { create: itemsData },
      },
      include: { items: { include: { product: true } } },
    });

    return order;
  });
}

export async function updateOrder(id: number, data: UpdateOrderDto) {
  try {
    return await prisma.order.update({
      where: { id },
      data,
      include: { items: { include: { product: true } } },
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

/** Добавить товар в заказ */
export async function addOrderItem(orderId: number, item: OrderItemDto) {
  const product = await prisma.product.findUnique({ where: { id: item.productId } });
  if (!product) throw new HttpError(404, "Product not found");

  return prisma.$transaction(async (tx) => {
    // Проверяем, есть ли уже этот товар в заказе
    const existingItem = await tx.orderItem.findFirst({
      where: { orderId, productId: item.productId },
    });

    let resultItem;

    if (existingItem) {
      // Увеличиваем количество
      resultItem = await tx.orderItem.update({
        where: { id: existingItem.id },
        data: {
          quantity: existingItem.quantity + item.quantity,
          price: product.price, // можно оставить фиксированную цену или пересчитать
        },
        include: { product: true },
      });
    } else {
      // Создаём новый
      resultItem = await tx.orderItem.create({
        data: {
          orderId,
          productId: item.productId,
          quantity: item.quantity,
          price: product.price,
        },
        include: { product: true },
      });
    }

    await recalculateOrderTotal(tx, orderId);

    return resultItem;
  });
}

/** Обновить товар в заказе */
export async function updateOrderItem(orderId: number, itemId: number, data: Partial<OrderItemDto>) {
  const item = await prisma.orderItem.findUnique({ where: { id: itemId } });
  if (!item || item.orderId !== orderId) throw new HttpError(404, "Order item not found");

  return prisma.$transaction(async (tx) => {
    if (data.productId && data.productId !== item.productId) {
      const product = await tx.product.findUnique({ where: { id: data.productId } });
      if (!product) throw new HttpError(404, "Product not found");
      data.price = product.price.toNumber();
    }

    const updatedItem = await tx.orderItem.update({
      where: { id: itemId },
      data,
      include: { product: true },
    });

    await recalculateOrderTotal(tx, orderId);

    return updatedItem;
  });
}

/** Удалить товар из заказа */
export async function deleteOrderItem(orderId: number, itemId: number) {
  const item = await prisma.orderItem.findUnique({ where: { id: itemId } });
  if (!item || item.orderId !== orderId) throw new HttpError(404, "Order item not found");

  return prisma.$transaction(async (tx) => {
    await tx.orderItem.delete({ where: { id: itemId } });
    await recalculateOrderTotal(tx, orderId);
    return { success: true };
  });
}

/** Пересчет total заказа */
async function recalculateOrderTotal(tx: any, orderId: number) {
  const items = await tx.orderItem.findMany({ where: { orderId } });
  const total = items.reduce((sum: number, i: any) => sum + i.price * i.quantity, 0);
  await tx.order.update({ where: { id: orderId }, data: { total } });
}