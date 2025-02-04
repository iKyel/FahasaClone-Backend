import { connectTestDB, disconnectTestDB, clearTestDB } from './config/database';
import DonDat from '../models/DonDat';
import TaiKhoan from '../models/TaiKhoan';
import mongoose from 'mongoose';

describe('DonDat Model Test', () => {
    beforeAll(async () => {
        await connectTestDB();
    });

    afterEach(async () => {
        await clearTestDB();
    });

    afterAll(async () => {
        await disconnectTestDB();
    });

    it('should create order with required fields', async () => {
        const khachHang = await TaiKhoan.create({
            hoDem: 'Nguyen Van',
            ten: 'A',
            userName: 'nguyenvana',
            password: 'password123',
            loaiTK: 'KH'
        });

        const validOrder = {
            khachHangId: khachHang._id,
            diaChiDatHang: '123 Test Street'
        };

        const savedOrder = await DonDat.create(validOrder);
        expect(savedOrder._id).toBeDefined();
        expect(savedOrder.trangThaiDon).toBe('Giỏ hàng');
        expect(savedOrder.tongTien).toBe(0);
        expect(savedOrder.ptThanhToan).toBe('COD');
        expect(savedOrder.ptVanChuyen).toBe('Giao hàng tiêu chuẩn');
    });

    it('should fail without required khachHangId', async () => {
        const invalidOrder = {
            diaChiDatHang: '123 Test Street'
        };

        await expect(DonDat.create(invalidOrder))
            .rejects
            .toThrow(mongoose.Error.ValidationError);
    });

    it('should update order status correctly', async () => {
        const khachHang = await TaiKhoan.create({
            hoDem: 'Nguyen Van',
            ten: 'A',
            userName: 'nguyenvana',
            password: 'password123',
            loaiTK: 'KH'
        });

        const order = await DonDat.create({
            khachHangId: khachHang._id,
            diaChiDatHang: '123 Test Street'
        });

        const updatedOrder = await DonDat.findByIdAndUpdate(
            order._id,
            { trangThaiDon: 'Chờ xác nhận' },
            { new: true }
        );

        expect(updatedOrder?.trangThaiDon).toBe('Chờ xác nhận');
    });

    it('should validate shipping method enum', async () => {
        const khachHang = await TaiKhoan.create({
            hoDem: 'Nguyen Van',
            ten: 'A',
            userName: 'nguyenvana',
            password: 'password123',
            loaiTK: 'KH'
        });

        const orderWithInvalidShipping = {
            khachHangId: khachHang._id,
            diaChiDatHang: '123 Test Street',
            ptVanChuyen: 'Invalid Method'
        };

        await expect(DonDat.create(orderWithInvalidShipping))
            .rejects
            .toThrow(mongoose.Error.ValidationError);
    });

    it('should have timestamps', async () => {
        const khachHang = await TaiKhoan.create({
            hoDem: 'Nguyen Van',
            ten: 'A',
            userName: 'nguyenvana',
            password: 'password123',
            loaiTK: 'KH'
        });

        const order = await DonDat.create({
            khachHangId: khachHang._id,
            diaChiDatHang: '123 Test Street'
        });

        expect(order.createdAt).toBeDefined();
        expect(order.updatedAt).toBeDefined();
    });
});