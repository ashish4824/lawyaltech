import mongoose from "mongoose";
 async function connectDB() {
    try {
        await mongoose.connect(process.env.MONGODB_URI ||"mongodb://abhishek:7BjDDE*Y1@103.93.16.46:27017/abhi?authSource=abhi", {
            serverSelectionTimeoutMS: 5000, 
            socketTimeoutMS: 45000, 
        });
        console.log('Connected to MongoDB');
    } catch (err) {
        console.error('MongoDB connection error:', err);
    }
}
export default connectDB;