import express from "express"
import { registerAccount, loginAccount, capNhatTaiKhoan } from "../controllers/TaiKhoan";
import verifyToken from "../middlewares/verifyToken";

const taiKhoanRouter = express.Router();

/**
 * @route       POST '/api/taiKhoan/register'
 * @description Đăng ký một tài khoản mới
 */
taiKhoanRouter.post('/register', registerAccount);

/**
 * @route       POST '/api/taiKhoan/login'
 * @description Đăng nhập vào tài khoản
 */
taiKhoanRouter.post('/login', loginAccount);

/**
 * @route       PUT '/api/taiKhoan/updateProfile'
 * @description Cập nhật thông tin tài khoản
 */
taiKhoanRouter.put('/capNhatTaiKhoan', verifyToken, capNhatTaiKhoan);

export default taiKhoanRouter;