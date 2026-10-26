/* ==========================================================================
   Content for the "Revision" variant. Edit freely.
   - MON_TOPICS: the 8 round tiles under "Explore trending topics"
   - MON_POSTS:  the post grid (4 per row, 12 per page by default)
   Images live in assets/img (generic placeholders). This file is only used
   when Strapi is not configured in assets/js/config.js.
   ========================================================================== */

window.MON_TOPICS = [
  { name: "Technology", seed: "rv-tech" },
  { name: "Travel", seed: "rv-travel" },
  { name: "Business", seed: "rv-business" },
  { name: "Startups", seed: "rv-startup" },
  { name: "Design", seed: "rv-design" },
  { name: "Workshop", seed: "rv-workshop" },
  { name: "Reading", seed: "rv-reading" },
  { name: "Sport", seed: "rv-sport" }
];

window.MON_AUTHORS = {
  eric:   { name: "Eric Carrillo",  initials: "EC", tone: 0, bio: "Editor of Master of None. Learns a little of everything, writes about most of it." },
  dana:   { name: "Dana Whitfield", initials: "DW", tone: 1, bio: "Self-hoster, tinkerer, and occasional breaker of production servers." },
  marcus: { name: "Marcus Lee",     initials: "ML", tone: 2, bio: "Weekend woodworker and full-time beginner at most things." },
  priya:  { name: "Priya Raman",    initials: "PR", tone: 3, bio: "Writes about small businesses, travel on a budget, and the people behind both." }
};

window.MON_POSTS = [
  { slug: "learning-everything-badly", cats: ["Reading"], title: "The case for learning everything a little badly", excerpt: "Specialists go deep, generalists connect the dots. Why being a master of none often beats being a master of one.", seed: "rv-p1", date: "2026-10-22", read: 6, author: "eric",
    body: ["The full proverb is longer than most people remember: a jack of all trades is a master of none, but oftentimes better than a master of one.", "## Breadth is a skill", "Knowing a little about a lot is a different kind of expertise: recognizing patterns across fields and borrowing solutions from one to fix problems in another.", "> Depth tells you how. Breadth tells you where to look.", "## Start badly, on purpose", "Every new thing you pick up will be clumsy at first. Pay that price often enough and you stop being afraid of being a beginner."] },
  { slug: "self-hosting-weekend", cats: ["Technology"], title: "I self-hosted my whole stack in a weekend", excerpt: "One VM, a reverse proxy, and a lot of coffee. What went right, what broke at 2 a.m., and what I'd change.", seed: "rv-p2", date: "2026-10-18", read: 9, author: "dana",
    body: ["Friday night I had three subscriptions and no idea where my data lived. By Sunday I had one server and a plan.", "## The setup", "A single virtual machine, Docker Compose, and a reverse proxy handling HTTPS.", "```\n$ docker compose up -d\n```", "## What broke", "DNS, of course. It is always DNS."] },
  { slug: "first-bookshelf", cats: ["Workshop"], title: "Workshop notes from a first-time woodworker", excerpt: "Measure twice, cut once, then cut again because you measured wrong both times. Lessons from one bookshelf.", seed: "rv-p3", date: "2026-10-15", read: 5, author: "marcus" },
  { slug: "two-week-rail-trip", cats: ["Travel"], title: "Two weeks by rail with one carry-on bag", excerpt: "Eleven trains, four countries, and the short packing list that actually survived the trip.", seed: "rv-p4", date: "2026-10-12", read: 7, author: "priya" },
  { slug: "side-project-to-revenue", cats: ["Startups", "Business"], title: "From side project to first $1,000 in revenue", excerpt: "No launch, no ads, no audience. Just a small tool, a handful of forums, and a lot of honest emails.", seed: "rv-p5", date: "2026-10-09", read: 8, author: "eric" },
  { slug: "typography-for-non-designers", cats: ["Design"], title: "Typography for people who aren't designers", excerpt: "Three rules that fix most ugly documents: pick fewer fonts, add more space, and stop centering everything.", seed: "rv-p6", date: "2026-10-06", read: 4, author: "marcus" },
  { slug: "running-a-first-half", cats: ["Sport"], title: "What training for a first half marathon taught me", excerpt: "Slow runs, boring consistency, and why the plan matters less than simply showing up four times a week.", seed: "rv-p7", date: "2026-10-03", read: 6, author: "priya" },
  { slug: "fall-reading-list", cats: ["Reading"], title: "A fall reading list for curious generalists", excerpt: "History, systems thinking, a little physics, and one cookbook. Eight books from very different shelves.", seed: "rv-p8", date: "2026-09-30", read: 4, author: "eric" },
  { slug: "home-network-rebuild", cats: ["Technology"], title: "Rebuilding my home network from scratch", excerpt: "VLANs, a cheap managed switch, and finally getting the smart plugs off the same network as my laptop.", seed: "rv-p9", date: "2026-09-26", read: 10, author: "dana" },
  { slug: "pricing-small-services", cats: ["Business"], title: "How to price a small service business", excerpt: "Hourly is a trap, value pricing is hard, and the right answer is usually somewhere awkwardly in between.", seed: "rv-p10", date: "2026-09-22", read: 7, author: "priya" },
  { slug: "sketching-every-day", cats: ["Design"], title: "Thirty days of sketching for ten minutes a day", excerpt: "I can't draw. I still can't draw. But I see shapes, light, and proportion very differently now.", seed: "rv-p11", date: "2026-09-18", read: 5, author: "marcus" },
  { slug: "weekend-in-the-hill-country", cats: ["Travel"], title: "A slow weekend in the Texas Hill Country", excerpt: "Swimming holes, small-town bakeries, and a two-lane road with no reason to hurry anywhere.", seed: "rv-p12", date: "2026-09-14", read: 6, author: "eric" }
];
