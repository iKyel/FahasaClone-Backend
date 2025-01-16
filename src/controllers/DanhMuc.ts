import { Request, Response } from "express";
import DanhMuc from "../models/DanhMuc";

// Thêm danh mục
export const addCategory = async (req: Request, res: Response) => {
  const { ten, parentId } = req.body;

  try {
    const danhMuc = new DanhMuc({ ten, parentId });
    await danhMuc.save();
    res
      .status(201)
      .json({ message: "Danh mục đã được thêm thành công.", danhMuc });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Có lỗi xảy ra khi thêm danh mục.", error });
  }
};

// Xem tất cả danh mục
export const getCategories = async (req: Request, res: Response) => {
  try {
    // Lấy danh sách danh mục
    const x = await DanhMuc.find().lean(); // Sử dụng `lean()` để nhận kết quả dạng plain object

    // Chuyển đổi dữ liệu để trả về theo yêu cầu
    const categories = x.map((danhMuc) => ({
      _id: danhMuc._id,
      ten: danhMuc.ten,
      parentId: danhMuc.parentId ? danhMuc.parentId.toString() : null, // Nếu không có parentId, trả về null
    }));

    res.status(200).json({ categories, message: "Lấy danh mục thành công!" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Có lỗi xảy ra khi lấy danh sách danh mục.", error });
  }
};

// Lấy tên danh mục theo ID
export const getCategoryName = async (req: Request, res: Response) => {
  const { danhMucId } = req.params;

  try {
    const danhMuc = await DanhMuc.findById(danhMucId).select("_id ten");
    if (!danhMuc) {
      return res.status(404).json({ message: "Không tìm thấy danh mục." });
    }

    res.status(200).json({
      category: { _id: danhMuc._id, ten: danhMuc.ten },
      message: "Lấy thông tin danh mục thành công.",
    });
  } catch (error) {
    res.status(500).json({
      message: "Có lỗi xảy ra khi lấy thông tin danh mục.",
      error,
    });
  }
};
