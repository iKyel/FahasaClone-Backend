import { Response } from "express";
import { AuthenticatedRequest } from "../interface/AutheticatedRequest";
import DonDat from "../models/DonDat";
import ChiTietDonDat from "../models/ChiTietDonDat";
import SanPham from "../models/SanPham";
import getUserCart, { getUserCartDetail } from "../utils/getUserCart";
import ChiTietDonDatModel from "../models/ChiTietDonDat";
import { ISanPham } from "../interface/ModelInterface";

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
            message: "Lấy thông tin giỏ hàng thành công!",
            cart,
            cartDetail,
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Lỗi hệ thống máy chủ." });
    }
};

/**
 * @description Controller thêm sản phẩm vào giỏ hàng
 * @param {AuthenticatedRequest} req - Request của người dùng
 * @param {Response} res - Response trả về cho người dùng
 * @returns message, cart, cartDetail
 */
export const addToCart = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const user = req.user!;
        const { _id, numberOfProduct } = req.body as unknown as {
            _id: string;
            numberOfProduct: number;
        };
        const product = await SanPham.findById(_id).select(
            "soLuong giaBan khuyenMai"
        );
        if (!product) {
            res.status(404).json({ message: "Không tìm thấy sản phẩm!" });
            return;
        }
        // Lấy cart của người dùng
        const cart = await getUserCart(user._id);
        let soLuongTrongCart = numberOfProduct;
        // Lấy cartDetail của người dùng
        const cartDetail = await ChiTietDonDat.findOne({
            donDatId: cart?._id,
            sanPhamId: _id,
        });
        if (cartDetail) {
            soLuongTrongCart += cartDetail.soLuong;
        }
        // Kiểm tra số lượng trong giỏ + số lượng mới có vượt quá 10% số lượng tồn không
        if (soLuongTrongCart > product.soLuong * 0.1) {
            res.status(400).json({
                message: "Số lượng sản phẩm trong giỏ hàng vượt quá số lượng tồn!",
            });
            return;
        }
        // Không thì cập nhật số lượng và thành tiền. Nếu chưa có thì thêm mới
        const thanhTien =
            (product.giaBan - (product.giaBan * product.khuyenMai) / 100) *
            soLuongTrongCart;
        await ChiTietDonDat.updateOne(
            {
                sanPhamId: _id,
                donDatId: cart?._id,
            },
            {
                soLuong: soLuongTrongCart,
                thanhTien: thanhTien,
            },
            {
                upsert: true,
            }
        );
        // Lấy cartDetail của người dùng sau khi cập nhật
        const newCartDetail = await getUserCartDetail(cart?._id);
        res.status(200).json({
            message: "Thêm sản phẩm vào giỏ hàng thành công!",
            cart,
            cartDetail: newCartDetail,
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Lỗi hệ thống máy chủ." });
    }
};

/**
 * @description Controller chọn sản phẩm trong giỏ hàng
 * @param {AuthenticatedRequest} req - Request của người dùng
 * @param {Response} res - Response trả về cho người dùng
 * @returns message, cart, cartDetail
 */
