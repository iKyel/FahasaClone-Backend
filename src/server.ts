// Package cần thiết
import express from "express";
import cors from "cors";
import { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import multer from "multer";

// db
import connectDB from "./connection/db";

// Routes


dotenv.config(); // Load các biến môi trường từ file .env

// variables
const app = express();
const port = process.env.PORT || 3412;

// Using middleware
app.use(cors());    // sử dụng CORS Middleware
app.use(morgan('dev'));     // HTTP request logger
app.use(cookieParser());    // cookie-parser
app.use(express.json());    // phân tích dữ liệu JSON

// route
app.get('/', (req: Request, res: Response) => {
    res.status(200).json("Hello world");
})

// Ket noi db
connectDB();

// Ket noi server
app.listen(port, () => {
    console.log(`Server dang chay tren cong http://localhost:${port}`);
});
