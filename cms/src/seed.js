'use strict';

/**
 * Seeds the CMS with the theme's sample content:
 *  - grants the Public role read access to the blog API
 *  - uploads the generic placeholder images in data/images
 *  - creates authors, categories, articles and the Global single type
 *
 * Runs automatically on first start (SEED_ON_START=true, the default) and only
 * when there are no articles yet. Run manually with `npm run seed`.
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const IMAGE_DIR = path.join(DATA_DIR, 'images');

const PUBLIC_ACTIONS = [
  'api::article.article.find',
  'api::article.article.findOne',
  'api::author.author.find',
  'api::author.author.findOne',
  'api::category.category.find',
  'api::category.category.findOne',
  'api::global.global.find',
];

async function setPublicPermissions(strapi) {
  const role = await strapi
    .query('plugin::users-permissions.role')
    .findOne({ where: { type: 'public' } });
  if (!role) return;

  const existing = await strapi
    .query('plugin::users-permissions.permission')
    .findMany({ where: { role: role.id } });
  const have = new Set(existing.map((p) => p.action));

  for (const action of PUBLIC_ACTIONS) {
    if (have.has(action)) continue;
    await strapi
      .query('plugin::users-permissions.permission')
      .create({ data: { action, role: role.id } });
  }
}

const MIME = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp' };

async function uploadImage(strapi, relPath, alt) {
  const filepath = path.join(IMAGE_DIR, relPath);
  if (!fs.existsSync(filepath)) {
    strapi.log.warn(`[seed] missing image ${relPath}`);
    return null;
  }
  const fileName = path.basename(relPath);
  const name = fileName.replace(path.extname(fileName), '');

  // Reuse an image that was already uploaded (safe to re-run)
  const found = await strapi.query('plugin::upload.file').findOne({ where: { name: fileName } });
  if (found) return found;

  const stat = fs.statSync(filepath);
  const mimetype = MIME[path.extname(fileName).toLowerCase()] || 'application/octet-stream';

  const [file] = await strapi
    .plugin('upload')
    .service('upload')
    .upload({
      files: {
        filepath,
        originalFilename: fileName,
        mimetype,
        size: stat.size,
      },
      data: {
        fileInfo: { name: fileName, alternativeText: alt || name, caption: '' },
      },
    });
  return file;
}

async function seed(strapi, { force = false } = {}) {
  await setPublicPermissions(strapi);

  const count = await strapi.documents('api::article.article').count({});
  if (count > 0 && !force) {
    strapi.log.info('[seed] articles already exist, skipping sample content');
    return;
  }

  const data = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'seed.json'), 'utf8'));
  strapi.log.info('[seed] importing sample content…');

  // Authors
  const authorIds = {};
  for (const a of data.authors) {
    const avatar = await uploadImage(strapi, a.avatar, `${a.name} avatar`);
    const doc = await strapi.documents('api::author.author').create({
      data: { name: a.name, slug: a.slug, role: a.role, bio: a.bio, avatar: avatar ? avatar.id : null },
    });
    authorIds[a.key] = doc.documentId;
  }

  // Categories
  const categoryIds = {};
  for (const c of data.categories) {
    const image = await uploadImage(strapi, c.image, c.name);
    const doc = await strapi.documents('api::category.category').create({
      data: { name: c.name, slug: c.slug, order: c.order, description: c.description, image: image ? image.id : null },
    });
    categoryIds[c.slug] = doc.documentId;
  }

  // Articles (oldest first so the newest are also the most recently published)
  const articleIds = {};
  for (const art of [...data.articles].reverse()) {
    const cover = await uploadImage(strapi, art.cover, art.title);
    const doc = await strapi.documents('api::article.article').create({
      data: {
        title: art.title,
        slug: art.slug,
        excerpt: art.excerpt,
        content: art.content,
        readTime: art.readTime,
        displayDate: art.displayDate,
        featured: art.featured,
        cover: cover ? cover.id : null,
        author: authorIds[art.author] ? { connect: [authorIds[art.author]] } : undefined,
        categories: { connect: art.categories.map((s) => categoryIds[s]).filter(Boolean) },
      },
      status: 'published',
    });
    articleIds[art.slug] = doc.documentId;
  }

  // Global single type
  const g = { ...data.global };
  const announce = articleIds[g.announcementArticle];
  delete g.announcementArticle;
  const existingGlobal = await strapi.documents('api::global.global').findFirst();
  const globalData = { ...g, announcementArticle: announce ? { connect: [announce] } : undefined };
  if (existingGlobal) {
    await strapi.documents('api::global.global').update({ documentId: existingGlobal.documentId, data: globalData });
  } else {
    await strapi.documents('api::global.global').create({ data: globalData });
  }

  strapi.log.info(
    `[seed] done: ${data.authors.length} authors, ${data.categories.length} categories, ${data.articles.length} articles`
  );
}

module.exports = { seed, setPublicPermissions };
