import { connectTestDB, disconnectTestDB, clearTestDB } from './config/database';
import DacTrung from '../models/DacTrung';

describe('DacTrung Model Test', () => {
    beforeAll(async () => {
        await connectTestDB();
    });

    afterEach(async () => {
        await clearTestDB();
    });

    afterAll(async () => {
        await disconnectTestDB();
    });

    it('should create & save feature successfully', async () => {
        const validFeature = {
            ten: 'Thể loại',
            tenTruyVan: 'the-loai'
        };
        
        const savedFeature = await DacTrung.create(validFeature);
        expect(savedFeature._id).toBeDefined();
        expect(savedFeature.ten).toBe(validFeature.ten);
        expect(savedFeature.truongLoc).toBe(true); // default value
    });

    it('should have default truongLoc value', async () => {
        const feature = {
            ten: 'Thể loại',
            tenTruyVan: 'the-loai'
        };

        const savedFeature = await DacTrung.create(feature);
        expect(savedFeature.truongLoc).toBe(true);
    });

    it('should retrieve features successfully', async () => {
        const feature1 = {
            ten: 'Thể loại',
            tenTruyVan: 'the-loai'
        };
        const feature2 = {
            ten: 'Tác giả',
            tenTruyVan: 'tac-gia'
        };

        await DacTrung.create(feature1);
        await DacTrung.create(feature2);

        const features = await DacTrung.find();
        expect(features.length).toBe(2);
        expect(features[0].ten).toBe(feature1.ten);
        expect(features[1].ten).toBe(feature2.ten);
    });

    it('should update feature successfully', async () => {
        const feature = await DacTrung.create({
            ten: 'Thể loại',
            tenTruyVan: 'the-loai'
        });

        const updatedFeature = await DacTrung.findByIdAndUpdate(
            feature._id,
            { truongLoc: false },
            { new: true }
        );

        expect(updatedFeature?.truongLoc).toBe(false);
    });
});