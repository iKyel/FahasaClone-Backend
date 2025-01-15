import express from "express";
import {
    register,
    login,
    logout,
    getAccount,
    updateAccount,
    createAddress,
    deleteAddress,
    setDefaultAddress,
    changePassword,
    getCustomers,
    getEmployees,
    search,
    lock,
} from "../controllers/TaiKhoan";
import verifyToken from "../middlewares/verifyToken";
import { checkRoleAdmin, checkRoleStaff } from "../middlewares/authorizedUser";

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
 * @route       GET '/api/account/logout'
 * @description Đăng xuất khỏi tài khoản
 */
router.get("/logout", verifyToken, logout);

/**
 * @route       GET '/api/account/getAccount'
 * @description Lấy thông tin tài khoản
 */
router.get('/getAccount', verifyToken, getAccount);

/**
 * @route       PUT '/api/account/updateAccount'
 * @description Cập nhật thông tin tài khoản
 */
router.put('/updateAccount', verifyToken, updateAccount);

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

//--------------------------------------------------------//

/**
 * @route       GET '/api/account/getCustomers'
 * @description Lấy danh sách tài khoản khách hàng
 */
router.get("/getCustomers", verifyToken, checkRoleStaff, getCustomers);

/**
 * @route       GET '/api/account/getEmployees'
 * @description Lấy danh sách tài khoản nhân viên
 */
router.get("/getEmployees", verifyToken, checkRoleAdmin, getEmployees);

/**
 * @route       GET '/api/account/search'
 * @description Tìm kiếm tài khoản
 */
router.get("/search", search);

/**
 * @route       PATCH '/api/account/:userId/lock'
 * @description Khoá tài khoản
 */
router.patch("/:userId/lockAccount", verifyToken, checkRoleAdmin, lock);


export default router;