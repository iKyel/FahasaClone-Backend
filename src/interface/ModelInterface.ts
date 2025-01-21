import exp from "constants";
import { Document } from "mongodb";
import mongoose, { Date } from "mongoose";

export interface ITaiKhoan extends Document {
  hoDem: string;
  ten: string;
  userName: string;
  password: string;
  diaChi: Array<string>;
  email: string;
  gioiTinh: "Nam" | "Nữ" | "Khác";
  ngaySinh: string;
  loaiTK: "QTV" | "NV" | "KH";
  trangThai: boolean;
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
  khuyenMai: number;
  moTa: string;
  danhMucId: mongoose.Types.ObjectId;
  imageUrl: string;
  createdAt: Date;
}

export interface IYeuThich extends Document {
  taiKhoanId: mongoose.Types.ObjectId;
  sanPhamId: mongoose.Types.ObjectId;
}

export interface IDanhGia extends Document {
  taiKhoanId: mongoose.Types.ObjectId;
  sanPhamId: mongoose.Types.ObjectId;
  xepHang: number;
  binhLuan: string;
  trangThaiDuyet: "cho_duyet" | "da_duyet" | "tu_choi";
  createdAt: Date;
}

export interface IDanhMuc extends Document {
  ten: string;
  parentId: mongoose.Types.ObjectId | null;
}

export interface IDacTrung extends Document {
  ten: string;
  truongLoc: boolean;
  tenTruyVan: string;
}

export interface IDacTrung_SanPham extends Document {
  sanPhamId: mongoose.Types.ObjectId;
  dacTrungId: mongoose.Types.ObjectId;
  giaTri: string;
}

export interface IDonDat extends Document {
  nhanVienId?: mongoose.Types.ObjectId;
  khachHangId: mongoose.Types.ObjectId;
  trangThaiDon:
    | "Giỏ hàng"
    | "Chờ xác nhận"
    | "Hoàn thành"
    | "Đã hủy";
  ptVanChuyen:
    | "Giao hàng tiết kiệm"
    | "Giao hàng hỏa tốc"
    | "Giao hàng tiêu chuẩn";
  ptThanhToan:
    | "COD"
    | "PayPal"
    | "ATM / Internet Banking"
    | "Ví Momo"
    | "Ví Zalopay"
    | "VNPay"
    | "Ví ShopeePay"
    | "Visa / Master / JCB";
  ghiChu?: string;
  tongTien: number;
  createdAt: Date;
  diaChiDatHang: string;
}

export interface IChiTietDonDat extends Document {
  donDatId: mongoose.Types.ObjectId;
  sanPhamId: mongoose.Types.ObjectId;
  soLuong: number;
  thanhTien: number;
  daChon: boolean;
}

export interface INhaCungCap extends Document {
  ten: string;
}

export interface IHoaDonNhap extends Document {
  nhaCungCapId: mongoose.Types.ObjectId;
  nhanVienId: mongoose.Types.ObjectId;
  trangThaiDon: 
    | "Chờ xác nhận" 
    | "Hoàn thành" 
    | "Đã hủy";
  ghiChu: string;
  tongTien: number;
  createdAt: Date;
}

export interface IChiTietHDN extends Document {
  hoaDonNhapId: mongoose.Types.ObjectId;
  sanPhamId: mongoose.Types.ObjectId;
  soLuong: number;
  thanhTien: number;
}
