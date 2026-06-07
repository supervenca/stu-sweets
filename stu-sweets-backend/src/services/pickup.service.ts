import prisma from "../prisma/client.js";
import { z } from "zod";
import { upsertPickupSlotSchema } from "../schemas/pickup.schema.js";

type UpsertPickupSlotData = z.infer<typeof upsertPickupSlotSchema>;

//Глобальные настройки дневного лимита заказов и минимального количества дней для подготовки
export async function getBakerySettings() {
  let settings = await prisma.bakerySettings.findUnique({
    where: { id: 1 },
  });

  if (!settings) {
    settings = await prisma.bakerySettings.create({
      data: {
        id: 1,
        defaultDailyCakeCapacity: 10,
        minPreparationDays: 2,
      },
    });
  }

  return settings;
}

//Обновление глобальных настроек
export async function updateBakerySettings(data: {
  defaultDailyCakeCapacity?: number;
  minPreparationDays?: number;
}) {
  return prisma.bakerySettings.upsert({
    where: { id: 1 },
    update: data,
    create: {
      id: 1,
      defaultDailyCakeCapacity: data.defaultDailyCakeCapacity ?? 10,
      minPreparationDays: data.minPreparationDays ?? 2,
    },
  });
}

//Получить слот по дате
export async function getPickupSlotByDate(date: Date) {
  return prisma.pickupSlot.findUnique({
    where: { date },
  });
}

//Получить capacity (максимум заказов/тортов на день)
export async function getPickupCapacity(date: Date) {
  const settings = await prisma.bakerySettings.findFirst();

  const slot = await getPickupSlotByDate(date);

  if (slot && slot.isAvailable === false) return 0;

  return slot?.maxCakeQuantity ?? settings?.defaultDailyCakeCapacity ?? 0;
}

//Сколько уже забронировано тортов на дату
export async function getBookedCakes(date: Date) {
  const orders = await prisma.order.findMany({
    where: {
      pickupSlot: {
        date,
      },
    },
    include: {
      items: {
        include: {
          product: {
            include: {
              category: true,
            },
          },
        },
      },
    },
  });

  let total = 0;

  for (const order of orders) {
    for (const item of order.items) {
      if (item.product.category?.requiresPickupSlot) {
        total += item.quantity;
      }
    }
  }

  return total;
}

//Сколько свободных мест осталось на дату
export async function getRemainingPickupCapacity(date: Date) {
  const capacity = await getPickupCapacity(date);
  const booked = await getBookedCakes(date);

  return Math.max(capacity - booked, 0);
}

//Проверка возможности выбрать дату
export async function validatePickupDate(date: Date, newCakeQuantity: number) {
  const capacity = await getPickupCapacity(date);
  const booked = await getBookedCakes(date);

  if (capacity === 0) {
    throw new Error("Pickup date is unavailable");
  }

  if (booked + newCakeQuantity > capacity) {
    throw new Error("Pickup date is fully booked");
  }
}

//обновить слот
export async function upsertPickupSlot(
  date: Date,
  data: UpsertPickupSlotData
) {
  return prisma.pickupSlot.upsert({
    where: { date },
    update: data,
    create: {
      date,
      ...data,
    },
  });
}

//Диапазон доступных дат для отображения в календаре (по умолчанию 90 дней вперед)
function getDateRange(daysAhead = 90) {
  const result: Date[] = [];

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < daysAhead; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    result.push(d);
  }

  return result;
}

//календарь для админки
export const getPickupCalendar = async () => {
  const settings = await prisma.bakerySettings.findFirst();

  const slots = await prisma.pickupSlot.findMany();

  const orders = await prisma.order.findMany({
    include: {
      pickupSlot: true,
      items: {
        include: {
          product: {
            include: { category: true },
          },
        },
      },
    },
  });

  const slotMap = new Map(
    slots.map((s) => [s.date.toISOString().split("T")[0], s])
  );

  const bookedMap = new Map<string, number>();

  for (const order of orders) {
    if (!order.pickupSlot) continue;

    const key = order.pickupSlot.date
      .toISOString()
      .split("T")[0];

    for (const item of order.items) {
      if (item.product.category?.requiresPickupSlot) {
        bookedMap.set(
          key,
          (bookedMap.get(key) || 0) + item.quantity
        );
      }
    }
  }

  const dates = getDateRange(120);

  const result = dates.map((date) => {
    const key = date.toISOString().split("T")[0];

    const slot = slotMap.get(key);
    const booked = bookedMap.get(key) || 0;

    const capacity =
      slot?.isAvailable === false
        ? 0
        : slot?.maxCakeQuantity ??
          settings?.defaultDailyCakeCapacity ??
          0;

    const minPrepDays =
      settings?.minPreparationDays ?? 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const diffDays =
      (date.getTime() - today.getTime()) /
      (1000 * 60 * 60 * 24);

    const availableByPrep = diffDays >= minPrepDays;

    return {
      date: key,
      capacity,
      booked,
      available: availableByPrep && capacity > booked,
      isSlotOverridden: !!slot,
      slotCapacity: slot?.maxCakeQuantity ?? null,
      globalCapacity: settings?.defaultDailyCakeCapacity ?? 0,
    };
  });

  return result;
};