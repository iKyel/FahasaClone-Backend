import { Request, Response } from "express";
import DacTrung from "../models/DacTrung"; 

// Controller để lấy danh sách đặc trưng
export const getDacTrungs = async (req: Request, res: Response) => {
    try {
        const features = await DacTrung.find(); 
        res.status(200).json({
            features,
            message: "Lấy danh sách đặc trưng thành công."
        });
    } catch (error) {
        console.error("Lỗi khi lấy đặc trưng:", error);
        res.status(500).json({ message: "Có lỗi xảy ra, vui lòng thử lại." });
    }
};
