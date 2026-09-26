const dns = require('dns');

// Set public DNS servers to reliably resolve MongoDB Atlas SRV records
try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch (e) {
  // Ignore in environments where setting DNS servers is restricted
}

const mongoose = require('mongoose');

const connectDB = async (retries = 3) => {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    console.error('❌ MONGO_URI is not defined in environment variables');
    process.exit(1);
  }

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const conn = await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 10000,
        tls: true,
      });
      console.log(`✅ MongoDB Connected to Atlas: ${conn.connection.host} [DB: ${conn.connection.name}]`);
      return conn;
    } catch (error) {
      console.error(`❌ MongoDB connection attempt ${attempt}/${retries} failed: ${error.message}`);
      if (attempt === retries) {
        console.error('Final attempt failed. Please check MongoDB Atlas network access (allow 0.0.0.0/0) and credentials.');
        process.exit(1);
      }
      console.log('Retrying connection in 3 seconds...');
      await new Promise((res) => setTimeout(res, 3000));
    }
  }
};

module.exports = connectDB;
