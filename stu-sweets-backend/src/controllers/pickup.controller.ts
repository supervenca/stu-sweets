import type { Request, Response } from "express";
import {
    getBookedCakes, 
    getPickupCalendar, 
    getPickupCapacity, 
    getPickupSlotByDate,
    upsertPickupSlot,
    getBakerySettings,
    updateBakerySettings
} from "../services/pickup.service.js";
import { HttpError } from "../utils/httpError.js";
import { updateBakerySettingsSchema } from "../schemas/bakerySettings.schema.js";
import { upsertPickupSlotSchema } from "../schemas/pickup.schema.js";

function parseDate(dateStr: string | undefined) {
  if (!dateStr) throw new HttpError(400, "Date is required");
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) throw new HttpError(400, "Invalid date");
  return date;
}

export async function getBookedCakesController(req: Request, res: Response) {
    const date = parseDate(req.query.date as string);

    const bookedCakes = await getBookedCakes(date);
    res.json({ bookedCakes });
}

export async function getPickupCalendarController(req: Request, res: Response) {
  const calendar = await getPickupCalendar();
  res.json(calendar);
}

export async function getPickupCapacityController(req: Request, res: Response) {
    const date = parseDate(req.query.date as string);

    const pickupCapacity = await getPickupCapacity(date);
    res.json({ pickupCapacity });
}

export async function getPickupSlotByDateController(req: Request, res: Response) {
    const date = parseDate(req.params.date);

    const pickupSlot = await getPickupSlotByDate(date);
    res.json(pickupSlot);
}

export async function upsertPickupSlotController(req: Request, res: Response) {
  const date = parseDate(req.params.date);

  const parseResult = upsertPickupSlotSchema.safeParse(req.body);
  if (!parseResult.success) {
    throw new HttpError(400, "Invalid input: " + parseResult.error.message);
  }
  const data = parseResult.data;

  if (Object.keys(data).length === 0) {
    throw new HttpError(400, "Request body cannot be empty");
  }
  const slot = await upsertPickupSlot(date, data);

  res.json(slot);
}

export async function getSettingsController(req: Request, res: Response) {
  const settings = await getBakerySettings();
  res.json(settings);
}

export async function updateSettingsController(req: Request, res: Response) {

const parseResult = updateBakerySettingsSchema.safeParse(req.body);
  if (!parseResult.success) {
    throw new HttpError(400, "Invalid input: " + parseResult.error.message);
  }
  
  const updated = await updateBakerySettings(req.body);
  res.json(updated);
}