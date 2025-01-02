import mongoose, { Schema } from "mongoose";
import { IDacTrung_DanhMuc } from "../interface/ModelInterface";

const DacTrung_DanhMucSchema: Schema = new Schema(
    {
        danhMucId: {
            type: Schema.Types.ObjectId,
            ref: "DanhMuc",
            required: true
        },
        dacTrungId: {
            type: Schema.Types.ObjectId,
            ref: "DacTrung",
            required: true
        },
        giaTri: {
            type: String,
            required: true
        },
    }
);

export default mongoose.model<IDacTrung_DanhMuc>("DacTrung_DanhMuc", DacTrung_DanhMucSchema);
