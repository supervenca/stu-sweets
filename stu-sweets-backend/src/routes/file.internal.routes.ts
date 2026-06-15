import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { uploadFile } from "../services/file.service.js";
import { FileType } from "../types/file.types.js";
import { upload } from "../middlewares/file.middleware.js";

const router = Router();
router.use(authMiddleware);

router.post(
  "/internal/files/upload",
  upload.single("file"),
  async (req, res) => {
    const type = req.body.type as FileType;

    const result = await uploadFile(req.file!, type);

    res.json(result);
  }
);

export default router;