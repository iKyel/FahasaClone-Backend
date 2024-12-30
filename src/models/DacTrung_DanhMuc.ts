import mongoose, { Schema } from "mongoose";
import { IDacTrung_DanhMuc } from "../interface/ModelInterface";

const DacTrung_DanhMucmSchema: Schema = new Schema(
  {
    danhMuc: {type: mongoose.Schema.Types.ObjectId, ref: "DanhMuc", required: true},
    dacTrung: {type: mongoose.Schema.Types.ObjectId, ref: "DacTrung", required: true},
    giaTri: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IDacTrung_DanhMuc>("DacTrung_DanhMuc", DacTrung_DanhMucmSchema);
