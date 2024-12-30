import mongoose, { Schema, Document } from "mongoose";
import { IDanhMuc } from "../interface/ModelInterface";

const DanhMucSchema: Schema = new Schema({
  ten: { type: String, required: true },
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "DanhMuc",
    default: null,
  },
  
});

export default mongoose.model<IDanhMuc>("DanhMuc", DanhMucSchema);
