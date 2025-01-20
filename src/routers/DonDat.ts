import express from 'express';
import verifyToken from '../middlewares/verifyToken';
import { checkRoleCustomer, checkRoleStaff } from '../middlewares/authorizedUser';
import {
    getCart,
    addToCart,
    selectProductInCart,
    updateCart,
    removeProduct,
    getSelectedProductsInCart,
    createPaymentOrder,
    completeOrder,
    cancelOrder,
    customerGetSaleInvokes,
    staffGetSaleInvokes,
    getSaleInvoiceDetail,
    findSaleInvokes
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
router.delete("/remove/:id", verifyToken, checkRoleCustomer, removeProduct);

router.get("/getSelectedProduct", verifyToken, checkRoleCustomer, getSelectedProductsInCart);

router.post("/createPaymentOrder", verifyToken, checkRoleCustomer, createPaymentOrder);

router.patch("/completeOrder/:id", verifyToken, checkRoleStaff, completeOrder);

router.patch("/cancelOrder/:id", verifyToken, checkRoleStaff, cancelOrder);

router.get("/customerGetSaleInvokes", verifyToken, checkRoleCustomer, customerGetSaleInvokes);

router.get("/staffGetSaleInvokes", verifyToken, checkRoleStaff, staffGetSaleInvokes);

router.get("/getSaleInvoikeDetail/:id", verifyToken, getSaleInvoiceDetail);

router.get("/getSaleInvokesById/:id", verifyToken, checkRoleStaff, getSaleInvoiceDetail);

router.get("/sale-invoices/:id", verifyToken, findSaleInvokes);

export default router;