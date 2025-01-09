import express from "express";
import { addCategory, getCategories, getCategoryName } from "../controllers/DanhMuc";

const router = express.Router();

// Route thêm danh mục
router.post("/addCategory", addCategory);

// Route xem tất cả danh mục
router.get("/getCategories", getCategories);

// Route lấy tên danh mục theo ID
router.get("/getCategoryName/:danhMucId", getCategoryName);

export default router;
