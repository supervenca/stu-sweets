import prisma from "../prisma/client.js";
import { Product, CakeConfig } from "@prisma/client";
import { CreateOrderDto, UpdateOrderDto, OrderItemDto } from "../types/order.types.js";
import { HttpError } from "../utils/httpError.js";
import { validatePickupDate } from "./pickup.service.js";

export async function getAllOrders() {
  const orders = await prisma.order.findMany({
    include: {
      pickupSlot: true,
      items: {
        include: {
          product: true,
        },
      },
      invoices: true
    },
  });

  return orders.map((order) => ({
    ...order,
    invoiceExists: !!order.invoices,
  }));
}

export async function getOrderById(id: number) {
  return prisma.order.findUnique({
    where: { id },
    include: {
      pickupSlot: true,
      items: {
        include: {
          product: true,
        },
      },
    },
  });
}

function calculateOrderItemPrice(
  product: Product & {
    category: { requiresCakeOptions: boolean } | null;
    cakeConfig: CakeConfig | null;
  },
  item: OrderItemDto
) {
  let price = Number(product.price);

  // cake multiplier
  if (product.category?.requiresCakeOptions && item.cakeConfig?.size) {
    const config = product.cakeConfig;

    let multiplier = 1;

    switch (item.cakeConfig.size) {
      case "MEDIUM":
        multiplier = config?.mediumMultiplier ?? 1;
        break;
      case "LARGE":
        multiplier = config?.largeMultiplier ?? 1;
        break;
    }

    price *= multiplier;
  }

  return price;
}

export async function createOrder(data: CreateOrderDto) {
  return prisma.$transaction(async (tx) => {
    // Получаем продукты из БД
    const productIds = data.items.map((i) => i.productId);

    const products = await tx.product.findMany({
      where: {
        id: {
          in: productIds,
        },
      },
      include: {
        category: true,
        cakeConfig: true,
      },
    });

    const productsMap = new Map(products.map((p) => [p.id, p]));

    // Проверяем items и формируем данные для заказа
    const itemsData = data.items.map((item) => {
      const product = productsMap.get(item.productId);

      if (!product) {
        throw new HttpError(404, `Product ${item.productId} not found`);
      }
      const finalPrice = calculateOrderItemPrice(product, item);

      return {
        productId: item.productId,
        quantity: item.quantity,

        price: finalPrice,

        message: item.message ?? null,
        certificate: item.certificate ?? false,

        cakeConfig: item.cakeConfig
          ? {
              create: {
                size: item.cakeConfig.size ?? null,
                flavor: item.cakeConfig.flavor ?? null,
                color: item.cakeConfig.color ?? null,
                messageColor: item.cakeConfig.messageColor ?? null,
              },
            }
          : undefined,
      };
    });

    // Проверяем, есть ли товары requiring pickup
    const pickupItems = data.items.filter((item) => {
      const product = productsMap.get(item.productId);

      return product?.category?.requiresPickupSlot;
    });

    const totalPickupQuantity = pickupItems.reduce(
      (sum, item) => sum + item.quantity,
      0
    );

    const requiresPickup = totalPickupQuantity > 0;

    // Pickup slot logic
    let pickupSlotId: number | null = null;

    if (requiresPickup) {
      if (!data.pickupDate) {
        throw new HttpError(400, "Pickup date is required");
      }

      const date = new Date(data.pickupDate);

      if (isNaN(date.getTime())) {
        throw new HttpError(400, "Invalid pickup date");
      }

      await validatePickupDate(date, totalPickupQuantity);

      const slot = await tx.pickupSlot.upsert({
        where: {
          date,
        },
        update: {},
        create: {
          date,
        },
      });

      pickupSlotId = slot.id;
    }

    // Считаем total
    const total = itemsData.reduce((sum, item) => {
      return sum + item.price * item.quantity;
    }, 0);

    // Ищем клиента
    let client = await tx.client.findFirst({
      where: {
        customerEmail: data.customerEmail,
      },
    });

    // Проверка blacklist
    if (client?.blacklist) {
      throw new HttpError(403, "Client is blacklisted");
    }

    // Если клиента нет — создаем
    if (!client) {
      client = await tx.client.create({
        data: {
          customerName: data.customerName,
          customerEmail: data.customerEmail,
          customerPhone: data.customerPhone,
        },
      });
    } else {
      // Обновляем данные клиента
      client = await tx.client.update({
        where: {
          id: client.id,
        },
        data: {
          customerName: data.customerName,
          customerPhone: data.customerPhone,
        },
      });
    }

    // Создание заказа
    const order = await tx.order.create({
      data: {
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        customerPhone: data.customerPhone ?? null,
        comment: data.comment ?? null,
        total,
        pickupSlotId,
        clientId: client.id,
        items: {
          create: itemsData,
        },
      },
      include: {
        pickupSlot: true,
        items: {
          include: {
            product: true,
            cakeConfig: true,
          },
        },
      },
    });

    return order;
  });
}

