import mongoose from "mongoose";
import DonDat from "../models/DonDat";
import ChiTietDonDat from "../models/ChiTietDonDat";

export default async function getUserCart(userId: mongoose.Types.ObjectId) {
    // Lấy giỏ hàng của người dùng, nếu không có thì tạo mới
    const cart = await DonDat.findOneAndUpdate(
        {
            khachHangId: userId,
            trangThaiDon: 'Giỏ hàng'
        },
        {
            $setOnInsert: {
                khachHangId: userId
            }
        },
        {
            new: true,
            upsert: true
        }
    );
    return cart;
}

export async function getUserCartDetail(cartId: mongoose.Types.ObjectId) {
    const cartDetail = (await ChiTietDonDat.aggregate()
        .match({ donDatId: cartId })
        .lookup({
            from: 'SanPhams',
            localField: 'sanPhamId',
            foreignField: '_id',
            as: 'sanPham'
        })
        .unwind('$sanPham'))
        .map(item => ({
            _id: item.sanPham._id,
            tenSP: item.sanPham.tenSP,
            giaBan: item.sanPham.giaBan,
            khuyenMai: item.sanPham.khuyenMai,
            soLuongTon: item.sanPham.soLuong,
            imageUrl: item.sanPham.imageUrl,
            soLuong: item.soLuong,
            thanhTien: item.thanhTien
        }))
    return cartDetail;
}