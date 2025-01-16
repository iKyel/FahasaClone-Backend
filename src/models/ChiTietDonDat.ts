import mongoose, { Schema, Document } from "mongoose";
import { IChiTietDonDat } from "../interface/ModelInterface";

const ChiTietDonDatSchema: Schema = new Schema({
    donDatId: {
        type: Schema.Types.ObjectId,
        ref: "DonDat",
        required: true
    },
    sanPhamId: {
        type: Schema.Types.ObjectId,
        ref: "SanPham",
        required: true
    },
    soLuong: {
        type: Number,
        required: true
    },
    thanhTien: {
        type: Number,
        required: true
    },
    daChon: {
        type: Boolean,
        default: false
    }
});

export default mongoose.model<IChiTietDonDat>("ChiTietDonDat", ChiTietDonDatSchema, "ChiTietDonDats");
