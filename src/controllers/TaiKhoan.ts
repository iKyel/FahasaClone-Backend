import { Request, Response } from "express";
import TaiKhoan from "../models/TaiKhoan"; // Import your TaiKhoan model

/**
 * @description Đăng ký một tài khoản mới
 * @param req 
 * @param res 
 * @returns message
 */
const registerAccount = async (req: Request, res: Response) => {
    try {
        const { hoDem, ten, userName, password, loaiTK } = req.body;

        // Check if userName already exists
        const existingUser = await TaiKhoan.findOne({ userName });
        if (existingUser) {
            res.status(400).json({ message: "UserName already exists" });
            return;
        }
        
        // Create a new account
        const newAccount = new TaiKhoan({
            hoDem,
            ten,
            userName,
            password,
            loaiTK
        });

        // Save the new account to the database
        await newAccount.save();
        res.status(200).json({ message: "Register successfully" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export { registerAccount };