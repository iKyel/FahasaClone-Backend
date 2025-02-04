import { connectTestDB, disconnectTestDB, clearTestDB } from './config/database';
import SanPham from '../models/SanPham';
import DanhMuc from '../models/DanhMuc';
import mongoose from 'mongoose';

describe('SanPham Model Test', () => {
    beforeAll(async () => {
        await connectTestDB();
    });

    afterEach(async () => {
        await clearTestDB();
    });

    afterAll(async () => {
        await disconnectTestDB();
    });

    it('should create & save product successfully', async () => {
        const danhMuc = await DanhMuc.create({ ten: 'Sách Tiếng Việt' });
        
        const validProduct = {
            tenSP: 'Sách Test',
            giaBan: 100000,
            trongLuong: 200,
            kichThuoc: {
                dai: 20,
                rong: 15,
                cao: 1
            },
            danhMucId: danhMuc._id
        };

        const savedProduct = await SanPham.create(validProduct);
        expect(savedProduct._id).toBeDefined();
        expect(savedProduct.soLuong).toBe(0);
        expect(savedProduct.khuyenMai).toBe(0);
        expect(savedProduct.moTa).toBe('Không có mô tả.');
        expect(savedProduct.imageUrl).toBe('');
    });

    it('should fail without required fields', async () => {
        const productWithoutRequired = {
            tenSP: 'Sách Test'
        };

        await expect(SanPham.create(productWithoutRequired))
            .rejects
            .toThrow(mongoose.Error.ValidationError);
    });

    it('should calculate discounted price correctly', async () => {
        const danhMuc = await DanhMuc.create({ ten: 'Sách Tiếng Việt' });
        
        const product = await SanPham.create({
            tenSP: 'Sách Test',
            giaBan: 100000,
            trongLuong: 200,
            kichThuoc: {
                dai: 20,
                rong: 15,
                cao: 1
            },
            danhMucId: danhMuc._id,
            khuyenMai: 10
        });

        expect(product.giaBan * (1 - product.khuyenMai/100)).toBe(90000);
    });

    it('should validate kichThuoc object', async () => {
        const danhMuc = await DanhMuc.create({ ten: 'Sách Tiếng Việt' });
        
        const invalidProduct = {
            tenSP: 'Sách Test',
            giaBan: 100000,
            trongLuong: 200,
            kichThuoc: {
                dai: 20,
                rong: 15
                // missing cao
            },
            danhMucId: danhMuc._id
        };

        await expect(SanPham.create(invalidProduct))
            .rejects
            .toThrow(mongoose.Error.ValidationError);
    });

    it('should update product successfully', async () => {
        const danhMuc = await DanhMuc.create({ ten: 'Sách Tiếng Việt' });
        
        const product = await SanPham.create({
            tenSP: 'Sách Test',
            giaBan: 100000,
            trongLuong: 200,
            kichThuoc: {
                dai: 20,
                rong: 15,
                cao: 1
            },
            danhMucId: danhMuc._id
        });

        const updatedProduct = await SanPham.findByIdAndUpdate(
            product._id,
            { tenSP: 'Sách Test Updated' },
            { new: true }
        );

        expect(updatedProduct?.tenSP).toBe('Sách Test Updated');
    });
});