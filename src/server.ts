// Package cần thiết
import express from "express";
import cors from "cors";
import { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import multer from "multer";

// db
import connectDB from "./connection/db";

// Routes


dotenv.config(); // Load các biến môi trường từ file .env

// variables
const app = express();
const port = process.env.PORT || 3412;

// sử dụng CORS Middleware
app.use(cors());

// cookie-parser
app.use(cookieParser());

// sử dụng middleware để phân tích dữ liệu JSON
app.use(express.json());

// route

// Ket noi db
connectDB();

// Ket noi server
app.listen(port, () => {
  console.log(`Server dang chay tren cong http://localhost:${port}`);
});
