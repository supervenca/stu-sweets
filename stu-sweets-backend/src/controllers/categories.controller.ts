import { Request, Response } from "express";
import prisma from "../prisma/client.js";
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

  const parseResult = createCategorySchema.safeParse(req.body);

  if (!parseResult.success) {
    return res.status(400).json({
      message: parseResult.error.message,
    });
  }

  const { name, requiresPickupSlot = false, requiresCakeOptions = false } = parseResult.data;

  try {
    const category = await prisma.category.create({
      data: { name, requiresPickupSlot, requiresCakeOptions },
    });

    res.status(201).json(category);
  } catch (err: any) {
    if (err.code === "P2002") {
      return res.status(409).json({ message: "Category already exists" });
    }

    res.status(500).json({ message: "Failed to create category" });
  }
};

export const updateCategory = async (req: Request, res: Response) => {
  const id = Number(req.params.id);

  const parseResult = updateCategorySchema.safeParse(
    req.body
  );

  if (!parseResult.success) {
    return res.status(400).json({
      message: parseResult.error.message,
    });
  }

  const data = parseResult.data;

  // защита от пустого PATCH
  if (Object.keys(data).length === 0) {
    return res.status(400).json({
      message: "Request body cannot be empty",
    });
  }


  try {
    const category = await prisma.category.update({
      where: { id },
      data,
    });

    res.json(category);
  } catch {
    res.status(404).json({ message: "Category not found" });
  }
};

export const deleteCategory = async (req: Request, res: Response) => {
  const id = Number(req.params.id);

  try {
    await prisma.category.delete({
      where: { id },
    });

    res.status(204).send();
  } catch {
    res.status(404).json({ message: "Category not found" });
  }
};
