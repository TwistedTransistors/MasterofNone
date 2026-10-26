/* ==========================================================================
   Master of None — "Revision" variant
   --------------------------------------------------------------------------
   Data comes from Strapi when MON_CONFIG.strapiUrl is set (see config.js),
   otherwise from the local sample content in posts.js. Both sources are
   normalized into the same shape, so rendering code doesn't care which
   one is in use. Works with Strapi v5 (flat) and v4 (data.attributes).
   ========================================================================== */
(function () {
  "use strict";

  var root = document.documentElement;
  var CFG = window.MON_CONFIG || {};
  var params = new URLSearchParams(location.search);
  var STRAPI = (params.get("strapi") || CFG.strapiUrl || "").replace(/\/+$/, "");
  var PAGE_SIZE = CFG.pageSize || 12;

  /* ======================================================================
     Theme toggle
     ====================================================================== */
  var KEY = "mon-rv-theme";
  function getSaved() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function save(v) { try { localStorage.setItem(KEY, v); } catch (e) {} }
  function isDark() {
    var t = root.getAttribute("data-theme");
    if (t) return t === "dark";
    return window.matchMedia && matchMedia("(prefers-color-scheme: dark)").matches;
  }
  function toggleTheme() { var n = isDark() ? "light" : "dark"; root.setAttribute("data-theme", n); save(n); }
  var saved = getSaved(); if (saved) root.setAttribute("data-theme", saved);

  /* ======================================================================
     Helpers
     ====================================================================== */
  function esc(v) {
    return String(v == null ? "" : v).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function safeUrl(u) {
    u = String(u || "");
    return /^(https?:|mailto:|\/|#|\.|[a-z0-9_-]+\.html)/i.test(u) ? u : "#";
  }
  function fmt(iso) {
    if (!iso) return "";
    var d = new Date(String(iso).length === 10 ? iso + "T12:00:00" : iso);
    return isNaN(d) ? "" : d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  }
  function slugify(s) { return String(s).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""); }
  function initials(name) {
    return String(name || "?").split(/\s+/).filter(Boolean).slice(0, 2).map(function (w) { return w[0]; }).join("").toUpperCase();
  }
  function tone(name) {
    var h = 0; for (var i = 0; i < String(name).length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
    return h % 4;
  }
  function postUrl(slug) { return "post.html?slug=" + encodeURIComponent(slug) + keepStrapiParam("&"); }
  function homeUrl(q) { return "index.html" + (q ? "?" + q : "") + keepStrapiParam(q ? "&" : "?"); }
  function keepStrapiParam(sep) { return params.get("strapi") ? sep + "strapi=" + encodeURIComponent(params.get("strapi")) : ""; }
  function debounce(fn, ms) { var t; return function () { var a = arguments; clearTimeout(t); t = setTimeout(function () { fn.apply(null, a); }, ms); }; }

  /* ======================================================================
     Strapi source
     ====================================================================== */
  // Flatten Strapi v4 { data: { id, attributes } } into v5-style flat objects
  function flat(x) {
    if (Array.isArray(x)) return x.map(flat);
    if (!x || typeof x !== "object") return x;
    if ("data" in x && Object.keys(x).length <= 2 && !("id" in x)) return flat(x.data);
    if (x.attributes) {
      var o = { id: x.id };
      for (var k in x.attributes) o[k] = flat(x.attributes[k]);
      return o;
    }
    var out = {};
    for (var key in x) out[key] = flat(x[key]);
    return out;
  }

  function media(m, size) {
    if (!m) return "";
    var f = (size && m.formats && (m.formats[size] || m.formats.medium || m.formats.small)) || m;
    var u = f.url || m.url || "";
    return /^https?:/.test(u) ? u : STRAPI + u;
  }

  function qs(obj, prefix) {
    var parts = [];
    Object.keys(obj).forEach(function (k) {
      var v = obj[k], key = prefix ? prefix + "[" + k + "]" : k;
      if (v === undefined || v === null || v === "") return;
      if (typeof v === "object") parts.push(qs(v, key));
      else parts.push(encodeURIComponent(key) + "=" + encodeURIComponent(v));
    });
    return parts.filter(Boolean).join("&");
  }

  function api(path, query) {
    var url = STRAPI + "/api/" + path + (query ? "?" + qs(query) : "");
    var headers = { Accept: "application/json" };
    if (CFG.apiToken) headers.Authorization = "Bearer " + CFG.apiToken;
    return fetch(url, { headers: headers }).then(function (r) {
      if (!r.ok) throw new Error("Strapi " + r.status + " for " + path);
      return r.json();
    }).then(function (json) {
      return { data: flat(json.data), meta: json.meta || {} };
    });
  }

  var ARTICLE_POPULATE = {
    cover: { fields: ["url", "formats", "alternativeText"] },
    author: { populate: { avatar: { fields: ["url", "formats"] } } },
    categories: { fields: ["name", "slug"] }
  };

  function normArticle(a) {
    var au = a.author || {};
    return {
      slug: a.slug,
      title: a.title,
      excerpt: a.excerpt || "",
      cover: media(a.cover, "medium"),
      coverLarge: media(a.cover, "large"),
      coverAlt: (a.cover && a.cover.alternativeText) || "",
      date: a.displayDate || a.publishedAt || a.createdAt,
      read: a.readTime || 5,
      cats: (a.categories || []).map(function (c) { return { name: c.name, slug: c.slug }; }),
      author: {
        name: au.name || "Guest",
        role: au.role || "",
        bio: au.bio || "",
        initials: initials(au.name),
        tone: tone(au.name || ""),
        avatar: media(au.avatar, "thumbnail")
      },
      content: Array.isArray(a.content) ? a.content : []
    };
  }

  var strapiSource = {
    site: function () {
      return api("global", { populate: { announcementArticle: { fields: ["title", "slug"] } } })
        .then(function (r) {
          var g = r.data || {};
          return {
            siteName: g.siteName, eyebrow: g.eyebrow, heroTitle: g.heroTitle, heroText: g.heroText,
            announcementLabel: g.announcementLabel,
            announcement: g.announcementArticle ? { title: g.announcementArticle.title, slug: g.announcementArticle.slug } : null,
            newsletterTitle: g.newsletterTitle, newsletterText: g.newsletterText, footerText: g.footerText
          };
        })
        .catch(function () { return {}; }); // Global is optional
    },
    topics: function () {
      return api("categories", {
        sort: ["order:asc", "name:asc"],
        populate: { image: { fields: ["url", "formats"] }, articles: { fields: ["slug"] } },
        pagination: { pageSize: 50 }
      }).then(function (r) {
        return (r.data || []).map(function (c) {
          return { name: c.name, slug: c.slug, image: media(c.image, "thumbnail"), count: (c.articles || []).length };
        });
      });
    },
    posts: function (opts) {
      var filters = {};
      if (opts.cat) filters.categories = { slug: { $eq: opts.cat } };
      if (opts.q) filters.$or = [
        { title: { $containsi: opts.q } },
        { excerpt: { $containsi: opts.q } },
        { author: { name: { $containsi: opts.q } } },
        { categories: { name: { $containsi: opts.q } } }
      ];
      if (opts.exclude) filters.slug = { $ne: opts.exclude };
      return api("articles", {
        filters: filters,
        sort: ["displayDate:desc", "publishedAt:desc"],
        fields: ["title", "slug", "excerpt", "readTime", "displayDate", "publishedAt"],
        populate: ARTICLE_POPULATE,
        pagination: { page: opts.page || 1, pageSize: opts.pageSize || PAGE_SIZE }
      }).then(function (r) {
        var p = (r.meta && r.meta.pagination) || {};
        return { items: (r.data || []).map(normArticle), page: p.page || 1, pageCount: p.pageCount || 1, total: p.total || 0 };
      });
    },
    post: function (slug) {
      return api("articles", {
        filters: { slug: { $eq: slug } },
        populate: ARTICLE_POPULATE
      }).then(function (r) { return r.data && r.data[0] ? normArticle(r.data[0]) : null; });
    }
  };

  /* ======================================================================
     Local source (assets/js/posts.js)
     ====================================================================== */
  function lineToBlock(b) {
    var t = function (s) { return [{ type: "text", text: s }]; };
    if (b.indexOf("## ") === 0) return { type: "heading", level: 2, children: t(b.slice(3)) };
    if (b.indexOf("> ") === 0) return { type: "quote", children: t(b.slice(2)) };
    if (b.indexOf("```") === 0) return { type: "code", children: t(b.replace(/^```\w*\n?|```$/g, "").trim()) };
    return { type: "paragraph", children: t(b) };
  }

  function localArticle(p) {
    var a = (window.MON_AUTHORS || {})[p.author] || { name: "Guest" };
    var body = p.body || ["## Replace this with your story",
      "This is sample content. Connect Strapi in assets/js/config.js, or add a body array to this post in assets/js/posts.js."];
    return {
      slug: p.slug, title: p.title, excerpt: p.excerpt,
      cover: p.cover || "assets/img/covers/" + p.slug + ".jpg",
      coverLarge: p.cover || "assets/img/covers/" + p.slug + ".jpg",
      coverAlt: "",
      date: p.date, read: p.read,
      cats: p.cats.map(function (c) { return { name: c, slug: slugify(c) }; }),
      author: {
        name: a.name, role: a.role || "", bio: a.bio || "", initials: a.initials || initials(a.name),
        tone: a.tone != null ? a.tone : tone(a.name), avatar: a.avatar || "assets/img/authors/" + slugify(a.name) + ".jpg"
      },
      content: body.map(lineToBlock)
    };
  }

  var localSource = {
    site: function () { return Promise.resolve({}); },
    topics: function () {
      var posts = window.MON_POSTS || [];
      return Promise.resolve((window.MON_TOPICS || []).map(function (t) {
        return {
          name: t.name, slug: slugify(t.name),
          image: t.image || "assets/img/topics/" + slugify(t.name) + ".jpg",
          count: posts.filter(function (p) { return p.cats.indexOf(t.name) > -1; }).length
        };
      }));
    },
    posts: function (opts) {
      var q = (opts.q || "").toLowerCase();
      var list = (window.MON_POSTS || []).map(localArticle).filter(function (p) {
        if (opts.exclude && p.slug === opts.exclude) return false;
        if (opts.cat && !p.cats.some(function (c) { return c.slug === opts.cat; })) return false;
        if (!q) return true;
        return (p.title + " " + p.excerpt + " " + p.author.name + " " + p.cats.map(function (c) { return c.name; }).join(" "))
          .toLowerCase().indexOf(q) > -1;
      });
      var size = opts.pageSize || PAGE_SIZE, page = opts.page || 1;
      return Promise.resolve({
        items: list.slice((page - 1) * size, page * size),
        page: page, pageCount: Math.max(1, Math.ceil(list.length / size)), total: list.length
      });
    },
    post: function (slug) {
      var p = (window.MON_POSTS || []).filter(function (x) { return x.slug === slug; })[0];
      return Promise.resolve(p ? localArticle(p) : null);
    }
  };

  // Use Strapi when configured; if it fails, fall back to local content.
  var usingStrapi = !!STRAPI;
  function source() { return usingStrapi ? strapiSource : localSource; }
  function withFallback(name, args) {
    return source()[name].apply(null, args).catch(function (err) {
      if (!usingStrapi) throw err;
      console.warn("[theme] Strapi unavailable, using local sample content:", err.message);
      usingStrapi = false;
      root.setAttribute("data-source", "local");
      return localSource[name].apply(null, args);
    });
  }
  var data = {
    site: function () { return withFallback("site", []); },
    topics: function () { return withFallback("topics", []); },
    posts: function (o) { return withFallback("posts", [o]); },
    post: function (s) { return withFallback("post", [s]); }
  };

  /* ======================================================================
     Rendering
     ====================================================================== */
  function avatar(a, cls) {
    if (a.avatar) {
      return '<span class="avatar' + (cls ? " " + cls : "") + '" data-tone="' + a.tone + '" aria-hidden="true">' +
        '<img src="' + esc(a.avatar) + '" alt="" loading="lazy" onerror="this.remove()">' + esc(a.initials) + "</span>";
    }
    return '<span class="avatar' + (cls ? " " + cls : "") + '" data-tone="' + a.tone + '" aria-hidden="true">' + esc(a.initials) + "</span>";
  }

  function catPills(p) {
    return p.cats.map(function (c) {
      return '<a class="pill pill--accent" href="' + esc(homeUrl("cat=" + encodeURIComponent(c.slug))) + '#posts">' + esc(c.name) + "</a>";
    }).join("");
  }

  function card(p) {
    var a = p.author;
    return (
      '<article class="card">' +
        '<a class="card-media" href="' + esc(postUrl(p.slug)) + '" tabindex="-1" aria-hidden="true">' +
          (p.cover ? '<img src="' + esc(p.cover) + '" alt="' + esc(p.coverAlt) + '" loading="lazy" width="800" height="500">' : "") +
        "</a>" +
        '<div class="card-body">' +
          '<h3 class="card-title"><a href="' + esc(postUrl(p.slug)) + '">' + esc(p.title) + "</a></h3>" +
          '<div class="card-meta">' + esc(a.name) + " · " + esc(fmt(p.date)) + " · " + esc(p.read) + " min read</div>" +
          '<p class="card-excerpt">' + esc(p.excerpt) + "</p>" +
          '<div class="card-tags">' + catPills(p) + "</div>" +
        "</div>" +
      "</article>"
    );
  }

  function skeleton(n) {
    var s = "";
    for (var i = 0; i < n; i++) {
      s += '<div class="card is-loading" aria-hidden="true"><div class="card-media"></div><div class="card-body">' +
        '<span class="sk sk-pill"></span><span class="sk sk-title"></span><span class="sk sk-line"></span><span class="sk sk-line short"></span></div></div>';
    }
    return s;
  }

  // Strapi "blocks" rich text → HTML
  function inline(children) {
    return (children || []).map(function (n) {
      if (n.type === "link") return '<a href="' + esc(safeUrl(n.url)) + '">' + inline(n.children) + "</a>";
      var t = esc(n.text || "").replace(/\n/g, "<br>");
      if (n.code) t = "<code>" + t + "</code>";
      if (n.bold) t = "<strong>" + t + "</strong>";
      if (n.italic) t = "<em>" + t + "</em>";
      if (n.underline) t = "<u>" + t + "</u>";
      if (n.strikethrough) t = "<s>" + t + "</s>";
      return t;
    }).join("");
  }
  function plain(children) {
    return (children || []).map(function (n) { return n.text != null ? n.text : plain(n.children); }).join("");
  }
  function blocksToHtml(blocks) {
    return (blocks || []).map(function (b) {
      switch (b.type) {
        case "heading": var l = Math.min(Math.max(b.level || 2, 2), 4); return "<h" + l + ">" + inline(b.children) + "</h" + l + ">";
        case "quote": return "<blockquote>" + inline(b.children) + "</blockquote>";
        case "code": return "<pre><code>" + esc(plain(b.children)) + "</code></pre>";
        case "list":
          var tag = b.format === "ordered" ? "ol" : "ul";
          return "<" + tag + ">" + (b.children || []).map(function (li) {
            return li.type === "list" ? blocksToHtml([li]) : "<li>" + inline(li.children) + "</li>";
          }).join("") + "</" + tag + ">";
        case "image":
          if (!b.image) return "";
          return '<figure><img src="' + esc(media(b.image)) + '" alt="' + esc(b.image.alternativeText || "") + '" loading="lazy">' +
            (b.image.caption ? "<figcaption>" + esc(b.image.caption) + "</figcaption>" : "") + "</figure>";
        default: return "<p>" + inline(b.children) + "</p>";
      }
    }).join("");
  }

  function applySite(site) {
    document.querySelectorAll("[data-global]").forEach(function (el) {
      var v = site[el.getAttribute("data-global")];
      if (v) el.textContent = v;
    });
    var ann = document.getElementById("announce-link");
    if (ann && site.announcement) {
      ann.textContent = site.announcement.title;
      ann.setAttribute("href", postUrl(site.announcement.slug));
    }
  }

  /* ======================================================================
     Homepage
     ====================================================================== */
  var state = { q: params.get("q") || "", cat: slugify(params.get("cat") || ""), page: parseInt(params.get("page") || "1", 10) || 1 };
  var topicsCache = [];

  function syncUrl() {
    var p = new URLSearchParams();
    if (state.cat) p.set("cat", state.cat);
    if (state.q) p.set("q", state.q);
    if (state.page > 1) p.set("page", state.page);
    if (params.get("strapi")) p.set("strapi", params.get("strapi"));
    var s = p.toString();
    history.replaceState(null, "", location.pathname + (s ? "?" + s : "") + location.hash);
  }

  function renderPagination(res) {
    var nav = document.getElementById("pagination");
    if (!nav) return;
    if (res.pageCount <= 1) { nav.hidden = true; nav.innerHTML = ""; return; }
    nav.hidden = false;
    var cur = res.page, last = res.pageCount, out = [];
    function link(n, label, cls) {
      return '<a href="#posts" data-page="' + n + '"' + (cls ? ' class="' + cls + '"' : "") + ">" + label + "</a>";
    }
    if (cur > 1) out.push(link(cur - 1, "← Prev", "prev"));
    for (var i = 1; i <= last; i++) {
      if (i === 1 || i === last || Math.abs(i - cur) <= 1) {
        out.push(i === cur ? '<span aria-current="page">' + i + "</span>" : link(i, i));
      } else if (out[out.length - 1] !== '<span class="gap">…</span>') {
        out.push('<span class="gap">…</span>');
      }
    }
    if (cur < last) out.push(link(cur + 1, "Next →", "next"));
    nav.innerHTML = out.join("");
    nav.onclick = function (e) {
      var a = e.target.closest("[data-page]"); if (!a) return;
      e.preventDefault(); state.page = parseInt(a.getAttribute("data-page"), 10);
      loadGrid(); document.getElementById("posts").scrollIntoView();
    };
  }

  var gridRequest = 0;
  function loadGrid() {
    var grid = document.getElementById("post-grid");
    if (!grid) return;
    var mine = ++gridRequest;
    grid.setAttribute("aria-busy", "true");
    grid.innerHTML = skeleton(4);
    syncUrl();

    var title = document.getElementById("posts-title");
    if (title) {
      var t = topicsCache.filter(function (x) { return x.slug === state.cat; })[0];
      title.textContent = t ? t.name : (state.q ? "Search results" : "Latest stories");
    }
    markActiveNav();

    data.posts({ q: state.q, cat: state.cat, page: state.page, pageSize: PAGE_SIZE }).then(function (res) {
      if (mine !== gridRequest) return; // a newer request superseded this one
      grid.removeAttribute("aria-busy");
      grid.innerHTML = res.items.length ? res.items.map(card).join("")
        : '<div class="empty">' + (state.cat && !state.q
            ? "Nothing filed here yet. Check back soon."
            : "No stories match that yet. Try another word or topic.") +
          ' <a class="link-arrow" href="' + esc(homeUrl("")) + '">See all stories →</a></div>';
      // Default view (no topic, no search, first page): lead with the newest story
      var lead = grid.querySelector(".card");
      if (lead && !state.cat && !state.q && state.page === 1) {
        lead.classList.add("card--feature");
        var img = lead.querySelector("img"); if (img) img.removeAttribute("loading");
      }
      renderPagination(res);
    }).catch(function () {
      grid.innerHTML = '<div class="empty">Stories could not be loaded. Please try again later.</div>';
    });
  }

  // Highlight the menu link for the current section (Home when unfiltered)
  function markActiveNav() {
    document.querySelectorAll("#site-navigation a").forEach(function (a) {
      var m = /[?&]cat=([^&#]+)/.exec(a.getAttribute("href"));
      var on = m ? slugify(decodeURIComponent(m[1])) === state.cat : !state.cat;
      if (on) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current");
    });
  }

  function initHome() {
    var input = document.getElementById("search-input");
    if (input) {
      input.value = state.q;
      var run = debounce(function () { state.q = input.value.trim(); state.page = 1; loadGrid(); }, usingStrapi ? 300 : 0);
      input.addEventListener("input", run);
      var form = input.closest("form");
      if (form) form.addEventListener("submit", function (e) {
        e.preventDefault(); state.q = input.value.trim(); state.page = 1; loadGrid();
        document.getElementById("posts").scrollIntoView();
      });
    }

    loadGrid();
    data.topics().then(function (topics) {
      topicsCache = topics;
      var title = document.getElementById("posts-title");
      var t = topics.filter(function (x) { return x.slug === state.cat; })[0];
      if (title && t) title.textContent = t.name;
    });
  }

  /* ======================================================================
     Single post
     ====================================================================== */
  function initPost() {
    var mount = document.getElementById("post");
    var slug = params.get("slug");
    mount.setAttribute("aria-busy", "true");

    var find = slug ? data.post(slug) : Promise.resolve(null);
    find.then(function (p) {
      if (p) return p;
      // No slug or not found: show the newest story instead
      return data.posts({ page: 1, pageSize: 1 }).then(function (r) { return r.items[0] || null; });
    }).then(function (p) {
      mount.removeAttribute("aria-busy");
      if (!p) {
        mount.innerHTML = '<header class="post-hero"><div class="container"><h1>Story not found</h1>' +
          '<p class="lede">It may have been moved or unpublished.</p><a class="btn" href="' + esc(homeUrl("")) + '">Back to all stories</a></div></header>';
        return;
      }
      var a = p.author;
      document.title = p.title + " — Master of None";
      mount.innerHTML =
        '<header class="post-hero"><div class="container">' +
          '<div class="card-top">' + catPills(p) + '<span class="read-time">' + esc(p.read) + " min read</span></div>" +
          "<h1>" + esc(p.title) + "</h1>" +
          '<p class="lede">' + esc(p.excerpt) + "</p>" +
          '<div class="byline">' + avatar(a) + '<div><div class="byline-name">' + esc(a.name) + '</div><div class="byline-date">' + esc(fmt(p.date)) + "</div></div></div>" +
        "</div></header>" +
        (p.coverLarge ? '<figure class="post-cover"><img src="' + esc(p.coverLarge) + '" alt="' + esc(p.coverAlt) + '"></figure>' : "") +
        '<div class="prose">' + blocksToHtml(p.content) + "</div>" +
        '<aside class="author-box"><div class="author-box-inner">' + avatar(a) +
          "<div><h3>" + esc(a.name) + "</h3>" + (a.role ? '<div class="author-role">' + esc(a.role) + "</div>" : "") +
          "<p>" + esc(a.bio) + "</p></div></div></aside>";

      // Related: same topic first, topped up with the latest stories
      var grid = document.getElementById("post-grid");
      if (!grid) return;
      grid.innerHTML = skeleton(4);
      var first = p.cats[0] ? data.posts({ cat: p.cats[0].slug, exclude: p.slug, pageSize: 4 }) : Promise.resolve({ items: [] });
      first.then(function (r) {
        if (r.items.length >= 4) return r.items;
        return data.posts({ exclude: p.slug, pageSize: 8 }).then(function (r2) {
          var seen = {}; r.items.forEach(function (x) { seen[x.slug] = 1; });
          return r.items.concat(r2.items.filter(function (x) { return !seen[x.slug]; })).slice(0, 4);
        });
      }).then(function (items) { grid.innerHTML = items.map(card).join(""); });
    }).catch(function () {
      mount.innerHTML = '<header class="post-hero"><div class="container"><h1>Something went wrong</h1><p class="lede">This story could not be loaded.</p></div></header>';
    });
  }

  /* ======================================================================
     Page transitions: the clicked card's image becomes the story cover
     (see "Page transitions" in style.css). Only one element may carry the
     name per page, so it is set right before leaving and right on arrival.
     ====================================================================== */
  var COVER = "story-cover", LAST = "mon-last-story";
  function slugOf(href) { var m = /[?&]slug=([^&#]+)/.exec(href || ""); return m ? decodeURIComponent(m[1]) : ""; }
  function clearCoverNames() {
    document.querySelectorAll(".card-media img, .post-cover img").forEach(function (i) { i.style.viewTransitionName = "none"; });
  }
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest('.card a[href*="post.html"]');
    if (!a || e.metaKey || e.ctrlKey || e.shiftKey || e.button) return;
    var img = a.closest(".card").querySelector(".card-media img");
    clearCoverNames();
    if (img) img.style.viewTransitionName = COVER;
    try { sessionStorage.setItem(LAST, slugOf(a.getAttribute("href"))); } catch (err) {}
  });
  window.addEventListener("pageswap", function () {
    // Leaving a story for anywhere else: let its cover travel back to its card
    var cover = document.querySelector(".post-cover img");
    if (cover && !document.querySelector('.card-media img[style*="' + COVER + '"]')) cover.style.viewTransitionName = COVER;
  });
  window.addEventListener("pagereveal", function (e) {
    if (!e.viewTransition) return;
    var cover = document.querySelector(".post-cover img");
    if (cover) { cover.style.viewTransitionName = COVER; return; }
    var last; try { last = sessionStorage.getItem(LAST); } catch (err) {}
    var link = last && document.querySelector('.card a[href*="slug=' + encodeURIComponent(last) + '"]');
    var img = link && link.closest(".card").querySelector(".card-media img");
    if (img) img.style.viewTransitionName = COVER;
    e.viewTransition.finished.then(clearCoverNames, clearCoverNames);
  });

  /* ======================================================================
     Boot
     ====================================================================== */
  function boot() {
    root.setAttribute("data-source", usingStrapi ? "strapi" : "local");

    var t = document.getElementById("theme-toggle"); if (t) t.addEventListener("click", toggleTheme);
    var m = document.getElementById("menu-toggle"), nav = document.getElementById("site-navigation");
    if (m && nav) m.addEventListener("click", function () {
      var o = nav.classList.toggle("open"); m.setAttribute("aria-expanded", o ? "true" : "false");
    });

    // Keep the ?strapi= override on internal links while previewing
    if (params.get("strapi")) {
      document.querySelectorAll('a[href^="index.html"], a[href^="post.html"]').forEach(function (a) {
        var h = a.getAttribute("href"), hash = "";
        var i = h.indexOf("#"); if (i > -1) { hash = h.slice(i); h = h.slice(0, i); }
        a.setAttribute("href", h + (h.indexOf("?") > -1 ? "&" : "?") + "strapi=" + encodeURIComponent(params.get("strapi")) + hash);
      });
    }

    var y = document.getElementById("year"); if (y) y.textContent = new Date().getFullYear();

    data.site().then(applySite);
    if (document.getElementById("post")) initPost(); else initHome();
  }
  // This script sits at the end of <body>, so the page is already parsed: render
  // now, before the first paint (see rel="expect" in the page <head>), so page
  // transitions capture the finished page instead of an empty one.
  if (document.querySelector(".site-footer")) boot();
  else document.addEventListener("DOMContentLoaded", boot);
})();
