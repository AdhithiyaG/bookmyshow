require('dotenv').config();

const corsOriginEnv = process.env.CORS_ORIGIN || '*';
const corsAllowAll = corsOriginEnv === '*';
const corsOrigins = corsAllowAll
  ? []
  : corsOriginEnv
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

const cfg = {
  port: Number(process.env.PORT || 4000),
  mongoUrl: process.env.MONGO_URL || 'mongodb://localhost:27017/bookmyshow',
  redisUrl: process.env.REDIS_URL || '',
  corsAllowAll,
  corsOrigins,
  holdTtlSeconds: Number(process.env.HOLD_TTL_SECONDS || 300)
};

module.exports = cfg;
