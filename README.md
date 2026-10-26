# Master of None — Blog Theme

A minimalist static blog theme inspired by the look of [americancloud.com](https://americancloud.com/): monochrome palette, hairline borders, monospace "terminal" accents (`[ labels ]`, keyboard-key chips, `$` prompts), and automatic light/dark modes.

No build step, no framework — plain HTML, CSS and a little JavaScript.

## Pages

| File | What it is |
|------|------------|
| `index.html` | Homepage: hero, **4-column story grid** (cover, description, author), newsletter strip |
| `post.html` | Single story template, opened as `post.html?slug=<slug>`, with a "More stories" grid |

## Structure

```
index.html
post.html
assets/
  css/style.css   # all styling + design tokens (colors, fonts, spacing)
  js/posts.js     # story data — edit this to change content
  js/main.js      # theme toggle, mobile menu, shortcuts, rendering
```

## Adding or editing stories

Open `assets/js/posts.js`. Each story looks like this:

```js
{
  slug: "my-new-story",
  tag: "Essay",
  title: "My new story",
  description: "One or two sentences shown on the card.",
  cover: "assets/img/my-cover.jpg",
  date: "2026-10-26",
  readTime: "5 min",
  author: { name: "Your Name", role: "Editor", initials: "YN" },
  body: [
    "A paragraph.",
    "## A heading",
    "> A pull quote",
    "```\ncode block\n```"
  ]
}
```

The homepage shows the first four stories in the array. Change `data-limit` on `#story-grid` in `index.html` to show more (the grid wraps in rows of four).

## Customizing the look

All colors live as CSS variables at the top of `assets/css/style.css` (`--bg`, `--fg`, `--accent`, …), with a matching dark set. Fonts are Inter and JetBrains Mono from Google Fonts.

## Keyboard shortcuts

| Key | Action |
|-----|--------|
| `T` | Toggle light/dark |
| `H` | Home |
| `S` | Jump to subscribe |
| `?` | Show shortcuts |

## Responsive

- Desktop: 4 columns
- Tablet (≤1024px): 2 columns
- Phone (≤760px): 1 column, collapsible menu

## Running locally

Open `index.html` in a browser, or serve the folder:

```
python3 -m http.server
```

It also works as-is on GitHub Pages (Settings → Pages → deploy from `main`).

Placeholder cover images come from picsum.photos. Replace them with your own.

---

## Second theme: `revision/`

A softer, magazine-style variant inspired by the Revision theme's Full Grid homepage. Open `revision/index.html`.

- Announcement bar, sticky header with pill nav, dark-mode toggle
- Centered hero with a live **search** box and **topic chips** that filter the grid
- "Explore trending topics" row of 8 round image tiles (scrolls sideways on phones)
- **4-column post grid** (12 posts): rounded cover, category pills, read time, title, description, author avatar + date
- Pagination, rounded newsletter card, 4-column footer
- `post.html?slug=…` story page with author box and "You might also like"

Edit content in `revision/assets/js/posts.js` (topics, authors, posts). Font: Manrope.
