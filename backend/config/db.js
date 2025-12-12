const mongoose = require('mongoose');


function connectDatabase(uri) {
  const mongoUri = uri || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/sample';
  return mongoose
    .connect(mongoUri)
    .then(() => {
      console.log(`MongoDB connected successfully (${mongoUri})`);
    })
    .catch(error => {
      console.error('MongoDB connection error:', error);
      process.exit(1);
    });
}

module.exports = connectDatabase;
