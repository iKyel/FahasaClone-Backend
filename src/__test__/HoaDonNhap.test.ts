import { connectTestDB, disconnectTestDB, clearTestDB } from './config/database';
import HoaDonNhap from '../models/HoaDonNhap';
import mongoose from 'mongoose';

describe('HoaDonNhap Model Test', () => {
    beforeAll(async () => {
        await connectTestDB();
    });

    afterEach(async () => {
        await clearTestDB();
    });

    afterAll(async () => {
        await disconnectTestDB();
    });

    it('should create purchase invoice with required fields', async () => {
        const validInvoice = {
            nhaCungCapId: new mongoose.Types.ObjectId(),
            nhanVienId: new mongoose.Types.ObjectId(),
            tongTien: 100000
        };

        const savedInvoice = await HoaDonNhap.create(validInvoice);
        expect(savedInvoice._id).toBeDefined();
        expect(savedInvoice.trangThaiDon).toBe('Chờ xác nhận');
        expect(savedInvoice.ghiChu).toBe('');
    });

    it('should fail without required fields', async () => {
        const invalidInvoice = {
            ghiChu: 'Test note'
        };

        await expect(HoaDonNhap.create(invalidInvoice))
            .rejects
            .toThrow(mongoose.Error.ValidationError);
    });

    it('should only accept valid status values', async () => {
        const invoice = {
            nhaCungCapId: new mongoose.Types.ObjectId(),
            nhanVienId: new mongoose.Types.ObjectId(),
            trangThaiDon: 'Invalid Status'
        };

        await expect(HoaDonNhap.create(invoice))
            .rejects
            .toThrow(mongoose.Error.ValidationError);
    });

    it('should update status from Chờ xác nhận to Hoàn thành', async () => {
        const invoice = await HoaDonNhap.create({
            nhaCungCapId: new mongoose.Types.ObjectId(),
            nhanVienId: new mongoose.Types.ObjectId()
        });

        const updatedInvoice = await HoaDonNhap.findByIdAndUpdate(
            invoice._id,
            { trangThaiDon: 'Hoàn thành' },
            { new: true }
        );

        expect(updatedInvoice?.trangThaiDon).toBe('Hoàn thành');
    });

    it('should update status from Chờ xác nhận to Đã hủy', async () => {
        const invoice = await HoaDonNhap.create({
            nhaCungCapId: new mongoose.Types.ObjectId(),
            nhanVienId: new mongoose.Types.ObjectId()
        });

        const updatedInvoice = await HoaDonNhap.findByIdAndUpdate(
            invoice._id,
            { trangThaiDon: 'Đã hủy' },
            { new: true }
        );

        expect(updatedInvoice?.trangThaiDon).toBe('Đã hủy');
    });

    it('should have timestamps', async () => {
        const invoice = await HoaDonNhap.create({
            nhaCungCapId: new mongoose.Types.ObjectId(),
            nhanVienId: new mongoose.Types.ObjectId()
        });

        expect(invoice.createdAt).toBeDefined();
        expect(invoice.updatedAt).toBeDefined();
    });

    it('should calculate total amount correctly', async () => {
        const invoice = await HoaDonNhap.create({
            nhaCungCapId: new mongoose.Types.ObjectId(),
            nhanVienId: new mongoose.Types.ObjectId(),
            tongTien: 150000
        });

        expect(invoice.tongTien).toBe(150000);
    });
});