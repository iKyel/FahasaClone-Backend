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
                "Chờ xác nhận", 
                "Hoàn thành",
                "Đã hủy"
            ],
            default: "Giỏ hàng",
        },
        ptVanChuyen: {
            type: String,
            enum: [
                "Giao hàng tiết kiệm",
                "Giao hàng nhanh",
                "Giao hàng tiêu chuẩn"
            ],
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
        },
        tongTien: {
            type: Number,
            default: 0
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model<IDonDat>("DonDat", DonDatSchema, "DonDats");
