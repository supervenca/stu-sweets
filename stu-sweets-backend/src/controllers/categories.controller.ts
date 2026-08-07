import { Request, Response } from "express";
import prisma from "../prisma/client.js";
import { HttpError } from "../utils/httpError.js";
import {
  createCategorySchema,
  updateCategorySchema,
} from "../schemas/category.schema.js";

export const getCategories = async (_req: Request, res: Response) => {
  const categories = await prisma.category.findMany({
    orderBy: { id: "asc" },
  });

  res.json(categories);
};

export const createCategory = async (req: Request, res: Response) => {

  const { name, requiresPickupSlot = false, requiresCakeOptions = false } =
    createCategorySchema.parse(req.body);

  try {
    const category = await prisma.category.create({
      data: { name, requiresPickupSlot, requiresCakeOptions },
    });

    res.status(201).json(category);
  } catch (err: any) {
    if (err.code === "P2002") {
      throw new HttpError(409, "Category already exists");
    }

    throw err;
  }
};

export const updateCategory = async (req: Request, res: Response) => {
  const id = Number(req.params.id);

  const data = updateCategorySchema.parse(req.body);

  // защита от пустого PATCH
  if (Object.keys(data).length === 0) {
    throw new HttpError(400, "Request body cannot be empty");
  }

  try {
    const category = await prisma.category.update({
      where: { id },
      data,
    });

    res.json(category);
  } catch (err: any) {
    if (err.code === "P2025") {
      throw new HttpError(404, "Category not found");
    }

    throw err;
  }
};

export const deleteCategory = async (req: Request, res: Response) => {
  const id = Number(req.params.id);

  try {
    await prisma.category.delete({
      where: { id },
    });

    res.status(204).send();
  } catch (err: any) {
    if (err.code === "P2025") {
      throw new HttpError(404, "Category not found");
    }

    throw err;
  }
};
