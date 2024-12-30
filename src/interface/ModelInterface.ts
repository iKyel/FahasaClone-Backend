import exp from "constants";
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
  dacTrung_SanPham: string;
}

export interface IYeuThich extends Document {
  taiKhoan: mongoose.Types.ObjectId;
  sanPham: mongoose.Types.ObjectId;
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
}

export interface IDacTrung extends Document {
  ten: string;
}

export interface IDacTrung_DanhMuc extends Document {
  danhMuc: mongoose.Types.ObjectId;
  dacTrung: mongoose.Types.ObjectId;
  giaTri: string;
}

export interface IDacTrung_SanPham extends Document {
  sanPham: mongoose.Types.ObjectId;
  dacTrung: mongoose.Types.ObjectId;
  giaTri: string;
}

export interface IDonDat extends Document {
  taiKhoanId: mongoose.Types.ObjectId;
  thoiGian: Date;
  trangThaiDon:
    | "Chờ xác nhận"
    | "Đã xác nhận"
    | "Đang giao hàng"
    | "Hoàn thành"
    | "Đã hủy";
  ptVanChuyen:
    | "Giao hàng tiết kiệm"
    | "Giao hàng nhanh"
    | "Giao hàng tiêu chuẩn";
  ptThanhToan:
    | "Tiền mặt khi nhận hàng"
    | "ATM / Internet Banking"
    | "Ví Momo"
    | "Ví Zalopay"
    | "VNPay"
    | "Ví ShopeePay"
    | "Visa / Master / JCB";
  ghiChu?: string;
  tongTien: number;
}

export interface IChiTietDonDat extends Document {
  donDatId: mongoose.Types.ObjectId;
  sanPhamId: mongoose.Types.ObjectId;
  soLuong: number;
  thanhTien: number;
}

export interface INhaCungCap extends Document {
  ten: string;
  diaChi: string;
  sdt: string;
  email: string;
  danhMucId: mongoose.Types.ObjectId;
}

export interface IHoaDonNhap extends Document {
  nhaCungCapId: mongoose.Types.ObjectId;
  taiKhoanId: mongoose.Types.ObjectId;
  thoiGian: Date;
  tongTien: number;
}

export interface IChiTietHDN extends Document {
  hoaDonNhapId: mongoose.Types.ObjectId;
  sanPhamId: mongoose.Types.ObjectId;
  soLuong: number;
  thanhTien: number;
}
