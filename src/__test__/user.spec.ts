import request from 'supertest';
import app from '../server';
import TaiKhoan from '../models/TaiKhoan';
import bcrypt from 'bcrypt';

jest.mock('../models/TaiKhoan');
jest.mock('bcrypt');

describe('POST /api/account/register', () => {
    beforeEach(() => {
        jest.clearAllMocks(); // Clear mocks before each test
    });

    it('should return 400 if the userName already exists', async () => {
        // Mock TaiKhoan.findOne to simulate an existing user
        (TaiKhoan.findOne as jest.Mock).mockResolvedValue(true);

        const response = await request(app)
            .post('/api/account/register')
            .send({
                hoDem: 'Nguyen',
                ten: 'Anh',
                userName: 'doxkien1',
                password: 'password123',
                loaiTK: 'KH',
            });

        expect(response.status).toBe(400);
        expect(response.body).toEqual({ message: 'UserName đã tồn tại!' });
    });

    it('should create a new user and return 200 on successful registration', async () => {
        // Mock TaiKhoan.findOne to simulate no existing user
        (TaiKhoan.findOne as jest.Mock).mockResolvedValue(null);

        // Mock bcrypt.hash to simulate password hashing
        (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');

        // Mock TaiKhoan.create to simulate user creation
        (TaiKhoan.create as jest.Mock).mockResolvedValue(true);

        const response = await request(app)
            .post('/api/account/register')
            .send({
                hoDem: 'Nguyen',
                ten: 'Anh',
                userName: 'testUser',
                password: 'password123',
                loaiTK: 'KH',
            });

        expect(TaiKhoan.findOne).toHaveBeenCalledWith({ userName: 'testUser' });
        expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
        expect(TaiKhoan.create).toHaveBeenCalledWith({
            hoDem: 'Nguyen',
            ten: 'Anh',
            userName: 'testUser',
            password: 'hashedPassword',
            loaiTK: 'KH',
        });
        expect(response.status).toBe(200);
        expect(response.body).toEqual({ message: 'Đăng ký thành công!' });
    });

    it('should return 500 if there is a server error', async () => {
        // Mock TaiKhoan.findOne to simulate a database error
        (TaiKhoan.findOne as jest.Mock).mockRejectedValue(new Error('Database error'));

        const response = await request(app)
            .post('/api/account/register')
            .send({
                hoDem: 'Nguyen',
                ten: 'Anh',
                userName: 'testUser',
                password: 'password123',
                loaiTK: 'KH',
            });

        expect(response.status).toBe(500);
        expect(response.body).toEqual({ message: 'Lỗi hệ thống máy chủ.' });
    });
});
