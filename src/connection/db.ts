import mongoose from "mongoose";
import dotenv from "dotenv"

dotenv.config();

const db_host = process.env.DB_HOST || "";

const connectDB = async () => {
    try {
        console.log(db_host)
        console.log("Connected to MongoDB");
    } catch (error) {
        console.log(`ERROR: ${error}`);
    }
};

export default connectDB;
