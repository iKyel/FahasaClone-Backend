import { Response } from "express";
import { AuthenticatedRequest } from "../interface/AutheticatedRequest";
import DonDat from "../models/DonDat";
import ChiTietDonDat from "../models/ChiTietDonDat";
import SanPham from "../models/SanPham";
import getUserCart, { getUserCartDetail } from "../utils/getUserCart";
import ChiTietDonDatModel from "../models/ChiTietDonDat";
import { ISanPham } from "../interface/ModelInterface";
import { Auth } from "mongodb";

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
    // Kiểm tra số lượng trong giỏ + số lượng mới có vượt quá số lượng tồn không
    if (soLuongTrongCart > product.soLuong) {
      res.status(400).json({
        message: "Số lượng sản phẩm trong giỏ hàng vượt quá số lượng tồn!",
      });
      return;
    }
    // Không thì cập nhật số lượng và thành tiền. Nếu chưa có thì thêm mới
    const thanhTien = Math.round(
      (product.giaBan - (product.giaBan * product.khuyenMai) / 100) *
        soLuongTrongCart
    );
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

    // Kiểm tra số lượng mới có vượt quá số lượng tồn không
    if (newQuantity > product.soLuong) {
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
    cartDetail.thanhTien = Math.round(newThanhTien);
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

    cart.tongTien = Math.round(tongTien);
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

    // Xoá
    await ChiTietDonDatModel.deleteOne({ _id: id });

    // Nếu sản phẩm trong giỏ hàng có trường daChon là true, cần cập nhật lại tổng tiền
    if (cartDetail.daChon) {
      // Lấy danh sách chi tiết giỏ hàng của người dùng
      const cartDetailList = await getUserCartDetail(cart._id);

      // Tính lại tổng tiền (chỉ tính những sản phẩm daChon = true)
      const tongTien = cartDetailList.reduce((total, item) => {
        return item.daChon ? total + item.thanhTien : total;
      }, 0);

      // Cập nhật tổng tiền trong giỏ hàng
      cart.tongTien = Math.round(tongTien);
      await cart.save(); // Lưu giỏ hàng với tổng tiền mới
    }

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

export const getSelectedProductsInCart = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const user = req.user!;
    const cart = await DonDat.findOne({
      khachHangId: user._id,
      trangThaiDon: "Giỏ hàng",
    });

    if (!cart) {
      return res.status(404).json({ message: "Không có sản phẩm được chọn!" });
    }

    const cartDetail = await ChiTietDonDat.find({
      donDatId: cart._id,
      daChon: true,
    }).populate("sanPhamId");

    const formattedCartDetail = cartDetail.map((item) => {
      const product = item.sanPhamId as unknown as typeof SanPham & {
        _id: string;
        tenSP: string;
        giaBan: number;
        khuyenMai: number;
        imageUrl: string;
      };

      return {
        _id: item._id,
        sanPhamId: product._id,
        tenSP: product.tenSP,
        giaBan: product.giaBan,
        khuyenMai: product.khuyenMai,
        imageUrl: product.imageUrl,
        soLuong: item.soLuong,
        thanhTien: item.thanhTien,
        daChon: item.daChon,
      };
    });

    res.status(200).json({
      cartDetail: formattedCartDetail,
      tongTien: cart.tongTien,
      message: "Lấy thông tin sản phẩm đã chọn trong giỏ hàng thành công!",
    });
  } catch (error) {
    console.error("Lỗi khi lấy danh sách sản phẩm đã chọn:", error);
    res.status(500).json({ message: "Có lỗi xảy ra, vui lòng thử lại." });
  }
};

// ---------------------------------------------------------- //

/*
Bước thanh toán (chờ xác nhận)
*/

