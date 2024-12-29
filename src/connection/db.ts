import mongoose from "mongoose";
import dotenv from "dotenv"

dotenv.config();
const db_host = process.env.DB_HOST || "";

const connectDB = async () => {
  try {
    await mongoose.connect(db_host).then(() => {
      console.log("Connected to MongoDB");
    });
  } catch (error) {
    console.log(`ERROR}`);
    process.exit(1);
  }
};

export default connectDB;
