const cfg = require('./config');
const { connectMongo } = require('./db');
const { createCache } = require('./cache');
const { createApp } = require('./app');

async function main() {
  await connectMongo();
  const cache = await createCache();
  const app = createApp(cache);
  app.listen(cfg.port, () => console.log(`API listening on :${cfg.port}`));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
