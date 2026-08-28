/* ============================================================
   DATA.JS — THE ONLY FILE YOU NEED TO EDIT
   ------------------------------------------------------------
   Semua content laman ni datang dari sini. Tukar placeholder,
   save, refresh browser. Tak ada build step.
   ============================================================ */

const PROFILE = {
  /* --- shown in the profile header --------------------------- */
  name: "Syafiq Nazri",
  initials: "SN",                      // avatar bubble
  title: "Platform Engineer",
  github: "github.com/syafiqnzr",      // displayed text
  githubUrl: "https://github.com/syafiqnzr",
  location: "Kuala Lumpur, MY",
  resume: "assets/resume.pdf",         // letak PDF anda di sini

  /* --- shell identity ---------------------------------------- */
  user: "syafiq",                      // sebelum @ dalam prompt
  host: "portfolio",                   // selepas @ dalam prompt

  /* --- banner ------------------------------------------------ */
  banner: "DevFolio",                  // dilukis dengan figlet font
  // bannerArt: "paste art from patorjk.com here to override",

  /* --- content ----------------------------------------------- */
  bio: "Platform Engineer with a bias toward shipping. Most of my time goes into Linux, infrastructure and security fundamentals — the layer everything else quietly depends on.",

  email: "syafiqnzr01@gmail.com",
  status: "Available for freelance",
  interests: ["Infra", "Architecture", "Self-hosting"],

  socials: [
    { label: "GitHub",   handle: "@syafiqnzr",            url: "https://github.com/syafiqnzr" },
    { label: "LinkedIn", handle: "in/syafiqnazri",        url: "https://linkedin.com/in/syafiqnazri" },
    { label: "Email",    handle: "syafiqnzr01@gmail.com", url: "mailto:syafiqnzr01@gmail.com" },
  ],

  /* --- footer ------------------------------------------------ */
  footerBrand: "Devfolio",
  footerBy: "SN",
};

/* ------------------------------------------------------------
   SKILLS
   `percent` is optional. Leave it out and the skill renders as a
   plain listed item. Add one — { name: "Linux", percent: 85 } —
   and that row becomes an ASCII progress bar instead.
   ------------------------------------------------------------ */
const SKILLS = [
  {
    group: "Systems",
    items: [
      { name: "Linux" },
      { name: "Bash scripting" },
      { name: "Git" },
    ],
  },
  {
    group: "Cloud",
    items: [
      { name: "Cloud Computing" },
      { name: "AWS" },
      { name: "Cloudflare" },
    ],
  },
  {
    group: "Networking & Reliability",
    items: [
      { name: "DNS management" },
      { name: "Load Balancer (Nginx, HAProxy)" },
      { name: "Monitoring" },
    ],
  },
];

/* ------------------------------------------------------------
   EXPERIENCE — terbaru dahulu
   ------------------------------------------------------------ */
const EXPERIENCE = [
  {
    role: "Platform Engineer",
    company: "Aidan Technologies",
    period: "Jan 2026 — Present",
    desc: "Operate and maintain Linux infrastructure across AWS and Cloudflare. Day to day covers DNS management, load balancing with Nginx and HAProxy, monitoring, and automating routine operations with Bash.",
  },
  {
    role: "Intern",
    company: "Aidan Technologies",
    period: "Aug 2025 — Jan 2026",
    desc: "Joined the platform team as an intern working across the same Linux and cloud stack, and moved into the Platform Engineer role at the end of the internship.",
  },
  {
    role: "IT Technician",
    company: "Sigma Rectrix Systems (M) Sdn Bhd",
    period: "Apr 2022 — Aug 2022",
    desc: "IT support role between finishing the diploma and starting at UTHM.",
  },
];

/* ------------------------------------------------------------
   EDUCATION
   ------------------------------------------------------------ */
const EDUCATION = [
  {
    degree: "Bachelor of Computer Science (Information Security) with Honors",
    school: "Universiti Tun Hussein Onn Malaysia",
    year: "2022 — 2026",
    desc: "Specialising in Information Security.",
  },
  {
    degree: "Diploma in Digital Technology, Information Technology",
    school: "Politeknik Mersing, Johor",
    year: "2019 — 2022",
    desc: "Foundation in IT and digital technology, completed before continuing to UTHM.",
  },
];

