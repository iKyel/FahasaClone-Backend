import { Request, Response } from "express";
import TaiKhoan from "../models/TaiKhoan";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { AuthenticatedRequest } from "../interface/AutheticatedRequest";
import bcrypt from "bcrypt";

// Load environment variables from .env file
dotenv.config();

const SECRET_KEY = process.env.JWT_SECRET || "";

/**
 * @description Đăng ký một tài khoản mới
 * @param {Request} req - Request object
 * @param {Response} res - Response object
 * @returns message
 */
export const dangKiTaiKhoan = async (req: Request, res: Response) => {
    try {
        const { hoDem, ten, userName, password, loaiTK } = req.body;
        // Ktra userName đã tồn tại chưa?
        const existingUser = await TaiKhoan.findOne({ userName });
        if (existingUser) {
            res.status(400).json({ message: "UserName đã tồn tại!" });
            return;
        }
        // Mã hóa mật khẩu
        const hashedPassword = await bcrypt.hash(password, 10);
        // Tao tài khoản mới
        await TaiKhoan.create({
            hoDem,
            ten,
            userName,
            password: hashedPassword,
            loaiTK
        });
        res.status(200).json({ message: "Đăng ký thành công!" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Lỗi hệ thống máy chủ." });
    }
};

/**
 * @description Đăng nhập vào tài khoản
 * @param {Request} req - Request object
 * @param {Response} res - Response object
 * @returns message, user
 */
export const dangNhapTaiKhoan = async (req: Request, res: Response) => {
    const { userName, password } = req.body;
    try {
        // Ktra userName có tồn tại không?
        const user = await TaiKhoan.findOne({ userName });
        if (user) {
            // Ktra password có khớp không?
            const isMatch = await bcrypt.compare(password, user.password);
            if (isMatch) {
                // Nếu khớp, tạo token và gửi về client qua cookie
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
        // UserName hoặc password ko đúng
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

/**
 * @description Thêm địa chỉ của tài khoản
 * @param {Request} req - Request object 
 * @param {Response} res - Response object
 * @returns message, user
 */
export const createAddress = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { userName } = req.user!;
        const { newAddress } = req.body;
        const updatedUser = await TaiKhoan.findOneAndUpdate(
            { userName },
            {
                $push: {
                    diaChi: newAddress
                }
            },
            { new: true }
        );
        res.status(200).json({
            message: 'Thêm địa chỉ thành công!',
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

/**
 * @description Xóa địa chỉ của tài khoản
 * @param {Request} req - Request object 
 * @param {Response} res - Response object
 * @returns message, diaChi[]
 */
export const deleteAddress = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const addressIdx = req.params.idx;
        const { userName } = req.user!;
        const user = await TaiKhoan.findOne({ userName });
        if (!user) {
            res.status(400).json({ message: 'Tài khoản không tồn tại!' });
            return;
        }
        const addresses = user.diaChi;
        const updatedAddresses = addresses.filter((_, idx) => idx !== +addressIdx);
        user.diaChi = updatedAddresses;
        await user.save();
        res.status(200).json({
            message: 'Cập nhật địa chỉ thành công!',
            diaChi: user?.diaChi
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Lỗi hệ thống máy chủ.' });
    }
}

/**
 * @description Đặt làm địa chỉ mặc định
 * @param {Request} req - Request object 
 * @param {Response} res - Response object
 * @returns message, diaChi[]
 */
export const setDefaultAddress = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const addressIdx = req.body.idx;
        const { userName } = req.user!;
        const user = await TaiKhoan.findOne({ userName });
        if (!user) {
            res.status(400).json({ message: 'Tài khoản không tồn tại!' });
            return;
        }
        const addresses = user.diaChi;
        // Lấy địa chỉ được chọn và đặt lên đầu mảng (vị trí mặc định)
        const [selectedAddress] = addresses.splice(addressIdx, 1);
        addresses.unshift(selectedAddress);
        // Lưu vào csdl
        user.diaChi = addresses;
        await user.save();
        res.status(200).json({
            message: 'Đặt địa chỉ mặc định thành công!',
            diaChi: user?.diaChi
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Lỗi hệ thống máy chủ.' });
    }
}

/**
 * @description Đổi mật khẩu tài khoản
 * @param {Request} req - Request object
 * @param {Response} res - Response object
 * @returns message
 */
export const changePassword = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { oldPassword, newPassword } = req.body;
        const { userName } = req.user!;
        const user = await TaiKhoan.findOne({ userName });
        if (!user) {
            res.status(400).json({ message: 'Tài khoản không tồn tại!' });
            return;
        }
        // Ktra mật khẩu cũ có khớp không?
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            res.status(400).json({ message: 'Mật khẩu cũ không đúng!' });
            return;
        }
        // Mã hóa mật khẩu mới
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();
        res.status(200).json({ message: 'Đổi mật khẩu thành công!' });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Lỗi hệ thống máy chủ.' });
    }
}