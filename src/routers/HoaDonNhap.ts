import express from 'express';
import {
    cancelPurchaseInvoice,
    confirmPurchaseInvoice,
    createPurchaseInvoice,
    getAllPurchaseInvoices,
    getDetailPurchaseInvoice,
    searchInvoice
} from '../controllers/HoaDonNhap';
import verifyToken from '../middlewares/verifyToken';
import { checkRoleStaff } from '../middlewares/authorizedUser';

const router = express.Router();

/**
 * @route       POST '/api/purchaseInvoice/create'
 * @description Tạo hóa đơn nhập
 */
router.post("/create", verifyToken, checkRoleStaff, createPurchaseInvoice);

/**
 * @route       PATCH '/api/purchaseInvoice/confirm/:id'
 * @description Xác nhận hóa đơn nhập
 * @param       id - id của hóa đơn nhập
 */
router.patch("/confirm/:id", verifyToken, checkRoleStaff, confirmPurchaseInvoice);

/**
 * @route      PATCH '/api/purchaseInvoice/cancel/:id'
 * @description Hủy hóa đơn nhập
 * @param       id - id của hóa đơn nhập
 */
router.patch("/cancel/:id", verifyToken, checkRoleStaff, cancelPurchaseInvoice);

/**
 * @route       GET '/api/purchaseInvoice/getAll'
 * @description Lấy tất cả hóa đơn nhập
 */
router.get("/getAll", verifyToken, checkRoleStaff, getAllPurchaseInvoices);

/**
 * @route       GET '/api/purchaseInvoice/getDetail/:id'
 * @description Lấy chi tiết hóa đơn nhập
 * @param       id - id của hóa đơn nhập
 */
router.get("/getDetail/:id", verifyToken, checkRoleStaff, getDetailPurchaseInvoice);

/**
 * @route       GET '/api/purchaseInvoice/searchInvoice'
 * @description Tìm kiếm hóa đơn nhập
 * @query       id - id của nhà cung cấp hoặc hóa đơn nhập
 */
router.get("/searchInvoice", verifyToken, checkRoleStaff, searchInvoice);


export default router;