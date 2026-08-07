import prisma from "../prisma/client.js";
import { Product, CakeConfig } from "@prisma/client";
import { broadcastNewOrder } from "../ws/wsBroadcast.js";
import { CreateOrderDto, UpdateOrderDto, OrderItemDto } from "../types/order.types.js";
import { HttpError } from "../utils/httpError.js";
import { validatePickupDate } from "./pickup.service.js";

export async function getAllOrders() {
  const orders = await prisma.order.findMany({
    include: {
      pickupSlot: true,
      items: {
  include: {
    product: {
      include: {
        category: true
      }
    },
    cakeConfig: true
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
          product: {
            include: {
              category: true
            }
          },
          cakeConfig: true
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

function validateOrderItemCakeConfig(product: Product & {
    category: { requiresCakeOptions: boolean } | null;
    cakeConfig: CakeConfig | null;
  },item: OrderItemDto) {
  if (product.category?.requiresCakeOptions) {
  if (!item.cakeConfig) {
    throw new HttpError(
      400,
      `Cake configuration is required for product ${product.name}`
    );
  }

  const { size, flavor, color } = item.cakeConfig;

  if (!size) {
    throw new HttpError(400, "Cake size is required");
  }

  if (!flavor) {
    throw new HttpError(400, "Cake flavor is required");
  }

  if (item.cakeConfig.flavor) {

  const allowed = product.cakeConfig?.flavor ?? [];

  if (!allowed.includes(item.cakeConfig.flavor)) {
    throw new HttpError(
      400,
      `Invalid flavor: ${item.cakeConfig.flavor}`
    );
  }
}

  if (!color) {
    throw new HttpError(400, "Cake color is required");
  }

  if (item.cakeConfig.color) {
  const allowed = product.cakeConfig?.color ?? [];

  if (!allowed.includes(item.cakeConfig.color)) {
    throw new HttpError(
      400,
      `Invalid color: ${item.cakeConfig.color}`
    );
  }
}

  // если нет текста, то цвет текста не нужен
  if (!item.cakeConfig.message || !item.cakeConfig.message.trim()) {
    item.cakeConfig.messageColor = undefined;
  } else {
    // если есть текст, то цвет текста обязателен и должен быть из списка разрешённых
    if (!item.cakeConfig.messageColor) {
      throw new HttpError(
        400,
        "Message color is required when message is provided"
      );
    }

    const allowedMessageColors = product.cakeConfig?.messageColor ?? [];
    if (!allowedMessageColors.includes(item.cakeConfig.messageColor)) {
      throw new HttpError(
        400,
        `Invalid message color: ${item.cakeConfig.messageColor}`
      );
    }
  }
}
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
      validateOrderItemCakeConfig(product, item);
      const finalPrice = calculateOrderItemPrice(product, item);

      return {
        productId: item.productId,
        quantity: item.quantity,
        price: finalPrice,
        certificate: item.certificate ?? false,

        cakeConfig: item.cakeConfig
          ? {
              create: {
                size: item.cakeConfig.size ?? null,
                flavor: item.cakeConfig.flavor ?? null,
                color: item.cakeConfig.color ?? null,
                message: item.cakeConfig.message ?? null,
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

    //console.log("order created, sending WS event", order.id);
    broadcastNewOrder(order.id, order.createdAt);

    return order;
  });
}

export async function updateOrder(id: number, data: UpdateOrderDto) {
  try {
    return await prisma.$transaction(async (tx) => {
      const existing = await tx.order.findUnique({
        where: { id },
        select: { clientId: true },
      });

      if (!existing) {
        throw new HttpError(404, "Order not found");
      }

      if (existing.clientId != null) {
        const clientUpdateData: any = {};

        if (data.customerName !== undefined) {
          clientUpdateData.customerName = data.customerName;
        }
        if (data.customerEmail !== undefined) {
          clientUpdateData.customerEmail = data.customerEmail;
        }
        if (data.customerPhone !== undefined) {
          clientUpdateData.customerPhone = data.customerPhone;
        }

        if (Object.keys(clientUpdateData).length > 0) {
          await tx.client.update({
            where: { id: existing.clientId },
            data: clientUpdateData,
          });
        }
      }

      const updated = await tx.order.update({
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

      return updated;
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

//Пересчет total заказа
// async function recalculateOrderTotal(tx: any, orderId: number) {
//   const items = await tx.orderItem.findMany({ where: { orderId } });
//   const total = items.reduce((sum: number, i: any) => sum + i.price * i.quantity, 0);
//   await tx.order.update({ where: { id: orderId }, data: { total } });
// }