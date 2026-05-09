import { Request, Response } from "express";
import prisma from "../prisma/client.js";

// GET ALL
export const getSubCategories = async (req: Request, res: Response) => {
  try {
    const subCategories = await prisma.subCategory.findMany({
      orderBy: { id: "asc" },
      include: { category: true },
    });

    res.json(subCategories);
  } catch {
    res.status(500).json({ message: "Failed to fetch sub-categories" });
  }
};

// CREATE
export const createSubCategory = async (req: Request, res: Response) => {
  const { name, categoryId } = req.body;

  if (!name || categoryId === undefined) {
    return res.status(400).json({ message: "Name and categoryId are required" });
  }

  try {
    const subCategory = await prisma.subCategory.create({
      data: {
        name,
        categoryId: Number(categoryId),
      },
      include: { category: true },
    });

    res.status(201).json(subCategory);
  } catch (err: any) {
    if (err.code === "P2002") {
      return res.status(409).json({ message: "Sub-category already exists" });
    }

    res.status(500).json({ message: "Failed to create sub-category" });
  }
};

// UPDATE (PATCH)
export const updateSubCategory = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const { name, categoryId } = req.body;

  try {
    const data: any = {};

    if (name !== undefined) data.name = name;
    if (categoryId !== undefined) data.categoryId = Number(categoryId);

    const subCategory = await prisma.subCategory.update({
      where: { id },
      data,
      include: { category: true },
    });

    res.json(subCategory);
  } catch {
    res.status(404).json({ message: "Sub-category not found" });
  }
};

// DELETE
export const deleteSubCategory = async (req: Request, res: Response) => {
  const id = Number(req.params.id);

  try {
    await prisma.subCategory.delete({ where: { id } });
    res.status(204).send();
  } catch {
    res.status(404).json({ message: "Sub-category not found" });
  }
};