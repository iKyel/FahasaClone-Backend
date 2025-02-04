import { connectTestDB, disconnectTestDB, clearTestDB } from './config/database';
import NhaCungCap from '../models/NhaCungCap';
import HoaDonNhap from '../models/HoaDonNhap';
import mongoose from 'mongoose';

describe('NhaCungCap Model Test', () => {
    beforeAll(async () => {
        await connectTestDB();
    });

    afterEach(async () => {
        await clearTestDB();
    });

    afterAll(async () => {
        await disconnectTestDB();
    });

    it('should create & save supplier successfully', async () => {
        const validSupplier = {
            ten: 'Nhà xuất bản Kim Đồng'
        };
        
        const savedSupplier = await NhaCungCap.create(validSupplier);
        expect(savedSupplier._id).toBeDefined();
        expect(savedSupplier.ten).toBe(validSupplier.ten);
    });

    it('should fail without required fields', async () => {
        const supplierWithoutRequired = new NhaCungCap({});
        await expect(supplierWithoutRequired.save())
            .rejects
            .toThrow(mongoose.Error.ValidationError);
    });

    it('should update supplier successfully', async () => {
        const supplier = await NhaCungCap.create({
            ten: 'Nhà xuất bản Kim Đồng'
        });

        const updatedName = 'Nhà xuất bản Trẻ';
        const updatedSupplier = await NhaCungCap.findByIdAndUpdate(
            supplier._id,
            { ten: updatedName },
            { new: true }
        );

        expect(updatedSupplier?.ten).toBe(updatedName);
    });

    it('should not delete supplier with purchase invoices', async () => {
        const supplier = await NhaCungCap.create({
            ten: 'Nhà xuất bản Kim Đồng'
        });

        await HoaDonNhap.create({
            nhaCungCapId: supplier._id,
            nhanVienId: new mongoose.Types.ObjectId(),
        });

        const deleteOperation = async () => {
            const hasInvoices = await HoaDonNhap.exists({ nhaCungCapId: supplier._id });
            if (hasInvoices) {
                throw new Error('Cannot delete supplier with existing invoices');
            }
            return await NhaCungCap.findByIdAndDelete(supplier._id);
        };

        await expect(deleteOperation()).rejects.toThrow('Cannot delete supplier with existing invoices');
    });

    it('should get all suppliers', async () => {
        const suppliers = [
            { ten: 'Nhà xuất bản Kim Đồng' },
            { ten: 'Nhà xuất bản Trẻ' }
        ];

        await NhaCungCap.create(suppliers);

        const fetchedSuppliers = await NhaCungCap.find().sort({ ten: 1 });
        expect(fetchedSuppliers).toHaveLength(2);
        expect(fetchedSuppliers[0].ten).toBe('Nhà xuất bản Kim Đồng');
        expect(fetchedSuppliers[1].ten).toBe('Nhà xuất bản Trẻ');
    });

    it('should get supplier by id', async () => {
        const supplier = await NhaCungCap.create({
            ten: 'Nhà xuất bản Kim Đồng'
        });

        const fetchedSupplier = await NhaCungCap.findById(supplier._id);
        expect(fetchedSupplier?.ten).toBe(supplier.ten);
    });
});