import express, { Request, Response } from 'express';
import { AuthenticatedRequest } from '../interface/AutheticatedRequest';
import HoaDonNhap from '../models/HoaDonNhap';
import ChiTietHDN from '../models/ChiTietHDN';
import SanPham from '../models/SanPham';
import mongoose from 'mongoose';

/**
 * @description Controller tạo hóa đơn nhập
 * @param {AuthenticatedRequest} req - Request của người dùng
 * @param {Response} res - Response trả về cho người dùng
 * @returns message
 */
export const createPurchaseInvoice = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const user = req.user;
        const { purchaseInvoice, detailPurchaseInvoices } = req.body as unknown as {
            purchaseInvoice: {
                supplierId: string,
                ghiChu: string,
                tongTien: number
            }
            detailPurchaseInvoices: Array<{
                productId: string,
                soLuong: number,
                thanhTien: number,
            }>
        };
        // Tạo hóa đơn nhập
        const newPurchaseInvoice = await HoaDonNhap.create({
            nhaCungCapId: purchaseInvoice.supplierId,
            nhanVienId: user?._id,
            ghiChu: purchaseInvoice.ghiChu,
            tongTien: purchaseInvoice.tongTien
        });
        // Tạo các chi tiết hóa đơn nhập
        await ChiTietHDN.create(
            detailPurchaseInvoices.map(detail => ({
                hoaDonNhapId: newPurchaseInvoice._id,
                sanPhamId: detail.productId,
                soLuong: detail.soLuong,
                thanhTien: detail.thanhTien
            }))
        );
        res.status(201).json({ message: "Tạo hóa đơn nhập thành công." });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Lỗi hệ thống máy chủ." });
    }
}

/**
 * @description Controller xác nhận hóa đơn nhập 'Chờ xác nhận' sang 'Hoàn thành'
 * @param {AuthenticatedRequest} req - Request của người dùng
 * @param {Response} res - Response trả về cho người dùng
 * @returns message, purchaseInvoices
 */
export const confirmPurchaseInvoice = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { id } = req.params;
        let purchaseInvoice = await HoaDonNhap.findById(id);
        if (!purchaseInvoice) {
            res.status(404).json({ message: "Không tìm thấy hóa đơn nhập." });
            return;
        }
        if (purchaseInvoice.trangThaiDon !== "Chờ xác nhận") {
            res.status(400).json({ message: "Hóa đơn nhập đã được xử lý." });
            return;
        }
        // Cập nhật trạng thái hóa đơn nhập
        purchaseInvoice = await HoaDonNhap.findByIdAndUpdate(id,
            { trangThaiDon: "Hoàn thành" },
            { new: true }
        );
        // Duyệt từng chi tiết hóa đơn nhập, thêm số lượng sản phẩm trong hđ vào kho hàng
        const detailPurchaseInvoices = await ChiTietHDN.find({ hoaDonNhapId: purchaseInvoice?._id })
            .select('sanPhamId soLuong');
        const bulkOperations = detailPurchaseInvoices.map(detail => ({
            updateOne: {
                filter: { _id: detail.sanPhamId },
                update: { $inc: { soLuong: detail.soLuong } }
            }
        }));
        await SanPham.bulkWrite(bulkOperations);
        // Lấy danh sách hóa đơn nhập sau khi cập nhật
        const purchaseInvoices = await HoaDonNhap.find();
        res.status(200).json({
            message: "Xác nhận hóa đơn nhập thành công.",
            purchaseInvoices
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Lỗi hệ thống máy chủ." });
    }
}

/**
 * @description Controller hủy hóa đơn nhập 'Chờ xác nhận' sang 'Đã hủy'
 * @param {AuthenticatedRequest} req - Request của người dùng
 * @param {Response} res - Response trả về cho người dùng
 * @returns message, purchaseInvoices
 */
