import mongoose, { Schema, Document } from "mongoose";
import { INhaCungCap } from "../interface/ModelInterface";

const NhaCungCapSchema = new Schema<INhaCungCap>({
    ten: {
        type: String,
        required: true
    },
});

export default mongoose.model<INhaCungCap>("NhaCungCap", NhaCungCapSchema, "NhaCungCaps");
