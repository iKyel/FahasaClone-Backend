import { Request, Response } from "express";
import TaiKhoan from "../models/TaiKhoan";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import mongoose from "mongoose";

// Load environment variables from .env file
dotenv.config();

const SECRET_KEY = process.env.JWT_SECRET || "";

/**
 * @description Đăng ký một tài khoản mới
 * @param {Request} req - Request object
 * @param {Response} res - Response object
 * @returns message to client
 */
export const register = async (req: Request, res: Response) => {
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
      loaiTK,
    });
    // Save the new account to the database
    await newAccount.save();
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
 * @returns message to client
 */
export const login = async (req: Request, res: Response) => {
  const { userName, password } = req.body;
  try {
    // Check userName has existed?
    const user = await TaiKhoan.findOne({ userName });
    if (user) {
      if (password === user.password) {
        // Check password
        const token = jwt.sign(
          {
            userId: user._id,
            userName: user.userName,
          },
          SECRET_KEY,
          {
            expiresIn: "1d",
          }
        );
        res.cookie("token", token, {
          httpOnly: true,
          secure: false,
          maxAge: 24 * 60 * 60 * 1000, // 1 day in milliseconds
        });
        res.status(200).json({
          message: "Đăng nhập thành công!",
          userData: {
            _id: user._id,
            hoDem: user.hoDem,
            ten: user.ten,
            userName: user.userName,
            loaiTk: user.loaiTK,
          },
        });
        return;
      }
    }

    res
      .status(400)
      .json({ message: "Tên đăng nhập hoặc mật khẩu không đúng!" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Lỗi hệ thống máy chủ." });
  }
};

/**
 * @description Lấy danh sách tài khoản khách hàng
 * @param {Request} req - Request object
 * @param {Response} res - Response object
 * @returns message to client
 */
export const getCustomers = async (req: Request, res: Response) => {
  try {
    const taiKhoanKH = await TaiKhoan.find({ loaiTK: "KH" }).select(
      "-password -loaiTK"
    );

    res.status(200).json({
      user: taiKhoanKH,
      message: "Lấy danh sách tài khoản khách hàng thành công!",
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi hệ thống không xác định",
      error: error,
    });
  }
};

/**
 * @description Lấy danh sách tài khoản nhân viên
 * @param {Request} req - Request object
 * @param {Response} res - Response object
 * @returns message to client
 */
export const getEmployees = async (req: Request, res: Response) => {
  try {
    const taiKhoanNV = await TaiKhoan.find({
      loaiTK: "NV",
      trangThai: true,
    }).select("-password");

    res.status(200).json({
      user: taiKhoanNV,
      message: "Lấy danh sách tài khoản nhân viên thành công!",
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi hệ thống không xác định",
      error: error,
    });
  }
};

/**
 * @description Tìm kiếm tài khoản
 * @param {Request} req - Request object
 * @param {Response} res - Response object
 * @returns message to client
 */
export const search = async (req: Request, res: Response) => {
  try {
    const { searchUser, loaiTK } = req.query;

    const filter: any = {
      loaiTK: loaiTK || { $exists: true }, // Nếu không có `loaiTK`, lấy tất cả
    };

    if (searchUser) {
      filter.$or = [
        { hoDem: { $regex: searchUser, $options: "i" } }, // Tìm theo họ đệm
        { ten: { $regex: searchUser, $options: "i" } }, // Tìm theo tên
        { userName: { $regex: searchUser, $options: "i" } }, // Tìm theo userName
      ];
    }

    const taiKhoan = await TaiKhoan.find(filter).select("-password");

    res.status(200).json({
      user: taiKhoan,
      message: "Tìm kiếm tài khoản thành công!",
    });
  } catch (error) {
    res.status(500).json({
      message: "Đã xảy ra lỗi khi tìm kiếm tài khoản!",
      error: error,
    });
  }
};

/**
 * @description Khoá tài khoản
 * @param {Request} req - Request object
 * @param {Response} res - Response object
 * @returns message to client
 */
export const lock = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        message: "ID người dùng không hợp lệ!",
      });
    }

    // Tìm tài khoản để lấy trạng thái hiện tại
    const taiKhoan = await TaiKhoan.findById(userId);

    if (!taiKhoan) {
      return res.status(404).json({
        message: "Không tìm thấy tài khoản với ID đã cung cấp!",
      });
    }

    // Đảo ngược trạng thái hiện tại
    const trangThaiMoi = !taiKhoan.trangThai;

    // Cập nhật trạng thái mới
    taiKhoan.trangThai = trangThaiMoi;
    await taiKhoan.save();

    res.status(200).json({
      message: `Tài khoản đã được ${
        trangThaiMoi ? "mở khóa" : "khóa"
      } thành công!`,
      data: { userId, trangThai: trangThaiMoi },
    });
  } catch (error) {
    res.status(500).json({
      message: "Đã xảy ra lỗi khi cập nhật trạng thái tài khoản!",
      error: error,
    });
  }
};