export const createPaymentOrder = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { diaChi, ptVanChuyen, ptThanhToan, ghiChu } = req.body;
    const khachHangId = req.user?._id;

    if (!diaChi) {
      return res.status(400).json({ message: "Địa chỉ đặt hàng là bắt buộc" });
    }

    // Lấy các sản phẩm đã chọn trong giỏ hàng
    const currentCart = await DonDat.findOne({
      khachHangId,
      trangThaiDon: "Giỏ hàng",
    });

    if (!currentCart) {
      return res.status(404).json({ message: "Giỏ hàng không tồn tại." });
    }

    const selectedItems = await ChiTietDonDat.find({
      donDatId: currentCart._id,
      daChon: true,
    });

    if (selectedItems.length === 0) {
      return res
        .status(400)
        .json({ message: "Không có sản phẩm nào được chọn để thanh toán." });
    }

    // Tính tổng tiền
    const tongTien = selectedItems.reduce(
      (sum, item) => sum + item.thanhTien,
      0
    );

    // Tạo đơn đặt hàng mới
    const donDatMoi = new DonDat({
      khachHangId,
      diaChiDatHang: diaChi,
      ptVanChuyen,
      ptThanhToan,
      ghiChu,
      trangThaiDon: "Chờ xác nhận",
      tongTien,
    });

    const savedOrder = await donDatMoi.save();

    // Cập nhật các sản phẩm vào đơn đặt hàng mới
    await Promise.all(
      selectedItems.map((item) =>
        ChiTietDonDat.findByIdAndUpdate(item._id, {
          donDatId: savedOrder._id,
        })
      )
    );

    // Xóa các sản phẩm đã chọn trong giỏ hàng cũ
    await ChiTietDonDat.deleteMany({
      donDatId: currentCart._id,
      daChon: true,
    });

    // Populate thông tin sản phẩm
    const populatedOrder = await DonDat.findById(savedOrder._id).populate({
      path: "khachHangId",
      select: "ten email",
    });

    const orderDetails = await ChiTietDonDat.find({
      donDatId: savedOrder._id,
    }).populate("sanPhamId", "tenSP giaBan khuyenMai imageUrl");

    res.status(201).json({
      message: "Tạo đơn đặt hàng thành công",
      order: populatedOrder,
      orderDetails,
    });
  } catch (error) {
    console.error("Lỗi khi tạo đơn đặt hàng:", error);
    return res
      .status(500)
      .json({ message: "Có lỗi xảy ra, vui lòng thử lại sau" });
  }
};


/**
 * @description Cập nhật trạng thái đơn đặt hàng từ "Chờ xác nhận" sang "Hoàn thành"
 * @param {Request} req - Request chứa id của đơn đặt hàng trong params
 * @param {Response} res - Response trả về danh sách đơn đặt hàng và số lượng
 */

export const completeOrder = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { id } = req.params;

    // Tìm đơn đặt hàng theo ID
    const order = await DonDat.findById(id);
    if (!order) {
      return res.status(404).json({ message: "Không tìm thấy đơn đặt hàng." });
    }

    // Kiểm tra trạng thái đơn đặt hàng hiện tại
    if (order.trangThaiDon !== "Chờ xác nhận") {
      return res
        .status(400)
        .json({ message: "Trạng thái đơn đặt hàng không hợp lệ để cập nhật." });
    }

    // Cập nhật trạng thái thành "Hoàn thành"
    order.trangThaiDon = "Hoàn thành";
    await order.save();

    // Lấy danh sách tất cả đơn đặt hàng và tổng số lượng
    const allOrders = await DonDat.find();
    const totalOrders = allOrders.length;

    // Trả về response
    return res.status(200).json({
      message: "Cập nhật trạng thái đơn đặt hàng thành công.",
      saleInvoices: { orders: allOrders, totalOrders },
    });
  } catch (error) {
    console.error("Lỗi khi cập nhật trạng thái đơn đặt hàng:", error);
    return res.status(500).json({ message: "Lỗi hệ thống máy chủ." });
  }
};

/**
 * @description Hủy đơn đặt hàng
 * @param {AuthenticatedRequest} req - Request của người dùng
 * @param {Response} res - Response trả về cho người dùng
 * @returns saleInvoices, message
 */
export const cancelOrder = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    const order = await DonDat.findById(id);
    if (!order) {
      return res.status(404).json({ message: "Không tìm thấy đơn đặt hàng!" });
    }

    // Kiểm tra trạng thái của đơn đặt hàng
    if (order.trangThaiDon !== "Chờ xác nhận") {
      return res.status(400).json({
        message: "Chỉ có thể hủy đơn đặt hàng ở trạng thái 'Chờ xác nhận'.",
      });
    }

    // Cập nhật trạng thái đơn đặt hàng thành 'Đã hủy'
    order.trangThaiDon = "Đã hủy";
    await order.save();

    // Lấy danh sách tất cả các đơn đặt hàng để trả về
    const saleInvoices = await DonDat.find();
    const totalOrders = saleInvoices.length;

    res.status(200).json({
      saleInvoices,
      soLuong: totalOrders,
      message: "Hủy đơn đặt hàng thành công!",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi hệ thống máy chủ." });
  }
};

/**
 * @description Xem danh sách đơn đặt hàng của khách hàng (không phải giỏ hàng)
 * @param {AuthenticatedRequest} req - Request của người dùng
 * @param {Response} res - Response trả về cho người dùng
 * @returns saleInvoices, message
 */
