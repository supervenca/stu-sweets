import { Router } from "express";
import { getAllSlidesController } from "../controllers/carousel.controller.js";

const router = Router();


router.get("/", getAllSlidesController);

export default router;