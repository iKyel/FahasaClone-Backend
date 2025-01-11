import express from 'express';
import { 
    createProduct,
    updateProduct,
    searchProduct,
    getProducts,
    getProductDetail
} from '../controllers/SanPham';

const router = express.Router();

/**
 * @route       POST '/api/product/createProduct'
 * @description Tạo sản phẩm mới
 */
router.post("/createProduct", createProduct);

/**
 * @route       PUT '/api/product/updateProduct/:id'
 * @description Cập nhật thông tin sản phẩm
 * @param       id
 */
router.put("/updateProduct/:id", updateProduct);

/**
 * @route       GET '/api/product/searchProduct'
 * @description Tìm kiếm sản phẩm
 * @query       searchName, page
 */
router.get("/searchProduct", searchProduct);

/**
 * @route       GET '/api/product/getProducts'
 * @description Lấy danh sách sản phẩm theo tiêu chí lọc và sắp xếp
 * @query       danhMucId, dacTrung_sanPhamId, nhaCungCapId, price, orderBy, pageNum   
 */
router.get("/getProducts", getProducts);

/**
 * @route       GET '/api/product/getProductDetail/:id'
 * @description Lấy thông tin chi tiết sản phẩm
 * @param       id
 */
router.get("/getProductDetail/:id", getProductDetail);


export default router;