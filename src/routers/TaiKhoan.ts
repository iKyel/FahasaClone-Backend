import express from "express";
import {
    dangKiTaiKhoan,
    dangNhapTaiKhoan,
    capNhatTaiKhoan,
    createAddress,
    deleteAddress,
    setDefaultAddress,
    changePassword
} from "../controllers/TaiKhoan";
import verifyToken from "../middlewares/verifyToken";

const router = express.Router();

/**
 * @route       POST '/api/taiKhoan/register'
 * @description Đăng ký một tài khoản mới
 */
router.post("/dangKi", dangKiTaiKhoan);

/**
 * @route       POST '/api/taiKhoan/login'
 * @description Đăng nhập vào tài khoản
 */
router.post("/dangNhap", dangNhapTaiKhoan);

/**
 * @route       PUT '/api/taiKhoan/capNhatTaiKhoan'
 * @description Cập nhật thông tin tài khoản
 */
router.put('/capNhatTaiKhoan', verifyToken, capNhatTaiKhoan);

/**
 * @route       POST '/api/account/createAddress'
 * @description Thêm địa chỉ của tài khoản
 */
router.post('/createAddress', verifyToken, createAddress);

/**
 * @route       DELETE '/api/account/deleteAddress/:idx'
 * @description Xóa địa chỉ của tài khoản
 */
router.delete('/deleteAddress/:idx', verifyToken, deleteAddress);

/**
 * @route       PUT '/api/account/setDefaultAddress'
 * @description Đặt làm địa chỉ mặc định
 */
router.put('/setDefaultAddress', verifyToken, setDefaultAddress);

/**
 * @route       PUT '/api/account/changePassword'
 * @description Đổi mật khẩu tài khoản
 */
router.put('/changePassword', verifyToken, changePassword);


export default router;
