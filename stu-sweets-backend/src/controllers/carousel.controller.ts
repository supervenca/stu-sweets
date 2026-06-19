import { Request, Response } from "express";
import { uploadFile } from "../services/file.service.js";
import { getAllSlides, createSlide, updateSlide, deleteSlide, moveSlideUp, moveSlideDown } from "../services/carousel.service.js";
import { HttpError } from "../utils/httpError.js";
import { parseId } from "../utils/parseId.js";

export async function getAllSlidesController(req: Request, res: Response) {
  const slides = await getAllSlides();
  return res.json(slides);
}

export async function createSlideController(req: Request, res: Response) {
  if (!req.file) {
    throw new HttpError(400, "Image file is required");
  }

  const uploaded = await uploadFile(req.file, "carousel");

  const slide = await createSlide({
    imageUrl: uploaded.url,
  });

  return res.json(slide);
}

export async function updateSlideController(req: Request, res: Response) {
  const id = parseId(req.params.id, "slide id");
  const { sortOrder, isActive } = req.body;

  const slide = await updateSlide(id, {
    isActive: isActive === true || isActive === "true"
  });

  return res.json(slide);
}

export async function deleteSlideController(req: Request, res: Response) {
  const id = parseId(req.params.id, "slide id");

  await deleteSlide(id);
  const slides = await getAllSlides();
  return res.json(slides);
}

export async function moveSlideUpController(req: Request, res: Response) {
  const id = parseId(req.params.id, "slide id");

  await moveSlideUp(id);
    const slides = await getAllSlides();
    return res.json(slides);
}

export async function moveSlideDownController(req: Request, res: Response) {
  const id = parseId(req.params.id, "slide id");

  await moveSlideDown(id);
    const slides = await getAllSlides();
    return res.json(slides);
}