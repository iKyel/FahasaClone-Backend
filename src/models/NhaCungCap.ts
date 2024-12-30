import mongoose, { Schema, Document } from "mongoose";
import { INhaCungCap } from "../interface/ModelInterface";

const NhaCungCapSchema = new Schema<INhaCungCap>({
  ten: { type: String, required: true },
  diaChi: { type: String, required: true },
  sdt: { type: String, required: true },
  email: { type: String, required: true },
  danhMucId: { type: Schema.Types.ObjectId, ref: "DanhMuc" },
});

export default mongoose.model<INhaCungCap>("NhaCungCap", NhaCungCapSchema);
