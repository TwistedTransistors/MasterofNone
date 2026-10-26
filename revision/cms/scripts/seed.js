'use strict';

/**
 * Manually import the sample content:  npm run seed
 * Add --force to import again even if articles already exist.
 */
const { createStrapi, compileStrapi } = require('@strapi/strapi');
const { seed } = require('../src/seed');

(async () => {
  process.env.SEED_ON_START = 'false'; // avoid double-seeding from bootstrap
  const appContext = await compileStrapi();
  const app = await createStrapi(appContext).load();
  app.log.level = 'error';
  try {
    await seed(app, { force: process.argv.includes('--force') });
    console.log('Seed complete.');
  } catch (err) {
    console.error('Seed failed:', err);
    process.exitCode = 1;
  } finally {
    await app.destroy();
  }
})();
