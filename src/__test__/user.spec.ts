import { register } from '../controllers/TaiKhoan'; 
import TaiKhoan from '../models/TaiKhoan'; 
import bcrypt from 'bcrypt';
import { Request, Response } from 'express';

jest.mock('../models/TaiKhoan');
jest.mock('bcrypt');

describe('register function', () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let sendResponse: jest.Mock;
    let jsonResponse: jest.Mock;

    beforeEach(() => {
        req = {
            body: {
                hoDem: 'Nguyen',
                ten: 'Anh',
                userName: 'testUser',
                password: 'password123',
                loaiTK: 'user'
            }
        };

        // Mocking the res functions
        sendResponse = jest.fn();
        jsonResponse = jest.fn();
        res = {
            status: jest.fn().mockReturnValue({ json: jsonResponse }),
        };
    });

    it('should return 400 if the userName already exists', async () => {
        // Mock TaiKhoan.findOne to simulate existing user
        TaiKhoan.findOne = jest.fn().mockResolvedValue(true);

        await register(req as Request, res as Response);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(jsonResponse).toHaveBeenCalledWith({ message: "UserName đã tồn tại!" });
    });

    it('should create a new user and return 200 on successful registration', async () => {
        // Mock TaiKhoan.findOne to simulate no existing user
        TaiKhoan.findOne = jest.fn().mockResolvedValue(null);

        // Mock bcrypt.hash to simulate password hashing
        bcrypt.hash = jest.fn().mockResolvedValue('hashedPassword');

        // Mock TaiKhoan.create to simulate user creation
        TaiKhoan.create = jest.fn().mockResolvedValue(true);

        await register(req as Request, res as Response);

        expect(TaiKhoan.findOne).toHaveBeenCalledWith({ userName: 'testUser' });
        expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
        expect(TaiKhoan.create).toHaveBeenCalledWith({
            hoDem: 'Nguyen',
            ten: 'Anh',
            userName: 'testUser',
            password: 'hashedPassword',
            loaiTK: 'user',
        });
        expect(res.status).toHaveBeenCalledWith(200);
        expect(jsonResponse).toHaveBeenCalledWith({ message: "Đăng ký thành công!" });
    });

    it('should return 500 if there is a server error', async () => {
        // Mock TaiKhoan.findOne to simulate an error
        TaiKhoan.findOne = jest.fn().mockRejectedValue(new Error('Database error'));

        await register(req as Request, res as Response);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(jsonResponse).toHaveBeenCalledWith({ message: "Lỗi hệ thống máy chủ." });
    });
});
