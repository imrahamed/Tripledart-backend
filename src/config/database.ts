import mongoose from 'mongoose';
import { ENV } from './environment';

export const connectDatabase = async () => {
  try {
\    mongoose.set('debug', true);
    await mongoose.connect(ENV.MONGODB_URI);
    console.log('✅ MongoDB connected');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  }
};
