module.exports = ({ env }) => [
  'strapi::logger',
  'strapi::errors',
  'strapi::security',
  {
    // Allow the static theme (any origin listed in CORS_ORIGIN) to read the API.
    name: 'strapi::cors',
    config: {
      origin: env.array('CORS_ORIGIN', ['*']),
      methods: ['GET', 'HEAD', 'OPTIONS'],
      headers: ['Content-Type', 'Authorization', 'Origin', 'Accept'],
    },
  },
  'strapi::poweredBy',
  'strapi::query',
  'strapi::body',
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
];
