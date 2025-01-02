import mongoose, { Schema } from "mongoose";
import { IDacTrung_DanhMuc, IDacTrung_SanPham } from "../interface/ModelInterface";

const DacTrung_SanPhamSchema: Schema = new Schema(
    {
        sanPhamId: {
            type: Schema.Types.ObjectId,
            ref: "SanPham",
            required: true
        },
        dacTrungId: {
            type: Schema.Types.ObjectId,
            ref: "DacTrung",
            required: true
        },
        giaTri: {
            type: String,
            required: true
        },
    }
);

export default mongoose.model<IDacTrung_SanPham>("DacTrung_SanPham", DacTrung_SanPhamSchema);
