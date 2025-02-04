import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables từ file `.env.test`
dotenv.config({ path: '.env.test' });

const MONGODB_URI = process.env.DB_HOST || '';

export const connectTestDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to **TEST** database');
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

export const disconnectTestDB = async () => {
  try {
    await mongoose.connection.dropDatabase(); // Chỉ xóa DB test
    await mongoose.connection.close();
    console.log('Test database connection closed');
  } catch (error) {
    console.error('Error disconnecting from test database:', error);
  }
};

export const clearTestDB = async () => {
  if (mongoose.connection.readyState !== 0) {
    const collections = mongoose.connection.collections;
    
    for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany({});
    }
  }
};

export const getMongooseInstance = () => mongoose;
