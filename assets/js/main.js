/* ==========================================================================
   Master of None — theme behavior
   - Light/dark toggle (remembers choice when storage is available)
   - Mobile menu
   - Keyboard shortcuts (T theme, S subscribe, H home, ? help)
   - Renders the homepage 4-up grid and single post page from posts.js
   ========================================================================== */

(function () {
  "use strict";

  var root = document.documentElement;
  var STORAGE_KEY = "mon-theme";

  /* ---------- Theme ---------- */
  function readTheme() {
    try { return localStorage.getItem(STORAGE_KEY); } catch (e) { return null; }
  }
  function saveTheme(v) {
    try { localStorage.setItem(STORAGE_KEY, v); } catch (e) { /* storage blocked */ }
  }
  function currentTheme() {
    var set = root.getAttribute("data-theme");
    if (set) return set;
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  function toggleTheme() {
    var next = currentTheme() === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    saveTheme(next);
  }
  var saved = readTheme();
  if (saved) root.setAttribute("data-theme", saved);

  /* ---------- Helpers ---------- */
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function fmtDate(iso) {
    var d = new Date(iso + "T12:00:00");
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }
  function authorBlock(a, extra) {
    return (
      '<div class="author">' +
        '<span class="avatar" aria-hidden="true">' + esc(a.initials) + "</span>" +
        "<div>" +
          '<div class="author-name">' + esc(a.name) + "</div>" +
          '<div class="author-role">' + esc(extra || a.role) + "</div>" +
        "</div>" +
      "</div>"
    );
  }

  /* ---------- Homepage grid ---------- */
  function renderGrid() {
    var grid = document.getElementById("story-grid");
    if (!grid || !window.MON_POSTS) return;
    var limit = parseInt(grid.getAttribute("data-limit") || "4", 10);
    grid.innerHTML = window.MON_POSTS.slice(0, limit).map(function (p) {
      var href = "post.html?slug=" + encodeURIComponent(p.slug);
      return (
        '<article class="story">' +
          '<a class="story-cover" href="' + href + '" tabindex="-1" aria-hidden="true">' +
            '<img src="' + esc(p.cover) + '" alt="" loading="lazy" width="1200" height="900">' +
            '<span class="story-tag">' + esc(p.tag) + "</span>" +
          "</a>" +
          '<div class="story-body">' +
            '<div class="story-meta">' + fmtDate(p.date) + " · " + esc(p.readTime) + "</div>" +
            '<h3 class="story-title"><a href="' + href + '">' + esc(p.title) + "</a></h3>" +
            '<p class="story-desc">' + esc(p.description) + "</p>" +
            authorBlock(p.author) +
          "</div>" +
        "</article>"
      );
    }).join("");
  }

  /* ---------- Single post ---------- */
  function renderBody(blocks) {
    return blocks.map(function (b) {
      if (b.indexOf("## ") === 0) return "<h2>" + esc(b.slice(3)) + "</h2>";
      if (b.indexOf("> ") === 0) return "<blockquote>" + esc(b.slice(2)) + "</blockquote>";
      if (b.indexOf("```") === 0) return "<pre><code>" + esc(b.replace(/^```\w*\n?|```$/g, "")) + "</code></pre>";
      if (b === "---") return "<hr>";
      return "<p>" + esc(b) + "</p>";
    }).join("");
  }

  function renderPost() {
    var mount = document.getElementById("post");
    if (!mount || !window.MON_POSTS) return;
    var slug = new URLSearchParams(location.search).get("slug");
    var post = window.MON_POSTS.filter(function (p) { return p.slug === slug; })[0] || window.MON_POSTS[0];
    document.title = post.title + " — Master of None";

    mount.innerHTML =
      '<header class="post-header"><div class="container">' +
        '<div class="breadcrumb"><a href="index.html">~/stories</a> / ' + esc(post.tag.toLowerCase()) + "</div>" +
        "<h1>" + esc(post.title) + "</h1>" +
        '<p class="lede">' + esc(post.description) + "</p>" +
        authorBlock(post.author, fmtDate(post.date) + " · " + post.readTime + " read") +
      "</div></header>" +
      '<figure class="post-cover"><img src="' + esc(post.cover) + '" alt=""></figure>' +
      '<div class="prose">' + renderBody(post.body) + "</div>";

    // "More stories" grid below the post should skip the current one
    window.MON_POSTS = window.MON_POSTS.filter(function (p) { return p.slug !== post.slug; });
  }

  /* ---------- Shortcuts ---------- */
  function onKey(e) {
    var t = e.target;
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
    var k = e.key.toLowerCase();
    if (k === "t") toggleTheme();
    else if (k === "h") location.href = "index.html";
    else if (k === "s") {
      var input = document.getElementById("subscribe-email");
      if (input) { e.preventDefault(); input.focus(); input.scrollIntoView({ behavior: "smooth", block: "center" }); }
    } else if (k === "?") {
      alert("Shortcuts\n\nT  toggle theme\nH  home\nS  subscribe");
    }
  }

  /* ---------- Boot ---------- */
  document.addEventListener("DOMContentLoaded", function () {
    var tbtn = document.getElementById("theme-toggle");
    if (tbtn) tbtn.addEventListener("click", toggleTheme);

    var mbtn = document.getElementById("menu-toggle");
    var nav = document.getElementById("site-navigation");
    if (mbtn && nav) {
      mbtn.addEventListener("click", function () {
        var open = nav.classList.toggle("open");
        mbtn.setAttribute("aria-expanded", open ? "true" : "false");
      });
    }

    var form = document.getElementById("subscribe-form");
    if (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var btn = form.querySelector("button");
        if (btn) btn.textContent = "✓ Subscribed";
      });
    }

    var yr = document.getElementById("year");
    if (yr) yr.textContent = new Date().getFullYear();

    renderPost();
    renderGrid();
    document.addEventListener("keydown", onKey);
  });
})();
