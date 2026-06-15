import { Router } from "express";
import {
  getAllProductsPublicController,
  getProductByIdPublicController,
  createProductController,
  updateProductController,
  deleteProductController,
    setProductImageController,
    deleteProductImageController
} from "../controllers/product.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/file.middleware.js";

const router = Router();
router.use(authMiddleware);

router.get("/", getAllProductsPublicController);
router.get("/:id", getProductByIdPublicController);
router.post("/", createProductController);
router.patch("/:id", updateProductController);
router.delete("/:id", deleteProductController);

router.post(
  "/:id/image",
  upload.single("file"),
  setProductImageController
);

router.delete(
  "/:id/image",
  deleteProductImageController
);

export default router;
