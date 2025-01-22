import mongoose, { Schema } from "mongoose";
import { IDonDat } from "../interface/ModelInterface";

const DonDatSchema: Schema = new Schema(
    {
        nhanVienId: {
            type: Schema.Types.ObjectId,
            ref: "TaiKhoan",
        },
        khachHangId: {
            type: Schema.Types.ObjectId,
            ref: "TaiKhoan",
            required: true,
        },
        trangThaiDon: {
            type: String,
            enum: [
                "Giỏ hàng",
                "Chờ xác nhận",
                "Đã xác nhận",
                "Hoàn thành",
                "Đã hủy",
            ],
            default: "Giỏ hàng",
        },
        ptVanChuyen: {
            type: String,
            enum: [
                "Giao hàng tiết kiệm",
                "Giao hàng hỏa tốc",
                "Giao hàng tiêu chuẩn"
            ],
            default: "Giao hàng tiêu chuẩn",
        },
        ptThanhToan: {
            type: String,
            enum: [
                "COD",
                "PayPal",
                "ATM / Internet Banking",
                "Ví Momo",
                "Ví Zalopay",
                "VNPay",
                "Ví ShopeePay",
                "Visa / Master / JCB",
            ],
            default: "COD",
        },
        ghiChu: {
            type: String,
        },
        tongTien: {
            type: Number,
            default: 0
        },
        diaChiDatHang: {
            type: String
        }
    },
    {
        timestamps: true,
    }
);

export default mongoose.model<IDonDat>("DonDat", DonDatSchema, "DonDats");
