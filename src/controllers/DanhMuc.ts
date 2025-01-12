import { Request, Response } from "express";
import DanhMuc from "../models/DanhMuc";
import DacTrung_DanhMuc from "../models/DacTrung_DanhMuc";
import DacTrung from "../models/DacTrung";
import Supplier from "../models/NhaCungCap";

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
    const danhMucs = x.map((danhMuc) => ({
      _id: danhMuc._id,
      ten: danhMuc.ten,
      parentId: danhMuc.parentId ? danhMuc.parentId.toString() : null, // Nếu không có parentId, trả về null
    }));

    res
      .status(200)
      .json({ danhMucs, message: "Lấy danh mục thành công!" });
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
      category: { _id: danhMuc._id, tenDM: danhMuc.ten },
      message: "Lấy thông tin danh mục thành công.",
    });
  } catch (error) {
    res.status(500).json({
      message: "Có lỗi xảy ra khi lấy thông tin danh mục.",
      error,
    });
  }
};

// Controller to add attributes to a category
export const addFeaturesToCategory = async (req: Request, res: Response) => {
  try {
      const { danhMucId, dacTrungs } = req.body; // danhMucId: ID của danh mục, dacTrungs: danh sách đặc trưng

      // Kiểm tra xem danh mục có tồn tại không
      const danhMuc = await DanhMuc.findById(danhMucId);
      if (!danhMuc) {
          return res.status(404).json({ message: "Danh mục không tồn tại." });
      }

      // Duyệt qua danh sách đặc trưng và thêm chúng vào DacTrung_DanhMuc
      for (const dacTrung of dacTrungs) {
          const { dacTrungId, dsGiaTri } = dacTrung;

          // Kiểm tra xem đặc trưng có tồn tại không
          const dacTrungExists = await DacTrung.findById(dacTrungId);
          if (!dacTrungExists) {
              return res.status(400).json({
                  message: `Đặc trưng với ID ${dacTrungId} không tồn tại.`
              });
          }

          // Tìm hoặc tạo mới mối liên kết giữa danh mục và đặc trưng
          await DacTrung_DanhMuc.findOneAndUpdate(
              { danhMucId, dacTrungId },
              { $set: { dsGiaTri } },
              { upsert: true, new: true }
          );
      }

      return res.status(200).json({ message: "Đã thêm các đặc trưng cho danh mục thành công." });
  } catch (error) {
      console.error("Lỗi khi thêm đặc trưng cho danh mục:", error);
      return res.status(500).json({ message: "Đã xảy ra lỗi hệ thống." });
  }
};

export const getFeaturesByCategory = async (req: Request, res: Response) => {
  try {
      const { danhMucId } = req.params; // Lấy `danhMucId` từ URL params

      // Kiểm tra xem danh mục có tồn tại không
      const danhMuc = await DanhMuc.findById(danhMucId);
      if (!danhMuc) {
          return res.status(404).json({ message: "Danh mục không tồn tại" });
      }

      // Lấy tất cả các đặc trưng liên kết với danh mục
      const dacTrungDanhMucs = await DacTrung_DanhMuc.find({ danhMucId })
          .populate("dacTrungId"); // Populate thông tin đặc trưng

      // Tạo danh sách đặc trưng để trả về
      const features = dacTrungDanhMucs.map((dt) => {
          const dacTrung = dt.dacTrungId as any; // Đảm bảo `populate` đã được thực hiện
          return {
              _id: dacTrung._id,
              tenDT: dacTrung.ten, // Tên đặc trưng
              dsGiaTri: dt.dsGiaTri, // Danh sách giá trị
              tenTruyVan: dacTrung.tenTruyVan, // Tên truy vấn
          };
      });

      // Lấy danh sách nhà cung cấp nếu cần
      const suppliers = await Supplier.find({ danhMucId }).select("_id ten"); // Truy vấn nhà cung cấp

      // Trả về dữ liệu
      return res.status(200).json({
          features,
          supplier: suppliers,
          message: "Lấy đặc trưng thành công",
      });
  } catch (error) {
      console.error("Error fetching features by category:", error);
      return res.status(500).json({ message: "Lỗi máy chủ" });
  }
};

