// Package cần thiết
import express from "express";
import cors from "cors";
import { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import morgan from "morgan";

// db
import connectDB from "./connection/db";

// Routes
import taiKhoanRouter from "./routers/TaiKhoan";
import categoryRouter from "./routers/DanhMuc";
import sanPhamRouter from "./routers/SanPham";
import donDatRouter from "./routers/DonDat";
import nhaCungCapRouter from "./routers/NhaCungCap";
import dacTrungRouter from "./routers/DacTrung";
import hoaDonNhapRouter from "./routers/HoaDonNhap";
import thanhToanRouter from "./routers/ThanhToan";


dotenv.config(); // Load các biến môi trường từ file .env

// variables
const app = express();
const port = process.env.PORT || 3412;

// Using middleware
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:8000'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));    // sử dụng CORS Middleware
app.use(morgan('dev'));     // HTTP request logger
app.use(cookieParser());    // cookie-parser
app.use(express.json());    // phân tích dữ liệu JSON

// route
app.use('/api/account', taiKhoanRouter);
app.use('/api/category', categoryRouter);
app.use('/api/product', sanPhamRouter);
app.use('/api/order', donDatRouter);
app.use('/api/supplier', nhaCungCapRouter);
app.use('/api/feature', dacTrungRouter);
app.use('/api/purchaseInvoice', hoaDonNhapRouter);
app.use('/api/payment', thanhToanRouter)

app.get('/', (req: Request, res: Response) => {
    res.status(200).json("Hello world");
})

// Ket noi db
connectDB();

// Ket noi server
app.listen(port, () => {
    console.log(`Server dang chay tren cong http://localhost:${port}`);
});

export default app;
