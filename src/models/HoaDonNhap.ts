import mongoose, { Schema, Document } from "mongoose";
import { IHoaDonNhap } from "../interface/ModelInterface";

const HoaDonNhapSchema: Schema = new Schema(
    {
        nhaCungCapId: {
            type: Schema.Types.ObjectId,
            ref: "NhaCungCap",
            required: true,
        },
        nhanVienId: {
            type: Schema.Types.ObjectId,
            ref: "TaiKhoan",
            required: true,
        },
        tongTien: {
            type: Number
        }
    },
    {
        timestamps: true
    }
);

export default mongoose.model<IHoaDonNhap>("HoaDonNhap", HoaDonNhapSchema);
