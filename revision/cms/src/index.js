'use strict';

const { seed, setPublicPermissions } = require('./seed');

module.exports = {
  register() {},

  async bootstrap({ strapi }) {
    // The theme reads the API without a token, so make sure Public can read.
    await setPublicPermissions(strapi);

    if (process.env.SEED_ON_START !== 'false') {
      try {
        await seed(strapi);
      } catch (err) {
        strapi.log.error(`[seed] failed: ${err.message}`);
      }
    }
  },
};
