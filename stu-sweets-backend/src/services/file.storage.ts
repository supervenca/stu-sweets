import fs from "fs";
import path from "path";
import { FileType } from "../types/file.types.js";

const folders = {
  product: "uploads/product",
  category: "uploads/category",
  carousel: "uploads/carousel",
};

export const diskStorage: FileStorage = {
  async save(file, type) {
    const folder = folders[type];

    const filename = `${Date.now()}-${file.originalname}`;
    const fullPath = path.join(folder, filename);

    fs.mkdirSync(folder, { recursive: true });
    fs.writeFileSync(fullPath, file.buffer);

    return `uploads/${type}/${filename}`;
  },

  async delete(filePath: string) {
    const normalizedPath = filePath.startsWith("/")
      ? filePath.slice(1)
      : filePath;

    const full = path.join(process.cwd(), normalizedPath);

    if (fs.existsSync(full)) {
      fs.unlinkSync(full);
    }
}

};

export interface FileStorage {
  save(file: Express.Multer.File, type: FileType): Promise<string>;
  delete(filePath: string): Promise<void>;
}