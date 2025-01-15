import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../interface/AutheticatedRequest";

/**
 * @description Middleware để kiểm tra quyền truy cập vào chức năng Nhân Viên của người dùng
 * @param {AuthenticatedRequest} req - Request của người dùng 
 * @param {Response} res - Response trả về cho người dùng 
 * @param {NextFunction} next - Hàm callback để chuyển tiếp request sang middleware tiếp theo 
 * @returns message
 */
export async function checkRoleStaff(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
        const user = req.user;
        if (!user) {
            res.status(401).json({ message: 'Người dùng chưa đăng nhập!' });
            return;
        }
        const role = user.loaiTK;
        if (role === 'NV' || role === 'QTV') {
            next();
        } else {
            res.status(403).json({ message: 'Không có quyền truy cập!' });
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Lỗi hệ thống máy chủ.' });
    }
}

/**
 * @description Middleware để kiểm tra quyền truy cập vào chức năng Admin của người dùng
 * @param {AuthenticatedRequest} req - Request của người dùng 
 * @param {Response} res - Response trả về cho người dùng 
 * @param {NextFunction} next - Hàm callback để chuyển tiếp request sang middleware tiếp theo 
 * @returns message
 */
export async function checkRoleAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
        const user = req.user;
        if (!user) {
            res.status(401).json({ message: 'Người dùng chưa đăng nhập!' });
            return;
        }
        const role = user.loaiTK;
        if (role === 'QTV') {
            next();
        } else {
            res.status(403).json({ message: 'Không có quyền truy cập!' });
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Lỗi hệ thống máy chủ.' });
    }
}

/**
 * @description Middleware để kiểm tra quyền truy cập vào chức năng Khách hàng của người dùng
 * @param {AuthenticatedRequest} req - Request của người dùng
 * @param {Response} res - Response trả về cho người dùng
 * @param {NextFunction} next - Hàm callback để chuyển tiếp request sang middleware tiếp theo
 * @returns message
 */
export async function checkRoleCustomer(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
        const user = req.user;
        if (!user) {
            res.status(401).json({ message: 'Người dùng chưa đăng nhập!' });
            return;
        }
        const role = user.loaiTK;
        if (role === 'KH') {
            next();
        } else {
            res.status(403).json({ message: 'Không có quyền truy cập!' });
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Lỗi hệ thống máy chủ.' });
    }
}