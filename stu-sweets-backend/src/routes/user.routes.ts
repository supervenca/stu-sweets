import { Router } from "express";
import {
  getAllUsersController,
  getUserByIdController,
  createUserController,
  updateUserController,
  deleteUserController,
} from "../controllers/user.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(authMiddleware); // 👈 защита всех роутов ниже

router.get("/", getAllUsersController);
router.get("/:id", getUserByIdController);
router.post("/", createUserController);
router.put("/:id", updateUserController);
router.delete("/:id", deleteUserController);

export default router;