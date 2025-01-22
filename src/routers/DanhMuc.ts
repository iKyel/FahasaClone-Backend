import express from "express";
import {
  addCategory,
  getCategories,
  getCategoryName,
  deleteCategory,
  editCategoryName,
} from "../controllers/DanhMuc";
import { checkRoleStaff } from "../middlewares/authorizedUser";
import verifyToken from "../middlewares/verifyToken";

const router = express.Router();

/**
 * @route       POST /api/danhMuc/addCategory
 * @desc        Add a new category
 */
router.post("/addCategory", addCategory);

/**
 * @route       GET /api/danhMuc/getCategories
 * @desc        Retrieve a list of all categories
 */
router.get("/getCategories", getCategories);

/**
 * @route       GET /api/danhMuc/getCategoryName/:danhMucId
 * @desc        Retrieve the name of a category by its ID
 */
router.get("/getCategoryName/:danhMucId", getCategoryName);

router.delete(
  "/deleteCategory/:id",
  verifyToken,
  checkRoleStaff,
  deleteCategory
);

router.put(
  "/editCategoryName/:id",
  verifyToken,
  checkRoleStaff,
  editCategoryName
);

export default router;
