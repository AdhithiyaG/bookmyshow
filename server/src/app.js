const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const cfg = require('./config');
const { buildRouter } = require('./routes');
const { seed } = require('./seed');

function createApp(cache) {
  const app = express();
  app.use(cors({ origin: cfg.corsOrigin }));
  app.use(morgan('dev'));
  app.get('/health', (req, res) => res.json({ ok: true }));

  app.post('/admin/seed', async (req, res) => {
    const out = await seed();
    if (cache) {
      // Clear all cached seats (simple strategy for demo)
      // In Redis, you could use key patterns or maintain a key registry.
    }
    res.json({ ok: true, ...out });
  });

  app.use(buildRouter(cache));

  // basic error handler
  app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  });

  return app;
}

module.exports = { createApp };
