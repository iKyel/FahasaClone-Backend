import mongoose, { Schema } from "mongoose";
import { IDacTrung } from "../interface/ModelInterface";

const DacTrungSchema: Schema = new Schema(
  {
    ten: { type: String, require: true },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IDacTrung>("DacTrung", DacTrungSchema);
