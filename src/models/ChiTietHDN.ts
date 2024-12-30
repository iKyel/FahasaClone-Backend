import mongoose, { Schema } from "mongoose";
import { IChiTietHDN } from "../interface/ModelInterface";

const ChiTietHDNSchema: Schema = new Schema({
  hoaDonNhapId: {
    type: Schema.Types.ObjectId,
    ref: "HoaDonNhap",
    required: true,
  },
  sanPhamId: { type: Schema.Types.ObjectId, ref: "SanPham", required: true },
  soLuong: { type: Number, required: true },
  thanhTien: { type: Number, required: true },
});

export default mongoose.model<IChiTietHDN>("ChiTietHDN", ChiTietHDNSchema);