/* ------------------------------------------------------------
   PROJECTS
   `id`       -> digunakan oleh `cd <id>` dan `project <id>`
   `category` -> digunakan untuk kumpulan dalam `ls` / `tree`
   ------------------------------------------------------------ */
const PROJECTS = [
  {
    id: "ledgerly",
    name: "Ledgerly",
    tech: "Next.js • Postgres • Stripe",
    category: "web",
    year: "2025",
    featured: true,
    desc: "Invoicing and expense tracker for freelancers.",
    details:
      "Multi-currency invoicing with a reconciliation engine that matches bank lines to invoices automatically. Handles recurring invoices, partial payments and tax summaries per jurisdiction.",
    features: [
      "Automatic bank-line reconciliation",
      "Multi-currency with daily FX snapshots",
      "Recurring invoices and payment reminders",
      "PDF export that matches local tax formats",
    ],
    stats: [
      { k: "Users", v: "4,120" },
      { k: "Invoices", v: "38k" },
      { k: "Uptime", v: "99.9%" },
      { k: "p95", v: "180ms" },
    ],
    link: "https://github.com/yourhandle/ledgerly",
    demo: "https://example.com",
  },
  {
    id: "beacon",
    name: "Beacon",
    tech: "Go • WebSocket • Redis",
    category: "tools",
    year: "2024",
    desc: "Self-hosted uptime monitor with public status pages.",
    details:
      "Runs checks from three regions and pushes incidents to Slack, Telegram and email within 15 seconds. Single binary, SQLite by default, Redis only when you want clustering.",
    features: [
      "Multi-region checks with quorum alerting",
      "Public status pages with incident history",
      "Single-binary deploy, no external database required",
    ],
    link: "https://github.com/yourhandle/beacon",
  },
  {
    id: "tinyui",
    name: "TinyUI",
    tech: "TypeScript • Design system",
    category: "web",
    year: "2024",
    desc: "A 12kB headless component library with zero dependencies.",
    details:
      "Full keyboard and screen-reader support, themed entirely with CSS custom properties. Ships as ESM with no runtime framework dependency.",
    features: [
      "Zero dependencies, 12kB min+gzip",
      "WAI-ARIA patterns verified against screen readers",
      "Themeable with plain CSS variables",
    ],
    link: "https://github.com/yourhandle/tinyui",
    demo: "https://example.com",
  },
  {
    id: "kirim",
    name: "Kirim",
    tech: "React Native • Supabase",
    category: "mobile",
    year: "2023",
    desc: "Parcel tracking app for Malaysian couriers.",
    details:
      "Scrapes six carrier APIs behind one normalised interface and pushes delivery notifications. Offline-first, so tracking history stays readable without a connection.",
    features: [
      "Six carriers behind one normalised API",
      "Offline-first local cache",
      "Push notifications on status change",
    ],
    link: "https://github.com/yourhandle/kirim",
  },
];

/* ------------------------------------------------------------
   BLOG — optional; buang array ni kalau tak perlu
   ------------------------------------------------------------ */
const POSTS = [
  {
    category: "Performance",
    read: "6 min read",
    title: "Cutting 2.8 seconds off a legacy dashboard",
    desc: "Route-level code splitting, killing a 400kB date library, and one very stubborn font.",
    url: "https://example.com/post-1",
  },
  {
    category: "Architecture",
    read: "4 min read",
    title: "Boring databases win",
    desc: "Why I keep reaching for Postgres and a single server instead of the distributed setup everyone assumes you need.",
    url: "https://example.com/post-2",
  },
  {
    category: "Tutorial",
    read: "9 min read",
    title: "Building a keyboard-first UI from scratch",
    desc: "Roving tabindex, focus traps, and the ARIA patterns people actually get wrong.",
    url: "https://example.com/post-3",
  },
];
