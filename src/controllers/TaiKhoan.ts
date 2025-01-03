import { Request, Response } from "express";
import TaiKhoan from "../models/TaiKhoan";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { AuthenticatedRequest } from "../interface/AutheticatedRequest";

// Load environment variables from .env file
dotenv.config();

const SECRET_KEY = process.env.JWT_SECRET || "";

/**
 * @description Đăng ký một tài khoản mới
 * @param {Request} req - Request object 
 * @param {Response} res - Response object
 * @returns message
 */
const registerAccount = async (req: Request, res: Response) => {
    try {
        const { hoDem, ten, userName, password, loaiTK } = req.body;
        // Check if userName already exists
        const existingUser = await TaiKhoan.findOne({ userName });
        if (existingUser) {
            res.status(400).json({ message: "UserName đã tồn tại!" });
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
        res.status(200).json({ message: "Đăng ký thành công!" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Lỗi hệ thống máy chủ." });
    }
}

/**
 * @description Đăng nhập vào tài khoản
 * @param {Request} req - Request object 
 * @param {Response} res - Response object
 * @returns message, user
 */
const loginAccount = async (req: Request, res: Response) => {
    const { userName, password } = req.body;
    try {
        // Check userName has existed?
        const user = await TaiKhoan.findOne({ userName });
        if (user) {
            if (password === user.password) {   // Check password
                const token = jwt.sign(
                    {
                        userId: user._id,
                        userName: user.userName
                    },
                    SECRET_KEY,
                    {
                        expiresIn: '1d'
                    }
                );
                res.cookie('token', token, {
                    httpOnly: true,
                    secure: false,
                    maxAge: 24 * 60 * 60 * 1000     // 1 day in milliseconds
                });
                res.status(200).json({
                    message: 'Đăng nhập thành công!',
                    user: {
                        _id: user._id,
                        hoDem: user.hoDem,
                        ten: user.ten,
                        userName: user.userName,
                        loaiTk: user.loaiTK
                    }
                });
                return;
            }
        }
        // userName or password not correct
        res.status(400).json({ message: 'Tên đăng nhập hoặc mật khẩu không đúng!' });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Lỗi hệ thống máy chủ.' });
    }
}

/**
 * @description Cập nhật thông tin cá nhân
 * @param {Request} req - Request object 
 * @param {Response} res - Response object
 * @returns message, user
 */
export const capNhatTaiKhoan = async (req: AuthenticatedRequest, res: Response) => {
    const userName = req.user?.userName;
    try {
        const updatedFields = req.body;
        const updatedUser = await TaiKhoan.findOneAndUpdate(
            { userName },
            { ...updatedFields },
            { new: true }
        );
        res.status(200).json({
            message: 'Cập nhật thông tin thành công!',
            user: {
                ...updatedUser?._doc,
                password: undefined
            }
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Lỗi hệ thống máy chủ.' });
    }
}

export { registerAccount, loginAccount };