# Master of None — Blog Theme

A soft, magazine-style blog theme inspired by the Revision theme's Full Grid homepage, with an optional Strapi 5 CMS behind it.

No build step, no framework — plain HTML, CSS and a little JavaScript.

- Announcement bar, sticky header with pill nav, dark-mode toggle
- Centered hero with **search** and **topic chips** that filter the grid
- "Explore trending topics" row of round image tiles (scrolls sideways on phones)
- **4-column post grid**: cover, topic pills, read time, title, description, author avatar + date
- Real pagination, newsletter card, 4-column footer
- `post.html?slug=…` story page with rich text, author box and "You might also like"

## Structure

```
index.html            # homepage
post.html             # single story, opened as post.html?slug=<slug>
assets/
  css/style.css       # all styling + design tokens (colors, fonts, spacing)
  js/config.js        # Strapi URL / token / page size
  js/posts.js         # local sample content (used when Strapi isn't configured)
  js/main.js          # theme toggle, menu, search, rendering, Strapi client
  img/                # generic placeholder covers, topics and author photos
cms/                  # Strapi 5 backend (optional)
```

## Content source

- **Strapi**: set `strapiUrl` in `assets/js/config.js`. The backend lives in `cms/` with content types, public read access and sample content pre-configured. See [`cms/README.md`](cms/README.md).
- **No CMS**: leave `strapiUrl` empty and the theme uses `assets/js/posts.js`. It also falls back to this if Strapi is unreachable.

## Customizing the look

All colors live as CSS variables at the top of `assets/css/style.css` (`--bg`, `--fg`, `--accent`, …), with a matching dark set. Font: Manrope from Google Fonts.

## Responsive

- Desktop: 4 columns
- Tablet (≤1024px): 2 columns
- Phone (≤640px): 1 column, collapsible menu below 820px

## Running locally

Open `index.html` in a browser, or serve the folder:

```
python3 -m http.server
```

It also works as-is on GitHub Pages (Settings → Pages → deploy from `main`).

Images in `assets/img/` are generic, license-free placeholder artwork. Replace them with your own.
