import { Response } from "express";
import { AuthenticatedRequest } from "../interface/AutheticatedRequest";
import DonDat from "../models/DonDat";
import ChiTietDonDat from "../models/ChiTietDonDat";
import SanPham from "../models/SanPham";
import getUserCart, { getUserCartDetail } from "../utils/getUserCart";
import ChiTietDonDatModel from "../models/ChiTietDonDat";

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
 * @returns message
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
    let cart = await getUserCart(user._id);
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
    await ChiTietDonDat.findByIdAndUpdate(
      cartDetail?._id,
      {
        $setOnInsert: {
          sanPhamId: _id,
          donDatId: cart?._id,
        },
        soLuong: soLuongTrongCart,
        thanhTien: thanhTien,
      },
      {
        upsert: true,
      }
    );
    // Cập nhật tổng tiền của giỏ hàng
    cart = (await DonDat.findByIdAndUpdate(
      cart._id,
      {
        tongTien: cart?.tongTien + thanhTien,
      },
      {
        new: true,
      }
    ))!;
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

export const updateCart = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { _id: sanPhamId, newQuantity } = req.body;

    if (!sanPhamId || newQuantity === undefined) {
      return res
        .status(400)
        .json({ message: "Thiếu thông tin sản phẩm hoặc số lượng mới." });
    }

    // Tìm sản phẩm trong kho để kiểm tra số lượng tồn kho
    const sanPham = await SanPham.findById(sanPhamId);
    if (!sanPham) {
      return res.status(404).json({ message: "Sản phẩm không tồn tại." });
    }

    // Kiểm tra giới hạn 10% số lượng tồn kho
    const maxQuantity = sanPham.soLuong * 0.1;
    if (newQuantity > maxQuantity) {
      return res.status(400).json({
        message: `Số lượng mới vượt quá giới hạn 10% của số lượng tồn kho (${maxQuantity}).`,
      });
    }

    // Tìm và cập nhật sản phẩm trong ChiTietDonDat
    const cartDetail = await ChiTietDonDatModel.findOneAndUpdate(
      { sanPhamId },
      {
        $set: { soLuong: newQuantity, thanhTien: sanPham.giaBan * newQuantity },
      },
      { new: true }
    ).populate("sanPhamId", "tenSP giaBan");

    if (!cartDetail) {
      return res
        .status(404)
        .json({ message: "Sản phẩm không có trong giỏ hàng." });
    }

    // Lấy thông tin chi tiết giỏ hàng
    const cart = await DonDat.findById(cartDetail.donDatId);

    if (!cart) {
      return res.status(404).json({ message: "Giỏ hàng không tồn tại." });
    }

    const updatedCartDetails = await ChiTietDonDatModel.find({
      donDatId: cart._id,
    }).populate("sanPhamId", "tenSP giaBan");

    // Tính tổng tiền mới cho giỏ hàng
    const tongTienMoi = updatedCartDetails.reduce(
      (total, detail) => total + detail.thanhTien,
      0
    );
    cart.tongTien = tongTienMoi;
    await cart.save();

    return res.status(200).json({
      cart,
      cartDetail: await Promise.all(
        updatedCartDetails.map(async (detail) => {
          const sanPham = await SanPham.findById(detail.sanPhamId).select(
            "tenSP giaBan"
          );
          return {
            _id: detail._id,
            giaBan: sanPham?.giaBan || 0,
            tenSP: sanPham?.tenSP || "Không xác định",
            soLuong: detail.soLuong,
            thanhTien: detail.thanhTien,
          };
        })
      ),
      message: "Cập nhật sản phẩm thành công.",
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
export const removeProduct = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const user = req.user!;
        const { id: sanPhamId } = req.params; // ID của sản phẩm cần xóa

        if (!sanPhamId) {
            return res.status(400).json({ message: "Thiếu ID sản phẩm." });
        }

        // Tìm giỏ hàng của người dùng
        const cart = await DonDat.findOne({
            khachHangId: user._id,
            trangThaiDon: "Giỏ hàng",
        });

        if (!cart) {
            return res.status(404).json({ message: "Giỏ hàng không tồn tại." });
        }

        // Tìm sản phẩm trong ChiTietDonDat
        const cartDetail = await ChiTietDonDat.findOne({
            sanPhamId,
            donDatId: cart._id,
        });

        if (!cartDetail) {
            return res.status(404).json({ message: "Sản phẩm không có trong giỏ hàng." });
        }

        // Xóa sản phẩm khỏi ChiTietDonDat
        await ChiTietDonDat.findByIdAndDelete(cartDetail._id);

        // Tính lại tổng tiền trong giỏ hàng
        const updatedCartDetails = await ChiTietDonDat.find({ donDatId: cart._id });
        const newTotal = updatedCartDetails.reduce((total, item) => total + item.thanhTien, 0);

        // Cập nhật tổng tiền của giỏ hàng
        cart.tongTien = newTotal;
        await cart.save();

        // Lấy thông tin chi tiết giỏ hàng mới
        const newCartDetails = await ChiTietDonDat.find({ donDatId: cart._id }).populate(
            "sanPhamId",
            "tenSP giaBan"
        );

        res.status(200).json({
            cart,
            cartDetail: await Promise.all(
                newCartDetails.map(async (detail) => {
                  const sanPham = await SanPham.findById(detail.sanPhamId).select(
                    "tenSP giaBan"
                  );
                  return {
                    _id: detail._id,
                    giaBan: sanPham?.giaBan || 0,
                    tenSP: sanPham?.tenSP || "Không xác định",
                    soLuong: detail.soLuong,
                    thanhTien: detail.thanhTien,
                  };
                })
              ),
            message: "Xóa sản phẩm khỏi giỏ hàng thành công.",
        });
    } catch (error) {
        console.error("Lỗi khi xóa sản phẩm:", error);
        res.status(500).json({ message: "Có lỗi xảy ra, vui lòng thử lại." });
    }
};

