/* ==========================================================================
   Master of None — "Revision" variant behavior
   Theme toggle, mobile menu, topic tiles, searchable/filterable 4-up grid,
   and single post rendering (post.html?slug=...).
   ========================================================================== */
(function () {
  "use strict";
  var root = document.documentElement;
  var KEY = "mon-rv-theme";

  function getSaved() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function save(v) { try { localStorage.setItem(KEY, v); } catch (e) {} }
  function isDark() {
    var t = root.getAttribute("data-theme");
    if (t) return t === "dark";
    return window.matchMedia && matchMedia("(prefers-color-scheme: dark)").matches;
  }
  function toggleTheme() { var n = isDark() ? "light" : "dark"; root.setAttribute("data-theme", n); save(n); }
  var s = getSaved(); if (s) root.setAttribute("data-theme", s);

  function esc(v) {
    return String(v).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; });
  }
  function fmt(iso) {
    return new Date(iso + "T12:00:00").toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  }
  function img(seed, w, h) { return "https://picsum.photos/seed/" + seed + "/" + w + "/" + h; }
  function author(id) { return (window.MON_AUTHORS || {})[id] || { name: "Guest", initials: "G", tone: 0, bio: "" }; }
  function avatar(a) { return '<span class="avatar" data-tone="' + a.tone + '" aria-hidden="true">' + esc(a.initials) + "</span>"; }
  function postUrl(p) { return "post.html?slug=" + encodeURIComponent(p.slug); }
  function catPills(p, asLinks) {
    return p.cats.map(function (c) {
      return asLinks
        ? '<a class="pill pill--accent" href="index.html?cat=' + encodeURIComponent(c) + '#posts">' + esc(c) + "</a>"
        : '<span class="pill pill--accent">' + esc(c) + "</span>";
    }).join("");
  }

  /* ---------- Cards ---------- */
  function card(p) {
    var a = author(p.author);
    return (
      '<article class="card">' +
        '<a class="card-media" href="' + postUrl(p) + '" tabindex="-1" aria-hidden="true">' +
          '<img src="' + img(p.seed, 800, 500) + '" alt="" loading="lazy" width="800" height="500">' +
        "</a>" +
        '<div class="card-body">' +
          '<div class="card-top">' + catPills(p, true) + '<span class="read-time">' + p.read + " min read</span></div>" +
          '<h3 class="card-title"><a href="' + postUrl(p) + '">' + esc(p.title) + "</a></h3>" +
          '<p class="card-excerpt">' + esc(p.excerpt) + "</p>" +
          '<div class="byline">' + avatar(a) +
            '<div><div class="byline-name">' + esc(a.name) + '</div><div class="byline-date">' + fmt(p.date) + "</div></div>" +
          "</div>" +
        "</div>" +
      "</article>"
    );
  }

  /* ---------- Homepage ---------- */
  var state = { q: "", cat: "" };

  function renderTopics() {
    var el = document.getElementById("topics");
    if (!el || !window.MON_TOPICS) return;
    el.innerHTML = window.MON_TOPICS.map(function (t) {
      var n = window.MON_POSTS.filter(function (p) { return p.cats.indexOf(t.name) > -1; }).length;
      return '<a class="topic" href="?cat=' + encodeURIComponent(t.name) + '#posts" data-cat="' + esc(t.name) + '">' +
        '<img src="' + img(t.seed, 200, 200) + '" alt="" loading="lazy" width="72" height="72">' +
        '<span class="topic-name">' + esc(t.name) + "</span>" +
        '<span class="topic-count">' + n + (n === 1 ? " post" : " posts") + "</span></a>";
    }).join("");
    el.addEventListener("click", function (e) {
      var a = e.target.closest("[data-cat]"); if (!a) return;
      e.preventDefault(); setCat(a.getAttribute("data-cat"));
      document.getElementById("posts").scrollIntoView();
    });
  }

  function renderChips() {
    var el = document.getElementById("chips");
    if (!el || !window.MON_TOPICS) return;
    el.innerHTML = '<span class="chips-label">What are you looking for?</span>' +
      ['All'].concat(window.MON_TOPICS.map(function (t) { return t.name; })).map(function (c) {
        var v = c === "All" ? "" : c;
        return '<button type="button" class="pill" data-chip="' + esc(v) + '" aria-pressed="' + (state.cat === v) + '">' + esc(c) + "</button>";
      }).join("");
    el.onclick = function (e) {
      var b = e.target.closest("[data-chip]"); if (!b) return;
      setCat(b.getAttribute("data-chip"));
    };
  }

  function setCat(c) { state.cat = c; renderChips(); renderGrid(); }

  function renderGrid() {
    var grid = document.getElementById("post-grid");
    if (!grid) return;
    var q = state.q.trim().toLowerCase();
    var list = window.MON_POSTS.filter(function (p) {
      if (state.cat && p.cats.indexOf(state.cat) === -1) return false;
      if (!q) return true;
      return (p.title + " " + p.excerpt + " " + p.cats.join(" ") + " " + author(p.author).name).toLowerCase().indexOf(q) > -1;
    }).slice(0, parseInt(grid.getAttribute("data-limit") || "12", 10));

    grid.innerHTML = list.length ? list.map(card).join("")
      : '<div class="empty">No stories match that yet. Try another word or topic.</div>';

    var title = document.getElementById("posts-title");
    if (title && grid.hasAttribute("data-home")) {
      title.textContent = state.cat ? state.cat : (q ? "Search results" : "Latest stories");
    }
    var pag = document.getElementById("pagination");
    if (pag) pag.hidden = !!(state.cat || q);
  }

  /* ---------- Single post ---------- */
  function renderBody(blocks) {
    return blocks.map(function (b) {
      if (b.indexOf("## ") === 0) return "<h2>" + esc(b.slice(3)) + "</h2>";
      if (b.indexOf("> ") === 0) return "<blockquote>" + esc(b.slice(2)) + "</blockquote>";
      if (b.indexOf("```") === 0) return "<pre><code>" + esc(b.replace(/^```\w*\n?|```$/g, "")) + "</code></pre>";
      return "<p>" + esc(b) + "</p>";
    }).join("");
  }

  function renderPost() {
    var mount = document.getElementById("post");
    if (!mount) return;
    var slug = new URLSearchParams(location.search).get("slug");
    var p = window.MON_POSTS.filter(function (x) { return x.slug === slug; })[0] || window.MON_POSTS[0];
    var a = author(p.author);
    var body = p.body || [p.excerpt, "## Replace this with your story", "This post has no body yet. Add a body array to it in assets/js/posts.js and it will render here: paragraphs, ## headings, > quotes, and ``` code blocks."];
    document.title = p.title + " — Master of None";

    mount.innerHTML =
      '<header class="post-hero"><div class="container">' +
        '<div class="card-top">' + catPills(p, true) + '<span class="read-time">' + p.read + " min read</span></div>" +
        "<h1>" + esc(p.title) + "</h1>" +
        '<p class="lede">' + esc(p.excerpt) + "</p>" +
        '<div class="byline">' + avatar(a) + '<div><div class="byline-name">' + esc(a.name) + '</div><div class="byline-date">' + fmt(p.date) + "</div></div></div>" +
      "</div></header>" +
      '<figure class="post-cover"><img src="' + img(p.seed, 1600, 800) + '" alt=""></figure>' +
      '<div class="prose">' + renderBody(body) + "</div>" +
      '<aside class="author-box"><div class="author-box-inner">' + avatar(a) +
        "<div><h3>" + esc(a.name) + "</h3><p>" + esc(a.bio) + "</p></div></div></aside>";

    // Related grid: same category first, then the rest, skipping this post
    var others = window.MON_POSTS.filter(function (x) { return x.slug !== p.slug; });
    others.sort(function (x, y) {
      var sx = x.cats.some(function (c) { return p.cats.indexOf(c) > -1; }) ? 0 : 1;
      var sy = y.cats.some(function (c) { return p.cats.indexOf(c) > -1; }) ? 0 : 1;
      return sx - sy;
    });
    var grid = document.getElementById("post-grid");
    if (grid) grid.innerHTML = others.slice(0, 4).map(card).join("");
  }

  /* ---------- Boot ---------- */
  document.addEventListener("DOMContentLoaded", function () {
    var t = document.getElementById("theme-toggle"); if (t) t.addEventListener("click", toggleTheme);

    var m = document.getElementById("menu-toggle"), nav = document.getElementById("site-navigation");
    if (m && nav) m.addEventListener("click", function () {
      var o = nav.classList.toggle("open"); m.setAttribute("aria-expanded", o ? "true" : "false");
    });

    var params = new URLSearchParams(location.search);
    state.cat = params.get("cat") || "";

    var input = document.getElementById("search-input");
    if (input) {
      input.addEventListener("input", function () { state.q = input.value; renderGrid(); });
      var form = input.closest("form");
      if (form) form.addEventListener("submit", function (e) { e.preventDefault(); document.getElementById("posts").scrollIntoView(); });
    }

    var nl = document.getElementById("newsletter-form");
    if (nl) nl.addEventListener("submit", function (e) {
      e.preventDefault(); var b = nl.querySelector("button"); if (b) b.textContent = "You're in ✓";
    });

    var y = document.getElementById("year"); if (y) y.textContent = new Date().getFullYear();

    renderTopics();
    renderChips();
    if (document.getElementById("post")) renderPost(); else renderGrid();
  });
})();
