import { Router } from "express";
import {
  createUserController,
  getAllUsersController,
  getUserByIdController,
  updateUserController,
  deleteUserController,
} from "../controllers/user.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

// защищено JWT
router.use(authMiddleware);

router.post("/", createUserController);
router.get("/", getAllUsersController);
router.get("/:id", getUserByIdController);
router.put("/:id", updateUserController);
router.delete("/:id", deleteUserController);

export default router;

// createUser - internal-only, admin-only (в будущем, если понадобятся юзеры-клиенты, подключим user.routes.ts в server.ts)