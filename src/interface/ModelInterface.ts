import { Document } from "mongodb";
import mongoose from "mongoose";

export interface ITaiKhoan extends Document {
    hoDem: string;
    ten: string;
    userName: string;
    password: string;
    diaChi: string;
    email: string;
    gioiTinh: string;
    ngaySinh: string;
    loaiTK: string;
    sdt: string;
    favorites: mongoose.Types.ObjectId[];
}

export interface ISanPham extends Document {
    tenSP: string;
    giaBan: number;
    giaNhap: number;
    soLuong: number;
    trongLuong: number;
    kichThuoc: {
        dai: number;
        rong: number;
        cao: number;
    };
    khuyenMai: string;
    moTa: string;
    danhMuc: mongoose.Types.ObjectId;
}

export interface IDanhGia extends Document {
    xepHang: number;
    binhLuan: string;
    trangThaiDuyet: "cho_duyet" | "da_duyet" | "tu_choi"; 
    taiKhoan: mongoose.Types.ObjectId;
    product: mongoose.Types.ObjectId;
}

export interface IDanhMuc extends Document {
    ten: string;
    parent: mongoose.Types.ObjectId | null;
    sanPham: mongoose.Types.ObjectId
}