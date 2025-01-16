import { Router } from "express";
import { getDacTrungs } from "../controllers/DacTrung"; 

const router = Router();

// Định nghĩa route để lấy danh sách đặc trưng
router.get("/getAll", getDacTrungs);

export default router;
