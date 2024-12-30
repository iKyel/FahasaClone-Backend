import mongoose, { Schema, Document } from "mongoose";
import { IHoaDonNhap } from "../interface/ModelInterface";

const HoaDonNhapSchema: Schema = new Schema({
  nhaCungCapId: {
    type: Schema.Types.ObjectId,
    ref: "NhaCungCap",
    required: true,
  },
  thoiGian: { type: Date, default: Date.now },
  tongTien: { type: Number, required: true },
});

export default mongoose.model<IHoaDonNhap>("HoaDonNhap", HoaDonNhapSchema);