export const customerGetSaleInvokes = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const userId = req.user?._id;

    // Lấy tất cả đơn đặt hàng của khách hàng sắp xếp theo createdAt
    const saleInvoices = await DonDat.find({
      khachHangId: userId,
      trangThaiDon: { $ne: "Giỏ hàng" },
    }).sort({ createdAt: -1 }); // Sắp xếp giảm dần theo createdAt

    const totalOrders = saleInvoices.length;

    res.status(200).json({
      saleInvoices,
      soLuong: totalOrders,
      message: "Lấy danh sách đơn đặt hàng thành công!",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi hệ thống máy chủ." });
  }
};

/**
 * @description Xem danh sách tất cả đơn đặt (không phải giỏ hàng) cho nhân viên
 * @param {AuthenticatedRequest} req - Request của nhân viên
 * @param {Response} res - Response trả về cho nhân viên
 * @returns saleInvoices, message
 */
export const staffGetSaleInvokes = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    // Lấy tất cả đơn đặt (không phải giỏ hàng) từ database
    const saleInvoices = await DonDat.find({
      trangThaiDon: { $ne: "Giỏ hàng" },
    }).sort({ createdAt: -1 }); // Sắp xếp theo ngày tạo giảm dần

    const totalOrders = saleInvoices.length;

    res.status(200).json({
      saleInvoices,
      soLuong: totalOrders,
      message: "Lấy danh sách tất cả đơn đặt thành công!",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi hệ thống máy chủ." });
  }
};

/**
 * @description Xem chi tiết hóa đơn đặt hàng
 * @param {Request} req - Request chứa id của đơn đặt
 * @param {Response} res - Response trả về chi tiết hóa đơn
 * @returns saleInvoice, detailSaleInvoices, message
 */
export const getSaleInvoiceDetail = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { id } = req.params;

    // Tìm đơn đặt hàng với id tương ứng
    const saleInvoice = await DonDat.findById(id);

    if (!saleInvoice) {
      return res.status(404).json({ message: "Đơn đặt hàng không tồn tại" });
    }

    // Tìm chi tiết đơn đặt hàng theo donDatId
    const detailSaleInvoices = await ChiTietDonDat.find({ donDatId: id })
      .populate<{ sanPhamId: ISanPham }>("sanPhamId", "tenSP giaBan imageUrl")
      .exec();

    // Trả về thông tin hóa đơn và chi tiết hóa đơn
    return res.json({
      saleInvoice,
      detailSaleInvoices: detailSaleInvoices.map((detail) => ({
        _id: detail._id,
        soLuong: detail.soLuong,
        thanhTien: detail.thanhTien,
        sanPhamId: detail.sanPhamId._id,
        tenSP: detail.sanPhamId.tenSP,
        giaBan: detail.sanPhamId.giaBan,
        imageUrl: detail.sanPhamId.imageUrl,
      })),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi hệ thống máy chủ." });
  }
};

export const findSaleInvokes = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { id } = req.params;

    const saleInvoices = await DonDat.find({
      $or: [
        { khachHangId: id }, // Tìm theo khachHangId
        { _id: id }, // Tìm theo DonDatId (hoaDonBanId)
      ],
    }).exec();

    // Nếu không có hóa đơn nào tìm thấy
    if (!saleInvoices || saleInvoices.length === 0) {
      return res.status(404).json({ message: "Không tìm thấy hóa đơn nào" });
    }

    // Tìm chi tiết đơn hàng từ ChiTietDonDat và populate thông tin sản phẩm
    const result = [];

    for (const saleInvoice of saleInvoices) {
      const details = await ChiTietDonDat.find({ donDatId: id })
        .populate<{ sanPhamId: ISanPham }>("sanPhamId", "tenSP giaBan imageUrl") // Populating thông tin sản phẩm từ bảng SanPham
        .exec();

      const detailSaleInvoices = details.map((detail) => ({
        sanPhamId: detail.sanPhamId._id,
        tenSP: detail.sanPhamId.tenSP,
        soLuong: detail.soLuong,
        giaBan: detail.sanPhamId.giaBan,
        thanhTien: detail.thanhTien,
        imageUrl: detail.sanPhamId.imageUrl,
      }));

      result.push({
        ...saleInvoice.toObject(),
        detailSaleInvoices,
      });
    }

    return res.json({ saleInvoices: result, message: "Tìm kiếm thành công" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Có lỗi xảy ra, vui lòng thử lại" });
  }
};
