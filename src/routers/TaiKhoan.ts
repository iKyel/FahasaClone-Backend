import express from "express";
import {
    dangKiTaiKhoan,
    dangNhapTaiKhoan,
    capNhatTaiKhoan
    //   getDanhSachTaiKhoanKhachHang,
    //   getDanhSachTaiKhoanNhanVien,
    //   timKiemTaiKhoan,
    //   khoaTaiKhoan,
} from "../controllers/TaiKhoan";
import verifyToken from "../middlewares/verifyToken";

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
 * @route       PUT '/api/taiKhoan/updateProfile'
 * @description Cập nhật thông tin tài khoản
 */
router.put('/capNhatTaiKhoan', verifyToken, capNhatTaiKhoan);


export default router;
