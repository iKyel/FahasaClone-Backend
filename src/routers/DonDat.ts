import express from 'express';
import verifyToken from '../middlewares/verifyToken';
import { checkRoleCustomer } from '../middlewares/authorizedUser';
import {
    getCart,
    addToCart,
    selectProductInCart,
    updateCart,
    removeProduct
} from '../controllers/DonDat';

const router = express.Router();

/**
 * @route       GET '/api/order/getCart'
 * @description Lấy thông tin giỏ hàng của người dùng
 */
router.get("/getCart", verifyToken, checkRoleCustomer, getCart);

/**
 * @route       POST '/api/order/addToCart'
 * @description Thêm sản phẩm vào giỏ hàng
 */
router.post("/addToCart", verifyToken, checkRoleCustomer, addToCart);

/**
 * @route       PATCH '/api/order/selectProductInCart'
 * @description Chọn sản phẩm trong giỏ hàng
 */
router.patch("/selectProductInCart", verifyToken, checkRoleCustomer, selectProductInCart);

/**
 * @route       PUT '/api/order/update'
 * @description Xoá sản phẩm khỏi giỏ hàng
 */
router.put("/update", verifyToken, checkRoleCustomer, updateCart);

/**
 * @route       DELETE '/api/order/remove/:id'
 * @description Xoá sản phẩm khỏi giỏ hàng
 */
router.delete("/remove:id", verifyToken, checkRoleCustomer, removeProduct);

export default router;