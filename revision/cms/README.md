# Master of None CMS (Strapi 5)

The Strapi backend for the **Revision** theme in `../`. It ships with content types that match the theme and seeds sample authors, topics, articles and generic placeholder images on first start.

## Quick start

```bash
cd revision/cms
cp .env.example .env        # then replace every "changeMe" (see below)
npm install
npm run develop             # http://localhost:1337/admin
```

On first start Strapi:

1. Gives the **Public** role read access to articles, authors, categories and Global.
2. Uploads the images in `data/images` to the Media Library.
3. Creates 4 authors, 8 categories and 12 published articles from `data/seed.json`.

Open the admin URL, create your admin account, and the content is ready under **Content Manager**.

Generate the secrets in `.env` with:

```bash
node -e "console.log(require('crypto').randomBytes(16).toString('base64'))"
```

`APP_KEYS` takes four of them, comma-separated.

## Connect the theme

In `revision/assets/js/config.js`:

```js
window.MON_CONFIG = {
  strapiUrl: "http://localhost:1337",
  apiToken: "",
  pageSize: 12
};
```

Serve the theme folder (`cd revision && python3 -m http.server 8080`) and open http://localhost:8080. To try a server without editing the file, add `?strapi=http://localhost:1337` to the page URL.

If Strapi can't be reached, the theme falls back to the sample content in `assets/js/posts.js`, so the site never shows an empty page.

## Content types

| Type | Fields | Used for |
|------|--------|----------|
| **Article** (draft & publish) | title, slug, excerpt, cover, content (rich text blocks), readTime, displayDate, featured, author, categories | Homepage grid cards, post pages, search |
| **Author** | name, slug, role, bio, avatar | Card bylines, author box |
| **Category** | name, slug, description, image, order | Topic chips, round topic tiles, card pills |
| **Global** (single type) | siteName, eyebrow, heroTitle, heroText, announcementLabel, announcementArticle, newsletterTitle, newsletterText, footerText | Hero, "Before you go" bar, newsletter, footer |

Notes:

- `displayDate` controls the date shown and the sort order. Leave it empty to use the publish date.
- `order` controls the order of topic chips and tiles.
- Rich text supports paragraphs, headings, quotes, code, lists, links, inline formatting and images.

## API calls the theme makes

All read-only, no token needed:

- `GET /api/articles?populate…&sort=displayDate:desc&pagination[page]=N` (homepage grid, 12 per page)
- `GET /api/articles?filters[categories][slug][$eq]=travel` (topic filter)
- `GET /api/articles?filters[$or][0][title][$containsi]=…` (search across title, excerpt, author, topic)
- `GET /api/articles?filters[slug][$eq]=…` (post page)
- `GET /api/categories?populate[image]…` (topic tiles with post counts)
- `GET /api/global` (site text)

## Seeding again

```bash
npm run seed            # only imports if there are no articles
npm run seed -- --force # imports the sample set again
```

Set `SEED_ON_START=false` in `.env` to stop the automatic import on startup. Delete the sample articles in the admin whenever you're ready to publish your own.

## Images

The images in `data/images` are generic, license-free abstract artwork generated for this template. Replace them with your own covers in the Media Library. Free photo sources such as Unsplash or Pexels work well; check each photo's license before you publish.

## CORS and production

- Set `CORS_ORIGIN` to your theme's domain, e.g. `https://blog.example.com`. `*` is fine for local testing.
- SQLite is the default. For production, set `DATABASE_CLIENT=postgres` and `DATABASE_URL`.
- Uploaded files are stored in `public/uploads` by default. On hosts with ephemeral disks, add an upload provider (S3, Cloudinary, etc.).
- Build and run: `npm run build && npm run start`.
