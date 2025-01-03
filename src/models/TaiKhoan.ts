import mongoose, { Schema, Document } from "mongoose";
import { ITaiKhoan } from "../interface/ModelInterface";

const TaiKhoanSchema: Schema = new Schema(
    {
        hoDem: {
            type: String,
            required: true
        },
        ten: {
            type: String,
            required: true
        },
        userName: {
            type: String,
            required: true,
            unique: true,
        },
        password: {
            type: String,
            required: true
        },
        diaChi: {
            type: Array<String>,
        },
        email: {
            type: String,
        },
        gioiTinh: {
            type: String,
            enum: ["Nam", "Nữ", "Khác"],
        },
        ngaySinh: {
            type: String,
        },
        loaiTK: {
            type: String,
            enum: ["QTV", "NV", "KH"],
            required: true
        },
        trangThai: {
            type: Boolean,
            default: true
        },
        sdt: {
            type: String,
            unique: true
        }
    },
    {
        timestamps: true,
    }
);

export default mongoose.model<ITaiKhoan>("TaiKhoan", TaiKhoanSchema, "TaiKhoans")