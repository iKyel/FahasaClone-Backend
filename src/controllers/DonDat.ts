import { Response } from "express";
import { AuthenticatedRequest } from "../interface/AutheticatedRequest";
import DonDat from "../models/DonDat";
import ChiTietDonDat from "../models/ChiTietDonDat";
import SanPham from "../models/SanPham";
import getUserCart, { getUserCartDetail } from "../utils/getUserCart";
import { get } from "http";

/**
 * @description Controller lấy thông tin giỏ hàng của người dùng
 * @param {AuthenticatedRequest} req - Request của người dùng
 * @param {Response} res - Response trả về cho người dùng
 * @returns message, cart, cartDetail
 */
export const getCart = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const user = req.user!;
        // Tìm giỏ hàng của người dùng, nếu không có thì tạo mới
        const cart = await getUserCart(user._id);
        const cartDetail = await getUserCartDetail(cart?._id);
        res.status(200).json({
            message: 'Lấy thông tin giỏ hàng thành công!',
            cart,
            cartDetail
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Lỗi hệ thống máy chủ.' });
    }
};

/**
 * @description Controller thêm sản phẩm vào giỏ hàng
 * @param {AuthenticatedRequest} req - Request của người dùng
 * @param {Response} res - Response trả về cho người dùng
 * @returns message
 */
export const addToCart = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const user = req.user!;
        const { _id, numberOfProduct } = req.body as unknown as { _id: string, numberOfProduct: number };
        const product = await SanPham.findById(_id)
            .select('soLuong giaBan khuyenMai');
        if (!product) {
            res.status(404).json({ message: 'Không tìm thấy sản phẩm!' });
            return;
        }
        // Lấy cart của người dùng
        let cart = await getUserCart(user._id);
        let soLuongTrongCart = numberOfProduct;
        // Lấy cartDetail của người dùng
        const cartDetail = await ChiTietDonDat.findOne({
            donDatId: cart?._id,
            sanPhamId: _id
        });
        if (cartDetail) {
            soLuongTrongCart += cartDetail.soLuong;
        }
        // Kiểm tra số lượng trong giỏ + số lượng mới có vượt quá 10% số lượng tồn không
        if (soLuongTrongCart > product.soLuong * 0.1) {
            res.status(400).json({ message: 'Số lượng sản phẩm trong giỏ hàng vượt quá số lượng tồn!' });
            return;
        }
        // Không thì cập nhật số lượng và thành tiền. Nếu chưa có thì thêm mới
        const thanhTien = (product.giaBan - product.giaBan * product.khuyenMai / 100) * soLuongTrongCart;
        await ChiTietDonDat.findByIdAndUpdate(cartDetail?._id,
            {
                $setOnInsert: {
                    sanPhamId: _id,
                    donDatId: cart?._id
                },
                soLuong: soLuongTrongCart,
                thanhTien: thanhTien
            },
            {
                upsert: true
            }
        );
        // Cập nhật tổng tiền của giỏ hàng
        cart = (await DonDat.findByIdAndUpdate(cart._id,
            {
                tongTien: cart?.tongTien + thanhTien
            },
            {
                new: true
            }
        ))!;
        // Lấy cartDetail của người dùng sau khi cập nhật
        const newCartDetail = await getUserCartDetail(cart?._id);
        res.status(200).json({
            message: 'Thêm sản phẩm vào giỏ hàng thành công!',
            cart,
            cartDetail: newCartDetail
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Lỗi hệ thống máy chủ.' });
    }
};