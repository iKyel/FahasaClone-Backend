import { connectTestDB, disconnectTestDB, clearTestDB } from './config/database';
import DanhMuc from '../models/DanhMuc';
import mongoose from 'mongoose';

describe('DanhMuc Model Test', () => {
    beforeAll(async () => {
        await connectTestDB();
    });

    afterEach(async () => {
        await clearTestDB();
    });

    afterAll(async () => {
        await disconnectTestDB();
    });

    it('should create a category successfully', async () => {
        const validCategory = {
            ten: 'Sách Tiếng Việt'
        };
        
        const savedCategory = await DanhMuc.create(validCategory);
        expect(savedCategory._id).toBeDefined();
        expect(savedCategory.ten).toBe(validCategory.ten);
        expect(savedCategory.parentId).toBeNull();
    });

    it('should fail without required fields', async () => {
        const categoryWithoutName = {};
        await expect(DanhMuc.create(categoryWithoutName))
            .rejects
            .toThrow(mongoose.Error.ValidationError);
    });

    it('should create a subcategory successfully', async () => {
        const parentCategory = await DanhMuc.create({
            ten: 'Sách Tiếng Việt'
        });

        const subcategory = await DanhMuc.create({
            ten: 'Văn Học',
            parentId: parentCategory._id
        });

        expect(subcategory.parentId).toEqual(parentCategory._id);
    });

    it('should get all categories', async () => {
        const parent = await DanhMuc.create({ ten: 'Sách Tiếng Việt' });
        const child = await DanhMuc.create({
            ten: 'Văn Học',
            parentId: parent._id
        });

        const categories = await DanhMuc.find().lean();
        expect(categories).toHaveLength(2);
        expect(categories[1].parentId).toEqual(parent._id);
    });

    it('should update category name', async () => {
        const category = await DanhMuc.create({
            ten: 'Sách Tiếng Việt'
        });

        const updatedName = 'Sách Ngoại Văn';
        const updatedCategory = await DanhMuc.findByIdAndUpdate(
            category._id,
            { ten: updatedName },
            { new: true }
        );

        expect(updatedCategory?.ten).toBe(updatedName);
    });

    it('should delete category and its subcategories', async () => {
        const parent = await DanhMuc.create({ ten: 'Parent' });
        const child1 = await DanhMuc.create({
            ten: 'Child 1',
            parentId: parent._id
        });
        const child2 = await DanhMuc.create({
            ten: 'Child 2',
            parentId: parent._id
        });

        await DanhMuc.deleteMany({
            $or: [
                { _id: parent._id },
                { parentId: parent._id }
            ]
        });

        const remainingCategories = await DanhMuc.find();
        expect(remainingCategories).toHaveLength(0);
    });
});