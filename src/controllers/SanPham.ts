import { Request, Response } from 'express';
import { IDacTrung, ISanPham } from '../interface/ModelInterface';
import SanPham from '../models/SanPham';
import DacTrung_SanPham from '../models/DacTrung_SanPham';
import DacTrung from '../models/DacTrung';
import HoaDonNhap from '../models/HoaDonNhap';
import ChiTietHDN from '../models/ChiTietHDN';

const ITEMS_PER_PAGE = 24;

/**
 * @description Tạo sản phẩm mới
 * @param {Request} req - Request object
 * @param {Response} res - Response object
 * @returns message
 */
export const createProduct = async (req: Request, res: Response) => {
    try {
        const sanPham: ISanPham = req.body;
        const features: Array<{ _id: string, ten: string, giaTri: string }> = req.body.features;
        // Thêm sản phẩm vào bảng SanPham
        const sanPhamInDB = await SanPham.create(sanPham);
        // Thêm các đặc trưng của sản phẩm vào bảng DacTrung_SanPham
        await DacTrung_SanPham.create(features.map(dacTrung => ({
            sanPhamId: sanPhamInDB._id,
            dacTrungId: dacTrung._id,
            giaTri: dacTrung.giaTri
        })));
        res.status(200).json({ message: 'Tạo sản phẩm thành công.' });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Lỗi hệ thống máy chủ.' });
    }
}

/**
 * @description Cập nhật thông tin sản phẩm
 * @param {Request} req - Request object
 * @param {Response} res - Response object
 * @returns message
 */
export const updateProduct = async (req: Request, res: Response) => {
    try {
        const productId = req.params.id;
        const sanPham: ISanPham = req.body;
        const dacTrungSPs: Array<{ _id: string, ten: string, giaTri: string }> = req.body.features;
        // Cập nhật thông tin sản phẩm
        await SanPham.findByIdAndUpdate(productId, sanPham);
        // Cập nhật các đặc trưng của sản phẩm
        await Promise.all(dacTrungSPs.map(dacTrung => DacTrung_SanPham.findOneAndUpdate(
            { sanPhamId: productId, dacTrungId: dacTrung._id },
            { giaTri: dacTrung.giaTri },
            { upsert: true }    // Nếu không tìm thấy thì tạo mới
        )));
        res.status(200).json({ message: 'Cập nhật sản phẩm thành công.' });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Lỗi hệ thống máy chủ.' });
    }
}

/**
 * @description Tìm kiếm sản phẩm
 * @param {Request} req - Request object
 * @param {Response} res - Response object
 * @returns message, products, totalPage
 */
export const searchProduct = async (req: Request, res: Response) => {
    try {
        const { searchName = '', pageNum = 1 } = req.query as unknown as { searchName: string, pageNum: number };
        const searchQuery = {
            tenSP: {
                $regex: searchName,
                $options: 'i'
            }
        };
        // Lấy tổng số trang sản phẩm thỏa mãn
        const totalProducts = await SanPham.countDocuments(searchQuery);
        const totalPage = Math.ceil(totalProducts / ITEMS_PER_PAGE);
        // Lấy danh sách sản phẩm thỏa mãn
        const products = await SanPham.find(searchQuery)
            .skip((pageNum - 1) * ITEMS_PER_PAGE)
            .limit(ITEMS_PER_PAGE);
        if (products.length === 0) {
            res.status(404).json({ message: 'Không tìm thấy sản phẩm nào.' });
            return;
        }
        res.status(200).json({ message: 'Tìm kiếm sản phẩm thành công.', products, totalPage });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Lỗi hệ thống máy chủ.' });
    }
}

/**
 * @description Lấy danh sách sản phẩm theo tiêu chí lọc và sắp xếp
 * @param {Request} req - Request object
 * @param {Response} res - Response object
 * @query danhMucId, dacTrung_sanPhamId, nhaCungCapId, price, orderBy, pageNum
 * @returns message, products
 */
