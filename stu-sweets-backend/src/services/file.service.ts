import { diskStorage } from "./file.storage.js";
import { FileType } from "../types/file.types.js";

export async function uploadFile(
  file: Express.Multer.File,
  type: FileType
) {
  if (!file) throw new Error("File is required");

  // validation
  if (!file.mimetype.startsWith("image/")) {
    throw new Error("Only images allowed");
  }

  if (file.size > 5 * 1024 * 1024) {
    throw new Error("Max size is 5MB");
  }

  const url = await diskStorage.save(file, type);

  return {
    url,
  };
}