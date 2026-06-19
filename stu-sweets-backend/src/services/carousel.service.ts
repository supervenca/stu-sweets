import prisma from "../prisma/client.js";
import { CreateCarouselSlideDto, UpdateCarouselSlideDto } from "../types/carousel.types.js";
import { HttpError } from "../utils/httpError.js";
import { diskStorage } from "./file.storage.js";

export async function getAllSlides() {
  return prisma.carouselSlide.findMany({
    orderBy: {
      sortOrder: "asc",
    },
  });
}

export async function createSlide(data: CreateCarouselSlideDto) {
    if (!data.imageUrl) {
        throw new HttpError(400, "Image URL is required");
    }
    const lastSlide =
    await prisma.carouselSlide.findFirst({
      orderBy: {
        sortOrder: "desc",
      },
    });
  return prisma.carouselSlide.create({
    data: {
      imageUrl: data.imageUrl,
      sortOrder: (lastSlide?.sortOrder ?? 0) + 1, //new slide goes to the end of the carousel
      isActive: true
    }
  });
}

export async function updateSlide(id: number, data: UpdateCarouselSlideDto) {
  return prisma.carouselSlide.update({
    where: { id },
    data: {
    ...(data.isActive !== undefined && {
        isActive: data.isActive,
    }),
    }
  });
}

export async function deleteSlide(id: number) {
  const slide = await prisma.carouselSlide.findUnique({ where: { id } });

  if (!slide) {
    throw new HttpError(404, "Slide not found");
  }

  await diskStorage.delete(slide.imageUrl);

  await prisma.carouselSlide.delete({ where: { id } });

  // 🔥 пересобираем порядок
  const slides = await prisma.carouselSlide.findMany({
    orderBy: { sortOrder: "asc" },
  });

  await Promise.all(
    slides.map((s, index) =>
      prisma.carouselSlide.update({
        where: { id: s.id },
        data: { sortOrder: index + 1 },
      })
    )
  );

  return { success: true };
}

export async function moveSlideUp(id: number) {
  const slide = await prisma.carouselSlide.findUnique({ where: { id } });
  if (!slide) throw new HttpError(404, "Slide not found");

  const prev = await prisma.carouselSlide.findFirst({
    where: { sortOrder: { lt: slide.sortOrder } },
    orderBy: { sortOrder: "desc" },
  });

  if (!prev) return;

  await prisma.$transaction([
    prisma.carouselSlide.update({
      where: { id: slide.id },
      data: { sortOrder: prev.sortOrder },
    }),
    prisma.carouselSlide.update({
      where: { id: prev.id },
      data: { sortOrder: slide.sortOrder },
    }),
  ]);
}

export async function moveSlideDown(id: number) {
  const slide = await prisma.carouselSlide.findUnique({ where: { id } });
  if (!slide) throw new HttpError(404, "Slide not found");

  const next = await prisma.carouselSlide.findFirst({
    where: { sortOrder: { gt: slide.sortOrder } },
    orderBy: { sortOrder: "asc" },
  });

  if (!next) return;

  await prisma.$transaction([
    prisma.carouselSlide.update({
      where: { id: slide.id },
      data: { sortOrder: next.sortOrder },
    }),
    prisma.carouselSlide.update({
      where: { id: next.id },
      data: { sortOrder: slide.sortOrder },
    }),
  ]);
}