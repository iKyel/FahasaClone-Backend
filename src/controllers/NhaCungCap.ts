import { Request, Response } from "express";
import NhaCungCap from "../models/NhaCungCap";
import DanhMuc from "../models/DanhMuc";
import HoaDonNhap from "../models/HoaDonNhap";

export const addSupplier = async (req: Request, res: Response) => {
  try {
    const { ten } = req.body;

    // Tạo mới nhà cung cấp
    const newSupplier = new NhaCungCap({
      ten
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

export const updateSupplier = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { ten } = req.body as { ten: string };

    // Kiểm tra xem nhà cung cấp có tồn tại hay không
    const supplier = await NhaCungCap.findById(id);
    if (!supplier) {
      return res.status(404).json({ message: "Nhà cung cấp không tồn tại." });
    }

    // Cập nhật thông tin nhà cung cấp
    const newSupplier = await NhaCungCap.findByIdAndUpdate(
        id, 
        { ten },
        { new: true }
    );

    return res.status(200).json({ 
        message: "Cập nhật nhà cung cấp thành công.",
        supplier: newSupplier,
    });
  } catch (error) {
    console.error("Error updating supplier:", error);
    return res.status(500).json({ message: "Lỗi khi cập nhật nhà cung cấp." });
  }
};

export const deleteSupplier = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Kiểm tra xem nhà cung cấp có tồn tại hay không
    const supplier = await NhaCungCap.findById(id);
    if (!supplier) {
      res.status(404).json({ message: "Nhà cung cấp không tồn tại." });
      return;
    }

    // Kiểm tra xem nhà cung cấp có Hóa đơn nhập nào không
    const supplierHasPurchaseInvoice = await HoaDonNhap.findOne({ nhaCungCapId: id });
    if (supplierHasPurchaseInvoice) {
      res.status(400).json({ message: "Nhà cung cấp đã có hóa đơn nhập, không thể xóa." });
      return;
    }

    // Xóa nhà cung cấp
    await NhaCungCap.findByIdAndDelete(id);

    // Lấy danh sách tất cả nhà cung cấp sau khi xóa
    const suppliers = await NhaCungCap.find();

    return res.status(200).json({ 
      message: "Xóa nhà cung cấp thành công.",
      suppliers
    });
  } catch (error) {
    console.error("Error deleting supplier:", error);
    return res.status(500).json({ message: "Lỗi khi xóa nhà cung cấp." });
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

export const getSupplierById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Tìm nhà cung cấp theo ID
    const supplier = await NhaCungCap.findById(id);

    if (!supplier) {
      return res.status(404).json({ message: "Nhà cung cấp không tồn tại." });
    }

    return res.status(200).json({
      supplier,
      message: "Lấy thông tin nhà cung cấp thành công.",
    });
  } catch (error) {
    console.error("Lỗi khi lấy thông tin nhà cung cấp:", error);
    return res.status(500).json({ message: "Lỗi khi lấy thông tin nhà cung cấp." });
  }
};



