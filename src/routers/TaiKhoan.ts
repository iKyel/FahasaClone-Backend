import express from "express";
import {
  register,
  login,
  getCustomers,
  getEmployees,
  search,
  lock,
} from "../controllers/TaiKhoan";

const router = express.Router();

/**
 * @route       POST '/api/account/register'
 * @description Đăng ký một tài khoản mới
 */
router.post("/register", register);

/**
 * @route       POST '/api/account/login'
 * @description Đăng nhập vào tài khoản
 */
router.post("/login", login);

/**
 * @route       GET '/api/account/getCustomers'
 * @description Lấy danh sách tài khoản khách hàng
 */
router.get("/getCustomers", getCustomers);

/**
 * @route       GET '/api/account/getEmployees'
 * @description Lấy danh sách tài khoản nhân viên
 */
router.get("/getEmployees", getEmployees);

/**
 * @route       GET '/api/account/search'
 * @description Tìm kiếm tài khoản
 */
router.get("/search", search);

/**
 * @route       PATCH '/api/account/:userId/lock'
 * @description Khoá tài khoản
 */
router.patch("/:userId/lockAccount", lock);

export default router;
