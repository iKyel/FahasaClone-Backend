import express from "express";
import {
  dangKiTaiKhoan,
  dangNhapTaiKhoan,
  getDanhSachTaiKhoanKhachHang,
  getDanhSachTaiKhoanNhanVien,
  timKiemTaiKhoan,
  khoaTaiKhoan,
} from "../controllers/TaiKhoan";

const router = express.Router();

/**
 * @route       POST '/api/taiKhoan/register'
 * @description Đăng ký một tài khoản mới
 */
router.post("/dangki", dangKiTaiKhoan);

/**
 * @route       POST '/api/taiKhoan/login'
 * @description Đăng nhập vào tài khoản
 */
router.post("/dangnhap", dangNhapTaiKhoan);

// GET /api/taikhoan/khachhang - Lấy danh sách tài khoản khách hàng (loại TK: KH)
router.get("/khachhang", getDanhSachTaiKhoanKhachHang);

// GET /api/taikhoan/nhanvien - Lấy danh sách tài khoản khách hàng (loại TK: KH)
router.get("/nhanvien", getDanhSachTaiKhoanNhanVien);

// POST /api/taikhoan/timkiem - Tìm kiếm và lấy danh sách tài khoản
router.post("/timkiem", timKiemTaiKhoan);

// PATCH /api/taikhoan/:userId/khoa - Khóa hoặc hủy khóa tài khoản
router.patch("/:userId/khoa", khoaTaiKhoan);

export default router;
