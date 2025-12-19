require('dotenv').config();

const cfg = {
  port: Number(process.env.PORT || 4000),
  mongoUrl: process.env.MONGO_URL || 'mongodb://localhost:27017/bookmyshow',
  redisUrl: process.env.REDIS_URL || '',
  corsOrigin: process.env.CORS_ORIGIN || '*',
  holdTtlSeconds: Number(process.env.HOLD_TTL_SECONDS || 300)
};

module.exports = cfg;
