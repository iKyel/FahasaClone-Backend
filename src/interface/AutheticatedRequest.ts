import { Request } from "express";
import mongoose from "mongoose";

export interface AuthenticatedRequest extends Request {
    user?: {
        _id: mongoose.Types.ObjectId,
        hoDem: string,
        ten: string,
        userName: string,
        loaiTK: string,
    };
}
