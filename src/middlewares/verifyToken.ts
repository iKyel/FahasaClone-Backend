import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { AuthenticatedRequest } from "../interface/AutheticatedRequest";
import TaiKhoan from "../models/TaiKhoan";
import { wss } from "../server";
import WebSocket from "ws";

const SECRET_KEY = process.env.JWT_SECRET || "";

async function verifyToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    const token = req.cookies.token;
    // Check tokien is exists?
    if (!token) {
        res.status(401).json({ message: 'Token chưa có: Người dùng chưa đăng nhập!' });
    } else {
        // Check if token has expired, then throw error
        try {
            const decoded = jwt.verify(token, SECRET_KEY) as JwtPayload;
            const user = await TaiKhoan.findOne({
                _id: decoded.userId,
                userName: decoded.userName
            });
            // Check if user is exists?
            if (!user) {
                res.status(401).json({ message: 'Token không hợp lệ: Không thấy người dùng!' });
            } else {
                // Check if user is active?
                if (!user.trangThai) {
                    res.status(401).json({ message: 'Tài khoản của bạn đã bị khóa!' });
                    return;
                }
                // If Oke, then store 'user' in request and move to next middleware
                req.user = user;

                // Gán userId vào webSocket
                wss.on('connection', (ws: WebSocket & { userId?: string }) => {
                    ws.userId = user._id.toString();
                });

                next();
            }
        } catch (error) {
            console.error('Lỗi khi xác thực token của người dùng:', error);
            res.status(403).json({ message: 'Token đã hết hạn. Hãy đăng nhập lại!' });
        }
    }
}

export default verifyToken;