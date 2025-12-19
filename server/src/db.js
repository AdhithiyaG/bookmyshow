const mongoose = require('mongoose');
const cfg = require('./config');

async function connectMongo() {
  mongoose.set('strictQuery', true);
  await mongoose.connect(cfg.mongoUrl, {
    autoIndex: true,
    serverSelectionTimeoutMS: 10000
  });
  return mongoose;
}

module.exports = { connectMongo };
