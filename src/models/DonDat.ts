import mongoose, { Schema } from "mongoose";
import { IDonDat } from "../interface/ModelInterface";

const DonDatSchema: Schema = new Schema(
  {
    taiKhoanId: {
      type: Schema.Types.ObjectId,
      ref: "TaiKhoan",
      required: true,
    },
    thoiGian: { type: Date, default: Date.now },
    trangThaiDon: {
      type: String,
      enum: [
        "Chờ xác nhận",
        "Đã xác nhận",
        "Đã giao hàng",
        "Hoàn thành",
        "Đã huỷ",
      ],
    },
    ptVanChuyen: {
      type: String,
      enum: ["Giao hàng tiết kiệm", " Giao hàng nhanh", "Giao hàng tiêu chuẩn"],
      default: "Giao hàng tiêu chuẩn",
    },
    ptThanhToan: {
      type: String,
      enum: [
        "Tiền mặt khi nhận hàng",
        "ATM / Internet Banking",
        "Ví Momo",
        "Ví Zalopay",
        "VNPay",
        "Ví ShopeePay",
        "Visa / Master / JCB",
      ],
      default: "Tiền mặt khi nhận hàng",
    },
    ghiChu: {
      type: String,
      required: false,
    },
    tongTien: {
      type: Number,
      require: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IDonDat>("DonDat", DonDatSchema);
