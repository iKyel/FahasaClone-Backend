import { Request, Response } from "express";
import NhaCungCap from "../models/NhaCungCap";
import DanhMuc from "../models/DanhMuc";

export const addSupplier = async (req: Request, res: Response) => {
  try {
    const { ten, danhMucId } = req.body;

    // Kiểm tra xem danh mục có tồn tại hay không
    const danhMuc = await DanhMuc.findById(danhMucId);
    if (!danhMuc) {
      return res.status(404).json({ message: "Danh mục không tồn tại." });
    }

    // Tạo mới nhà cung cấp
    const newSupplier = new NhaCungCap({
      ten,
      danhMucId,
    });

    // Lưu nhà cung cấp vào cơ sở dữ liệu
    const savedSupplier = await newSupplier.save();

    return res.status(201).json({
      message: "Thêm nhà cung cấp thành công.",
      supplier: savedSupplier,
    });
  } catch (error) {
    console.error("Error adding supplier:", error);
    return res.status(500).json({ message: "Lỗi khi thêm nhà cung cấp." });
  }
};

export const getSuppliers = async (req: Request, res: Response) => {
  try {
    const suppliers = await NhaCungCap.find(); // Lấy tất cả nhà cung cấp
    res.status(200).json({
        suppliers,
      message: "Lấy danh sách nhà cung cấp thành công.",
    });
  } catch (error) {
    console.error("Lỗi khi lấy nhà cung cấp:", error);
    res.status(500).json({ message: "Có lỗi xảy ra, vui lòng thử lại." });
  }
};
