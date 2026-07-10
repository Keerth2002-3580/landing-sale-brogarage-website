const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongod = null;

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/land_marketplace';
    
    try {
      // Try connecting with a 2-second timeout. If it succeeds, great!
      const conn = await mongoose.connect(uri, { serverSelectionTimeoutMS: 2000 });
      console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (err) {
      // If it fails and it's a local connection, fall back to in-memory
      if (uri.includes('localhost') || uri.includes('127.0.0.1')) {
        console.log('Local MongoDB not running. Initializing in-memory MongoDB server...');
        mongod = await MongoMemoryServer.create();
        const memoryUri = mongod.getUri();
        const conn = await mongoose.connect(memoryUri);
        console.log(`MongoDB Connected (In-Memory Fallback): ${conn.connection.host}`);
      } else {
        // If it was a remote connection that failed, re-throw the error
        throw err;
      }
    }
  } catch (error) {
    console.error(`Database Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