export const cancelPurchaseInvoice = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { id } = req.params;
        let purchaseInvoice = await HoaDonNhap.findById(id);
        if (!purchaseInvoice) {
            res.status(404).json({ message: "Không tìm thấy hóa đơn nhập." });
            return;
        }
        if (purchaseInvoice.trangThaiDon !== "Chờ xác nhận") {
            res.status(400).json({ message: "Hóa đơn nhập đã được xử lý." });
            return;
        }
        // Cập nhật trạng thái hóa đơn nhập
        purchaseInvoice = await HoaDonNhap.findByIdAndUpdate(id,
            { trangThaiDon: "Đã hủy" },
            { new: true }
        );
        // Lấy danh sách hóa đơn nhập sau khi cập nhật
        const purchaseInvoices = await HoaDonNhap.find();
        res.status(200).json({
            message: "Hủy hóa đơn nhập thành công.",
            purchaseInvoices
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Lỗi hệ thống máy chủ." });
    }
}

/**
 * @description Controller lấy tất cả hóa đơn nhập
 * @param {AuthenticatedRequest} req - Request của người dùng
 * @param {Response} res - Response trả về cho người dùng
 * @returns purchaseInvoices, message
 */
export const getAllPurchaseInvoices = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const purchaseInvoices = await HoaDonNhap.find();
        res.status(200).json({ 
            message: "Lấy danh sách hóa đơn nhập thành công.",
            purchaseInvoices 
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Lỗi hệ thống máy chủ." });
    }
}

/**
 * @description Controller lấy chi tiết hóa đơn nhập
 * @param {AuthenticatedRequest} req - Request của người dùng
 * @param {Response} res - Response trả về cho người dùng
 * @returns purchaseInvoice, detailPurchaseInvoices, message
 */
export const getDetailPurchaseInvoice = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { id } = req.params;
        // Lấy hóa đơn nhập
        const purchaseInvoice = (await HoaDonNhap.aggregate()
            .match({ _id: new mongoose.Types.ObjectId(id) })
            .lookup({
                from: "NhaCungCaps",
                localField: "nhaCungCapId",
                foreignField: "_id",
                as: "supplier"
            })
            .unwind("$supplier")
            .project({
                _id: 1,
                supplierId: "$supplier._id",
                ten: "$supplier.ten",
                nhanVienId: 1,
                trangThaiDon: 1,
                ghiChu: 1,
                tongTien: 1,
                createdAt: 1
            })).pop()
        if (!purchaseInvoice) {
            res.status(404).json({ message: "Không tìm thấy hóa đơn nhập." });
            return;
        }
        // Lấy chi tiết hóa đơn nhập
        const detailPurchaseInvoices = await ChiTietHDN.aggregate()
            .match({ hoaDonNhapId: new mongoose.Types.ObjectId(id) })
            .lookup({
                from: "SanPhams",
                localField: "sanPhamId",
                foreignField: "_id",
                as: "product"
            })
            .unwind("$product")
            .project({
                _id: 1,
                soLuong: 1,
                thanhTien: 1,
                sanPhamId: "$product._id",
                tenSP: "$product.tenSP",
                giaNhap: "$product.giaNhap",
                imageUrl: "$product.imageUrl"
            });
        res.status(200).json({
            message: "Lấy chi tiết hóa đơn nhập thành công.",
            purchaseInvoice,
            detailPurchaseInvoices
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Lỗi hệ thống máy chủ." });
    }
}

/**
 * @description Controller tìm kiếm hóa đơn nhập theo id nhà cung cấp hoặc id hóa đơn nhập
 * @param {AuthenticatedRequest} req - Request của người dùng
 * @param {Response} res - Response trả về cho người dùng
 * @returns purchaseInvoices, message
 */
export const searchInvoice = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { id } = req.query as unknown as { id: string };
        let purchaseInvoices;
        if (id) {
            purchaseInvoices = await HoaDonNhap.find({
                $or: [
                    { _id: id },
                    { nhaCungCapId: id }
                ]
            });
        } else {
            purchaseInvoices = await HoaDonNhap.find();
        }
        res.status(200).json({
            message: "Tìm kiếm hóa đơn nhập thành công.",
            purchaseInvoices
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Lỗi hệ thống máy chủ." });
    }
}