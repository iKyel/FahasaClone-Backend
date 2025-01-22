import mongoose, { Schema } from "mongoose";
import { IChiTietHDN } from "../interface/ModelInterface";

const ChiTietHDNSchema: Schema = new Schema({
    hoaDonNhapId: {
        type: Schema.Types.ObjectId,
        ref: "HoaDonNhap",
        required: true,
    },
    sanPhamId: {
        type: Schema.Types.ObjectId,
        ref: "SanPham",
        required: true
    },
    giaNhap: {
        type: Number,
        default: 0
    },
    soLuong: {
        type: Number,
        required: true
    },
    thanhTien: {
        type: Number,
        default: 0
    },
});

export default mongoose.model<IChiTietHDN>("ChiTietHDN", ChiTietHDNSchema, "ChiTietHDNs");
