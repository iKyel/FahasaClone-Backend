import mongoose, { Schema } from "mongoose";
import { IYeuThich } from "../interface/ModelInterface";

const YeuThichSchema: Schema = new Schema(
  {
    taiKhoan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TaiKhoan",
      required: true,
    },
    SanPham: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SanPham",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IYeuThich>("YeuThich", YeuThichSchema);
