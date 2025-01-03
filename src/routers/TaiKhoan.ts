import express from "express"
import { registerAccount } from "../controllers/TaiKhoan";

const taiKhoanRouter = express.Router();

// Route cho việc đăng ký tài khoản
taiKhoanRouter.post('/register', registerAccount);

export default taiKhoanRouter;