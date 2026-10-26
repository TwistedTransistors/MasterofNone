/* ==========================================================================
   Story data — edit this file to change what appears on the homepage.
   The homepage shows the first 4 stories in a 4-column grid.
   Cover images use picsum.photos placeholders; swap in your own paths
   (e.g. "assets/img/my-cover.jpg").
   ========================================================================== */

window.MON_POSTS = [
  {
    slug: "learning-everything-badly",
    tag: "Essay",
    title: "The case for learning everything a little badly",
    description:
      "Specialists go deep. Generalists connect the dots. Notes on why being a master of none is often better than being a master of one.",
    cover: "https://picsum.photos/seed/mon-generalist/1200/900",
    date: "2026-10-22",
    readTime: "6 min",
    author: { name: "Eric Carrillo", role: "Editor", initials: "EC" },
    body: [
      "The full proverb is longer than most people remember: a jack of all trades is a master of none, but oftentimes better than a master of one. Somewhere along the way we dropped the second half.",
      "## Breadth is a skill",
      "Knowing a little about a lot is not the absence of expertise. It is a different kind of expertise: the ability to recognize patterns across fields and borrow solutions from one to fix problems in another.",
      "> Depth tells you how. Breadth tells you where to look.",
      "## Start badly, on purpose",
      "Every new thing you pick up will be clumsy at first. That is the price of admission. Pay it often enough and you stop being afraid of being a beginner."
    ]
  },
  {
    slug: "self-hosting-weekend",
    tag: "Build log",
    title: "I self-hosted my whole stack in a weekend",
    description:
      "One VM, a reverse proxy, and a lot of coffee. What went right, what broke at 2 a.m., and what I'd do differently next time.",
    cover: "https://picsum.photos/seed/mon-servers/1200/900",
    date: "2026-10-15",
    readTime: "9 min",
    author: { name: "Dana Whitfield", role: "Contributor", initials: "DW" },
    body: [
      "Friday night I had three subscriptions, two dashboards, and zero idea where my data actually lived. By Sunday night I had one server and a plan.",
      "## The setup",
      "A single virtual machine, Docker Compose, and Caddy in front of everything for automatic HTTPS.",
      "```\n$ docker compose up -d\n```",
      "## What broke",
      "DNS, of course. It is always DNS."
    ]
  },
  {
    slug: "workshop-notes-woodworking",
    tag: "Hands-on",
    title: "Workshop notes from a first-time woodworker",
    description:
      "Measure twice, cut once, and then cut again because you measured wrong both times. Lessons from building a bookshelf.",
    cover: "https://picsum.photos/seed/mon-workshop/1200/900",
    date: "2026-10-08",
    readTime: "5 min",
    author: { name: "Marcus Lee", role: "Contributor", initials: "ML" },
    body: [
      "I wanted a bookshelf. I could have bought one. Instead I bought a saw.",
      "## Tools matter less than you think",
      "A square, a decent saw, and patience will get you further than a garage full of gear.",
      "## Finish is everything",
      "Sanding is boring. Sanding is also the difference between something you built and something you are proud of."
    ]
  },
  {
    slug: "reading-list-fall",
    tag: "Reading",
    title: "A fall reading list for curious generalists",
    description:
      "History, systems thinking, a little physics, and one cookbook. Eight books that pull from very different shelves.",
    cover: "https://picsum.photos/seed/mon-library/1200/900",
    date: "2026-10-01",
    readTime: "4 min",
    author: { name: "Eric Carrillo", role: "Editor", initials: "EC" },
    body: [
      "The best reading lists are a little incoherent. That is the point.",
      "## How I picked these",
      "One rule: no two books from the same section of the library.",
      "## The list",
      "Swap this paragraph for your own picks. The template renders plain paragraphs, headings, quotes, and code blocks."
    ]
  }
];
