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
        trangThaiDon: {
            type: String,
            enum: [
                "Chờ xác nhận", 
                "Hoàn thành",
                "Đã hủy"
            ],
            default: "Chờ xác nhận",
        },
        ghiChu: {
            type: String,
            default: "",
        },
        tongTien: {
            type: Number,
            default: 0,
        }
    },
    {
        timestamps: true
    }
);

export default mongoose.model<IHoaDonNhap>("HoaDonNhap", HoaDonNhapSchema, "HoaDonNhaps");