export const getProducts = async (req: Request, res: Response) => {
    try {
        const { category, supplier, price, orderBy, pageNum = 1, ...listFeatures } = req.query as unknown as {
            category: string,
            supplier: string,
            price: string,
            orderBy: string,
            pageNum: number,
            [key: string]: string | number
        };

        // Lọc sản phẩm theo các tiêu chí
        let filter: any = {};

        // Lọc sản phẩm theo danh mục
        if (category) {
            filter.danhMucId = category;
        }

        // Lọc sản phẩm theo nhà cung cấp và đặc trưng
        let sanPhamIds: Array<string> = [];
        // Lọc sản phẩm theo nhà cung cấp
        let sanPhamIdsByNhaCC: Array<string> = [];
        if (supplier) {
            sanPhamIdsByNhaCC = (await HoaDonNhap.aggregate()
                .match({ nhaCungCapId: supplier })
                .lookup({
                    from: 'ChiTietHDNs',
                    localField: '_id',
                    foreignField: 'hoaDonNhapId',
                    as: 'chitietHDNs'
                })
                .unwind('$chitietHDNs')
                .group({
                    _id: '$chitietHDNs.sanPhamId'
                }))
                .map(item => item._id.toString());
        }
        // Lọc sản phẩm theo đặc trưng
        let sanPhamIdsByDacTrung: Array<string> = [];
        if (Object.keys(listFeatures).length > 0) {
            // Truy vấn lấy các dacTrungId theo tenTruyVan
            const dacTrungSp_Id_TenTV_Gtri = (await DacTrung.find({
                tenTruyVan: {
                    $in: Object.keys(listFeatures)
                }
            }))
                .map(dacTrung => ({
                    _id: dacTrung._id,
                    tenTruyVan: dacTrung.tenTruyVan,
                    giaTri: listFeatures[dacTrung.tenTruyVan]
                }));

            // Truy vấn lấy các sanPhamId thỏa mãn tất cả đặc trưng và giá trị tương ứng
            for (let item of dacTrungSp_Id_TenTV_Gtri) {
                const listSanPhamIds = (await DacTrung_SanPham.find({
                    dacTrungId: item._id,
                    giaTri: item.giaTri
                }))
                    .map(dacTrungSP => dacTrungSP.sanPhamId.toString());
                if (sanPhamIdsByDacTrung.length === 0) {
                    sanPhamIdsByDacTrung = listSanPhamIds;
                } else {
                    sanPhamIdsByDacTrung = sanPhamIdsByDacTrung.filter(id => listSanPhamIds.includes(id));
                }
            }
        }
        // Lấy các sản phẩm có trong cả 2 Nhà cung cấp và Đặc trưng
        if (supplier && Object.keys(listFeatures).length > 0) {
            sanPhamIds = sanPhamIdsByNhaCC.filter(id => sanPhamIdsByDacTrung.includes(id));
            filter._id = { $in: sanPhamIds };
        } else if (supplier) {
            filter._id = { $in: sanPhamIdsByNhaCC };
        } else if (Object.keys(listFeatures).length > 0) {
            filter._id = { $in: sanPhamIdsByDacTrung };
        }

        // Lọc sản phẩm theo giá
        if (price) {
            const [minPrice, maxPrice] = price.split('-').map(Number);
            filter.giaBan = {
                $gte: minPrice,
                $lte: maxPrice
            };
        }

        // Sắp xếp sản phẩm
        let sort: any = {};
        switch (orderBy) {
            case 'A-Z':
                sort.tenSP = 1;
                break;
            case 'Z-A':
                sort.tenSP = -1;
                break;
            case 'Giá tăng dần':
                sort.giaBan = 1;
                break;
            case 'Giá giảm dần':
                sort.giaBan = -1;
                break;
            case 'Mới nhất':
                sort.createdAt = -1;
                break;
            case 'Cũ nhất':
                sort.createdAt = 1;
                break;
            default:
                break;
        }

        // Lấy tổng số trang sản phẩm thỏa mãn
        const totalProducts = await SanPham.countDocuments(filter);
        const totalPage = Math.ceil(totalProducts / ITEMS_PER_PAGE);

        // Lấy danh sách sản phẩm thỏa mãn
        const products = await SanPham.find(filter)
            .sort(sort)
            .skip((pageNum - 1) * ITEMS_PER_PAGE)
            .limit(ITEMS_PER_PAGE);
        if (products.length === 0) {
            res.status(404).json({ message: 'Không tìm thấy sản phẩm nào.' });
            return;
        }
        res.status(200).json({ message: 'Lấy danh sách sản phẩm thành công.', products, totalPage });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Lỗi hệ thống máy chủ.' });
    }
}

/**
 * @description Lấy thông tin chi tiết sản phẩm
 * @param {Request} req - Request object
 * @param {Response} res - Response object
 * @returns message, product
 */
export const getProductDetail = async (req: Request, res: Response) => {
    try {
        const productId = req.params.id;
        // Lấy thông tin chung sản phẩm
        const product = await SanPham.findById(productId);
        if (!product) {
            res.status(404).json({ message: 'Không tìm thấy sản phẩm.' });
            return;
        }
        // Lấy các đặc trưng của sản phẩm
        const features = (await DacTrung_SanPham.find({ sanPhamId: productId })
            .populate({
                path: 'dacTrungId',
                select: ['_id', 'ten'],
                model: DacTrung
            }))
            .map(dacTrungSP => ({
                _id: dacTrungSP._id,
                dacTrungId: dacTrungSP.dacTrungId._id,
                ten: (dacTrungSP.dacTrungId as unknown as IDacTrung).ten,
                giaTri: dacTrungSP.giaTri
            }));
        res.status(200).json({
            message: 'Lấy thông tin chi tiết sản phẩm thành công!',
            productDetail: {
                ...product.toObject(),
                features
            },
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Lỗi hệ thống máy chủ.' });
    }
}