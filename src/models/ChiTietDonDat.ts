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
    giaBan: {
        type: Number,
        default: 0
    },
    khuyenMai : {
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
    daChon: {
        type: Boolean,
        default: false
    }
});

export default mongoose.model<IChiTietDonDat>("ChiTietDonDat", ChiTietDonDatSchema, "ChiTietDonDats");
