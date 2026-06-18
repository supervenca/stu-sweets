import { Router } from "express";
import { createSlideController, deleteSlideController, moveSlideDownController, moveSlideUpController, updateSlideController } from "../controllers/carousel.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/file.middleware.js";

const router = Router();

router.use(authMiddleware);

router.post(
  "/",
  upload.single("file"),
  createSlideController
);
router.patch("/:id", updateSlideController);
router.delete("/:id", deleteSlideController);
router.post("/:id/move-up", moveSlideUpController);
router.post("/:id/move-down", moveSlideDownController);

export default router;