export const selectProductInCart = async (
    req: AuthenticatedRequest,
    res: Response
) => {
    try {
        const { id } = req.body as unknown as { id: string | boolean };
        const user = req.user!;
        let cart = await getUserCart(user._id);
        let cartDetail = [];
        // Nếu id là 'true' thì cập nhật 'daChon' và cập nhật tổng tiền trong giỏ hàng
        if (id === true) {
            await ChiTietDonDat.updateMany({ donDatId: cart?._id }, { daChon: true });
            cartDetail = await getUserCartDetail(cart?._id);
            const tongTien = cartDetail.reduce(
                (total, item) => total + item.thanhTien,
                0
            );
            cart = (await DonDat.findByIdAndUpdate(
                cart?._id,
                {
                    tongTien: tongTien,
                },
                {
                    new: true,
                }
            ))!;
        }
        // Nếu id là 'false' thì tổng tiền = 0
        else if (id === false) {
            await ChiTietDonDat.updateMany(
                { donDatId: cart?._id },
                { daChon: false }
            );
            cartDetail = await getUserCartDetail(cart?._id);
            cart = (await DonDat.findByIdAndUpdate(
                cart?._id,
                {
                    tongTien: 0,
                },
                {
                    new: true,
                }
            ))!;
        }
        // Nếu id là id của cartDetail thì cập nhật 'daChon' và cập nhật tổng tiền trong giỏ hàng
        else {
            const cartDetailItem = await ChiTietDonDat.findById(id);
            if (cartDetailItem) {
                cartDetailItem.daChon = !cartDetailItem.daChon;
                await cartDetailItem.save();
            }
            cartDetail = await getUserCartDetail(cart?._id);
            const thanhTien = cartDetailItem?.daChon
                ? cartDetailItem?.thanhTien ?? 0
                : -(cartDetailItem?.thanhTien ?? 0);
            cart = (await DonDat.findByIdAndUpdate(
                cart?._id,
                {
                    tongTien: cart.tongTien + thanhTien,
                },
                {
                    new: true,
                }
            ))!;
        }
        res.status(200).json({
            message: "Chọn sản phẩm trong giỏ hàng thành công!",
            cart,
            cartDetail,
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Lỗi hệ thống máy chủ." });
    }
};

export const updateCart = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { _id, newQuantity } = req.body;

        if (!_id || newQuantity === undefined) {
            return res
                .status(400)
                .json({ message: "Thiếu thông tin sản phẩm hoặc số lượng mới." });
        }

        // Lấy chi tiết đơn hàng
        const cartDetail = await ChiTietDonDatModel.findById(_id).populate<{
            sanPhamId: ISanPham;
        }>("sanPhamId");
        if (!cartDetail) {
            return res
                .status(404)
                .json({ message: "Không tìm thấy sản phẩm trong giỏ hàng." });
        }

        const product = cartDetail.sanPhamId as ISanPham;
        if (!product) {
            return res.status(404).json({ message: "Không tìm thấy sản phẩm." });
        }

        // Kiểm tra số lượng mới có vượt quá 10% số lượng tồn không
        if (newQuantity > product.soLuong * 0.1) {
            return res.status(400).json({
                message: "Số lượng sản phẩm trong giỏ hàng vượt quá số lượng tồn!",
            });
        }

        // Cập nhật số lượng mới và thành tiền
        const newThanhTien =
            (product.giaBan - (product.giaBan * product.khuyenMai) / 100) *
            newQuantity;

        // Cập nhật số lượng và thành tiền trong cartDetail
        cartDetail.soLuong = newQuantity;
        cartDetail.thanhTien = newThanhTien;
        await cartDetail.save();

        // Lấy giỏ hàng của người dùng
        const cart = await DonDat.findById(cartDetail.donDatId);
        if (!cart) {
            return res.status(404).json({ message: "Không tìm thấy giỏ hàng!" });
        }

        // Cập nhật tổng tiền của giỏ hàng
        const cartDetailList = await getUserCartDetail(cart._id);
        const tongTien = cartDetailList.reduce((total, item) => {
            // Cộng dồn thành tiền nếu sản phẩm đã được chọn (daChon = true)
            return item.daChon ? total + item.thanhTien : total;
        }, 0);

        cart.tongTien = tongTien;
        await cart.save();

        // Lấy cartDetail của người dùng sau khi cập nhật
        const newCartDetail = await getUserCartDetail(cart._id);
        res.status(200).json({
            message: "Cập nhật giỏ hàng thành công!",
            cart,
            cartDetail: newCartDetail,
        });
    } catch (error) {
        console.error("Lỗi khi cập nhật sản phẩm:", error);
        return res
            .status(500)
            .json({ message: "Có lỗi xảy ra, vui lòng thử lại." });
    }
};

/**
 * @description Xóa sản phẩm khỏi giỏ hàng
 * @param {AuthenticatedRequest} req - Request từ người dùng
 * @param {Response} res - Response trả về cho người dùng
 * @returns {cart, cartDetail, message}
 */
export const removeProduct = async (
    req: AuthenticatedRequest,
    res: Response
) => {
    try {
        const user = req.user!;
        const { id } = req.params;

        // Lấy giỏ hàng
        const cart = await getUserCart(user._id);
        if (!cart) {
            return res.status(404).json({ message: "Không tìm thấy giỏ hàng!" });
        }

        console.log(id);
        // Tìm chi tiết đơn đặt
        const cartDetail = await ChiTietDonDatModel.findById(id);
        if (!cartDetail) {
            return res
                .status(404)
                .json({ message: "Không tìm thấy sản phẩm trong giỏ hàng!" });
        }

        // Nếu sản phẩm trong giỏ hàng có trường daChon là true, cần cập nhật lại tổng tiền
        if (cartDetail.daChon) {
            // Lấy danh sách chi tiết giỏ hàng của người dùng
            const cartDetailList = await getUserCartDetail(cart._id);

            // Tính lại tổng tiền (chỉ tính những sản phẩm daChon = true)
            const tongTien = cartDetailList.reduce((total, item) => {
                return item.daChon ? total + item.thanhTien : total;
            }, 0);

            // Cập nhật tổng tiền trong giỏ hàng
            cart.tongTien = tongTien;
            await cart.save(); // Lưu giỏ hàng với tổng tiền mới
        }

        // Xoá
        await ChiTietDonDatModel.deleteOne({ _id: id });

        // Cập nhật lại danh sách chi tiết giỏ hàng
        const updatedCartDetail = await getUserCartDetail(cart._id);

        res.status(200).json({
            message: "Sản phẩm đã được xóa khỏi giỏ hàng!",
            cart,
            cartDetail: updatedCartDetail,
        });
    } catch (error) {
        console.error("Lỗi khi xóa sản phẩm:", error);
        res.status(500).json({ message: "Có lỗi xảy ra, vui lòng thử lại." });
    }
};
