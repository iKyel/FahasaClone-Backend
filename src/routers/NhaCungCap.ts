import express from "express";
import {
    addSupplier,
    updateSupplier,
    deleteSupplier,
    getSuppliers, 
    getSupplierById
} from "../controllers/NhaCungCap";

const router = express.Router();

// Route để thêm nhà cung cấp
router.post("/add", addSupplier);

/**
 * @route       PUT '/api/supplier/update/:id'
 * @description Sửa thông tin nhà cung cấp (tên)
 */
router.put("/update/:id", updateSupplier);

/**
 * @route       DELETE '/api/supplier/delete/:id'
 * @description Xóa nhà cung cấp
 */
router.delete("/delete/:id", deleteSupplier);

// Route xem nhà cung cấp
router.get("/get", getSuppliers);

// Route xem nhà cung cấp theo id
router.get("/get/:id", getSupplierById);


export default router;