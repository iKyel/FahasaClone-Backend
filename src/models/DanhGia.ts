import mongoose, { Schema, Document } from "mongoose";
import { IDanhGia } from "../interface/ModelInterface";

const DanhGiaSchema: Schema = new Schema(
    {
        taiKhoanId: {
            type: Schema.Types.ObjectId,
            ref: "TaiKhoan",
            required: true,
        },
        sanPhamId: {
            type: Schema.Types.ObjectId,
            ref: "SanPham",
            required: true,
        },
        xepHang: {
            type: Number,
            required: true,
            min: 1,
            max: 5
        },
        binhLuan: {
            type: String
        },
        trangThaiDuyet: {
            type: String,
            enum: ["cho_duyet", "da_duyet", "tu_choi"],
            default: "cho_duyet",
            required: true
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model<IDanhGia>("DanhGia", DanhGiaSchema, "DanhGias");
