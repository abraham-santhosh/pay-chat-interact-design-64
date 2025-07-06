import mongoose from 'mongoose';

// MongoDB Atlas URI - you can also use environment variables
const mongoURI = process.env.MONGODB_URI || "mongodb+srv://abrahamsanthosh2005:manar0ckz@error404.61z6wbv.mongodb.net/Error404?retryWrites=true&w=majority&appName=error404";

export const connectDatabase = async (): Promise<void> => {
  try {
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGINT', async () => {
  try {
    await mongoose.connection.close();
    console.log('📦 MongoDB connection closed');
    process.exit(0);
  } catch (error) {
    console.error('Error closing MongoDB connection:', error);
    process.exit(1);
  }
});