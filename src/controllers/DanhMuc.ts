import { Request, Response } from "express";
import DanhMuc from "../models/DanhMuc";
import mongoose from "mongoose";
import SanPham from "../models/SanPham";

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

export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // get all subcategories recursively
    const getSubcategories = async (parentId: mongoose.Types.ObjectId) => {
      const subcategories = await DanhMuc.find({ parentId });
      let allSubcategories = [...subcategories];
      for (const subcategory of subcategories) {
        const subSubcategories = await getSubcategories(subcategory._id);
        allSubcategories = [...allSubcategories, ...subSubcategories];
      }
      return allSubcategories;
    };

    // Get all subcategories 
    const subcategories = await getSubcategories(new mongoose.Types.ObjectId(id));

    const categoriesToCheck = [id, ...subcategories.map(cat => cat._id)];
    const products = await SanPham.find({ danhMucId: { $in: categoriesToCheck } });

    if (products.length > 0) {
      return res.status(400).json({ message: "Không thể xoá danh mục chứa sản phẩm." });
    }

    // Delete all subcategories
    await DanhMuc.deleteMany({ _id: { $in: subcategories.map(cat => cat._id) } });

    // Delete the main category
    await DanhMuc.findByIdAndDelete(id);

    res.status(200).json({ message: "Xoá danh mục và các adnh mục con thành công" });
  } catch (error) {
    console.error("Error deleting category:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};
