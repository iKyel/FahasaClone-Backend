import express from "express";
import { addSupplier } from "../controllers/NhaCungCap";

const router = express.Router();

// Route để thêm nhà cung cấp
router.post("/add", addSupplier);

export default router;
