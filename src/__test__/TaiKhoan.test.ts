import { connectTestDB, disconnectTestDB, clearTestDB } from './config/database';
import TaiKhoan from '../models/TaiKhoan';
import mongoose from 'mongoose';

interface MongoError extends Error {
    code?: number;
}

describe('TaiKhoan Model Test', () => {
    // Connect to test database before all tests
    beforeAll(async () => {
        await connectTestDB();
    });

    // Clear all test data after each test
    afterEach(async () => {
        await clearTestDB();
    });

    // Disconnect after all tests
    afterAll(async () => {
        await disconnectTestDB();
    });

    // Test valid user creation
    it('should create & save user successfully', async () => {
        const validUser = {
            hoDem: 'Nguyen Van',
            ten: 'A',
            userName: 'nguyenvana',
            password: 'password123',
            loaiTK: 'KH'
        };
        
        const savedUser = await TaiKhoan.create(validUser);
        expect(savedUser._id).toBeDefined();
        expect(savedUser.hoDem).toBe(validUser.hoDem);
        expect(savedUser.trangThai).toBe(true); // default value
    });

    // Test required fields
    it('should fail to save without required fields', async () => {
        const userWithoutRequiredField = new TaiKhoan({
            hoDem: 'Nguyen Van'
            // missing other required fields
        });

        let err;
        try {
            await userWithoutRequiredField.save();
        } catch (error) {
            err = error;
        }
        expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
    });

    // Test unique userName constraint
    it('should fail to create duplicate userName', async () => {
        const userData = {
            hoDem: 'Nguyen Van',
            ten: 'A',
            userName: 'uniqueuser',
            password: 'password123',
            loaiTK: 'KH'
        };

        await TaiKhoan.create(userData);
        
        let err: MongoError | null = null;
        try {
            await TaiKhoan.create(userData);
        } catch (error) {
            err = error as MongoError;
        }
        expect(err).toBeDefined();
        expect(err?.code).toBe(11000); // MongoDB duplicate key error code
    });

    // Test enum validation for loaiTK
    it('should fail with invalid loaiTK enum value', async () => {
        const userWithInvalidRole = {
            hoDem: 'Nguyen Van',
            ten: 'A',
            userName: 'nguyenvana',
            password: 'password123',
            loaiTK: 'INVALID_ROLE' // Invalid role
        };

        let err;
        try {
            await TaiKhoan.create(userWithInvalidRole);
        } catch (error) {
            err = error;
        }
        expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
    });

    // Test enum validation for gioiTinh
    it('should validate gioiTinh enum values', async () => {
        const validUser = {
            hoDem: 'Nguyen Van',
            ten: 'A',
            userName: 'nguyenvana',
            password: 'password123',
            loaiTK: 'KH',
            gioiTinh: 'Nam'
        };

        const savedUser = await TaiKhoan.create(validUser);
        expect(savedUser.gioiTinh).toBe('Nam');

        let err;
        try {
            await TaiKhoan.create({
                ...validUser,
                userName: 'different',
                gioiTinh: 'INVALID'
            });
        } catch (error) {
            err = error;
        }
        expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
    });

    // Test optional fields
    it('should save successfully with optional fields', async () => {
        const userWithOptionalFields = {
            hoDem: 'Nguyen Van',
            ten: 'A',
            userName: 'nguyenvana',
            password: 'password123',
            loaiTK: 'KH',
            email: 'test@example.com',
            sdt: '0123456789',
            diaChi: ['123 Street'],
            ngaySinh: '1990-01-01'
        };

        const savedUser = await TaiKhoan.create(userWithOptionalFields);
        expect(savedUser.email).toBe(userWithOptionalFields.email);
        expect(savedUser.sdt).toBe(userWithOptionalFields.sdt);
        expect(savedUser.diaChi).toEqual(userWithOptionalFields.diaChi);
        expect(savedUser.ngaySinh).toBe(userWithOptionalFields.ngaySinh);
    });
});