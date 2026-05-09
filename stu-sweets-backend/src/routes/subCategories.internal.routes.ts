import { Router } from "express";
import { createSubCategory, updateSubCategory, deleteSubCategory } from "../controllers/subCategories.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(authMiddleware);

router.post("/", createSubCategory);
router.patch("/:id", updateSubCategory);
router.delete("/:id", deleteSubCategory);

export default router;