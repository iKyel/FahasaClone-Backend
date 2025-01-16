import express from "express";
import { addSupplier, getSuppliers } from "../controllers/NhaCungCap";

const router = express.Router();

// Route để thêm nhà cung cấp
router.post("/add", addSupplier);

// Route xem nhà cung cấp
router.get("/get", getSuppliers);

export default router;
