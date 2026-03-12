import { Router } from "express";
import { 
    getAllInvoicesController,
    getInvoiceByIdController,
    createInvoiceController,
    updateInvoiceController,
    deleteInvoiceController,
    getInvoiceByOrderController
 } from "../controllers/invoice.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();
router.use(authMiddleware);

router.get("/", getAllInvoicesController);
router.get("/order/:orderId", getInvoiceByOrderController);
router.get("/:id", getInvoiceByIdController);
router.post("/", createInvoiceController);
router.put("/:id", updateInvoiceController);
router.delete("/:id", deleteInvoiceController);

export default router;