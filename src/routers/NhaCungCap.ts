import express from "express";
import { addSupplier, getSuppliers, getSupplierById } from "../controllers/NhaCungCap";

const router = express.Router();

// Route để thêm nhà cung cấp
router.post("/add", addSupplier);

// Route xem nhà cung cấp
router.get("/get", getSuppliers);

// Route xem nhà cung cấp theo id
router.get("/get/:id", getSupplierById);
export default router;