export async function updateOrder(id: number, data: UpdateOrderDto) {
  try {
    return await prisma.order.update({
      where: { id },
      data: {
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        customerPhone: data.customerPhone,
        comment: data.comment,
        status: data.status,
      },
      include: {
        items: {
          include: { product: true, cakeConfig: true },
        },
      },
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

//Добавить товар в заказ
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

//Обновить товар в заказе
export async function updateOrderItem(
  orderId: number,
  itemId: number,
  data: Partial<OrderItemDto>
) {
  return prisma.$transaction(async (tx) => {
    const item = await tx.orderItem.findUnique({
      where: { id: itemId },
    });

    if (!item || item.orderId !== orderId) {
      throw new HttpError(404, "Order item not found");
    }

    const product = await tx.product.findUnique({
      where: { id: data.productId ?? item.productId },
      include: { category: true, cakeConfig: true },
    });

    if (!product) throw new HttpError(404, "Product not found");

    const merged: OrderItemDto = {
      productId: product.id,
      quantity: data.quantity ?? item.quantity,
      message: data.message ?? item.message ?? undefined,
      cakeConfig: data.cakeConfig ?? undefined,
    };

    const price = calculateOrderItemPrice(product, merged);

    const updated = await tx.orderItem.update({
      where: { id: itemId },
      data: {
        productId: product.id,
        quantity: merged.quantity,
        price,
        message: merged.message,
        cakeConfig: data.cakeConfig
          ? {
              upsert: {
                create: {
                  size: data.cakeConfig.size ?? null,
                  flavor: data.cakeConfig.flavor ?? null,
                  color: data.cakeConfig.color ?? null,
                  messageColor: data.cakeConfig.messageColor ?? null,
                },
                update: {
                  size: data.cakeConfig.size ?? null,
                  flavor: data.cakeConfig.flavor ?? null,
                  color: data.cakeConfig.color ?? null,
                  messageColor: data.cakeConfig.messageColor ?? null,
                },
              },
            }
          : undefined,
      },
      include: { product: true, cakeConfig: true },
    });

    await recalculateOrderTotal(tx, orderId);

    return updated;
  });
}

//Удалить товар из заказа
export async function deleteOrderItem(orderId: number, itemId: number) {
  const item = await prisma.orderItem.findUnique({ where: { id: itemId } });
  if (!item || item.orderId !== orderId) throw new HttpError(404, "Order item not found");

  return prisma.$transaction(async (tx) => {
    await tx.orderItem.delete({ where: { id: itemId } });
    await recalculateOrderTotal(tx, orderId);
    return { success: true };
  });
}

//Пересчет total заказа
async function recalculateOrderTotal(tx: any, orderId: number) {
  const items = await tx.orderItem.findMany({ where: { orderId } });
  const total = items.reduce((sum: number, i: any) => sum + i.price * i.quantity, 0);
  await tx.order.update({ where: { id: orderId }, data: { total } });
}