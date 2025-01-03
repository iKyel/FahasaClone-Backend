import express from "express"
import { registerAccount, loginAccount } from "../controllers/TaiKhoan";

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

export default taiKhoanRouter;