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

/**
 * @route       GET '/api/taiKhoan/khachhang'
 * @description Lấy danh sách tài khoản khách hàng
 */
router.get("/khachhang", getDanhSachTaiKhoanKhachHang);

/**
 * @route       GET '/api/taiKhoan/nhanvien'
 * @description Lấy danh sách tài khoản nhân viên
 */
router.get("/nhanvien", getDanhSachTaiKhoanNhanVien);

/**
 * @route       GET '/api/taiKhoan/timkiem'
 * @description Tìm kiếm tài khoản
 */
router.post("/timkiem", timKiemTaiKhoan);

/**
 * @route       PATCH '/api/:userId/khoa'
 * @description LKhoá tài khoản
 */
router.patch("/:userId/khoa", khoaTaiKhoan);

export default router;
