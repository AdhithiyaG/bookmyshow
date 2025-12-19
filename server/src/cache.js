const cfg = require('./config');
let redis = null;

class MemoryCache {
  constructor() { this.map = new Map(); }
  async get(key) {
    const row = this.map.get(key);
    if (!row) return null;
    const { value, exp } = row;
    if (exp && Date.now() > exp) { this.map.delete(key); return null; }
    return value;
  }
  async set(key, value, ttlSec) {
    const exp = ttlSec ? Date.now() + ttlSec * 1000 : null;
    this.map.set(key, { value, exp });
  }
  async del(key) { this.map.delete(key); }
}

async function createCache() {
  if (cfg.redisUrl) {
    const IORedis = require('ioredis');
    const client = new IORedis(cfg.redisUrl);
    client.on('error', (e) => console.error('Redis error:', e.message));
    redis = client;
    return {
      async get(key) { const v = await client.get(key); return v ? JSON.parse(v) : null; },
      async set(key, value, ttlSec) {
        const payload = JSON.stringify(value);
        if (ttlSec) await client.set(key, payload, 'EX', ttlSec); else await client.set(key, payload);
      },
      async del(key) { await client.del(key); }
    };
  }
  console.log('Redis not configured; using in-memory cache.');
  return new MemoryCache();
}
function isRedisEnabled() { return !!redis; }

module.exports = { createCache, isRedisEnabled };
