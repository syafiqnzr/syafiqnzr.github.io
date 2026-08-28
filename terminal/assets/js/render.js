/* ============================================================
   RENDER.JS — small HTML builders. Every function returns a
   string of HTML, which the terminal prints as one block.
   ============================================================ */

function esc(s) {
  return String(s == null ? "" : s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Section heading with a trailing rule. */
function h(title) {
  return `<div class="h">${esc(title)}</div>`;
}

/** One line of escaped text. */
function line(text, cls = "muted") {
  return `<p class="line ${cls}">${esc(text)}</p>`;
}

/** One line of already-built HTML. */
function raw(html, cls = "muted") {
  return `<p class="line ${cls}">${html}</p>`;
}

/** Label / value list. */
function kv(pairs) {
  return `<dl class="kv">${pairs
    .map(([k, v]) => `<dt>${esc(k)}</dt><dd>${v}</dd>`)
    .join("")}</dl>`;
}

/** External link. */
function link(label, url) {
  const attrs = /^mailto:/i.test(url)
    ? ""
    : ' target="_blank" rel="noopener noreferrer"';
  return `<a href="${esc(url)}"${attrs}>${esc(label)}</a>`;
}

/** Button that runs a terminal command when clicked. */
function runBtn(label, cmd) {
  return `<button class="act" data-cmd="${esc(cmd)}">${esc(label)}</button>`;
}

/** Link styled like an action button. */
function linkBtn(label, url) {
  return `<span class="act act--link">${link(label, url)}</span>`;
}

/** Row of buttons / links; falsy entries are dropped. */
function actions(items) {
  const kept = items.filter(Boolean);
  return kept.length ? `<div class="actions">${kept.join("")}</div>` : "";
}

/**
 * The command list shown on the welcome screen and by `help`.
 * Every row is a real button, so visitors who would never think to
 * type at a prompt can just click their way around the site.
 */
function cmdTable(pairs) {
  return `<div class="cmdlist">${pairs
    .map(
      ([c, d]) => `<button class="cmdrow" data-cmd="${esc(c.replace(/^\//, ""))}">
        <span class="cmdrow__c">${esc(c)}</span>
        <span class="cmdrow__d">${esc(d)}</span>
      </button>`
    )
    .join("")}</div>`;
}

/** Stat strip. */
function stats(list) {
  if (!list || !list.length) return "";
  return `<div class="stats">${list
    .map(
      (s) =>
        `<div><div class="stat__v">${esc(s.v)}</div><div class="stat__k">${esc(
          s.k
        )}</div></div>`
    )
    .join("")}</div>`;
}

/** ASCII progress bar. */
function skillBar(name, percent, width = 22) {
  const filled = Math.round((percent / 100) * width);
  const bar =
    "█".repeat(filled) +
    `<span class="empty">${"░".repeat(width - filled)}</span>`;
  return `<div class="skill">
    <span class="skill__n">${esc(name)}</span>
    <span class="skill__bar">${bar}</span>
    <span class="skill__p">${percent}%</span>
  </div>`;
}

/** A skill with no `percent` — listed, not measured. */
function skillItem(name) {
  return `<span class="skillflat__i">${esc(name)}</span>`;
}

function skillList(groups) {
  return groups
    .map((g) => {
      const rated = g.items.filter((s) => typeof s.percent === "number");
      const plain = g.items.filter((s) => typeof s.percent !== "number");
      return `<div class="skillgroup">
        <div class="skillgroup__h">${esc(g.group)}</div>
        ${rated.map((s) => skillBar(s.name, s.percent)).join("")}
        ${
          plain.length
            ? `<div class="skillflat">${plain.map((s) => skillItem(s.name)).join("")}</div>`
            : ""
        }
      </div>`;
    })
    .join("");
}

/** Generic left-bordered entry, shared by projects, jobs and degrees. */
function entry(o) {
  return `<div class="entry">
    <div class="entry__top">
      <span class="entry__name">${esc(o.name)}</span>
      ${o.badge ? `<span class="badge">${esc(o.badge)}</span>` : ""}
      ${o.meta ? `<span class="entry__meta">${esc(o.meta)}</span>` : ""}
    </div>
    ${o.at ? `<div class="entry__at">${esc(o.at)}</div>` : ""}
    ${o.tech ? `<div class="entry__tech">${esc(o.tech)}</div>` : ""}
    ${o.desc ? `<p class="entry__desc">${esc(o.desc)}</p>` : ""}
    ${
      o.list && o.list.length
        ? `<ul class="entry__list">${o.list
            .map((i) => `<li>${esc(i)}</li>`)
            .join("")}</ul>`
        : ""
    }
    ${o.actions || ""}
  </div>`;
}

/** Short project row used by `project` with no argument. */
function projectRow(p) {
  return entry({
    name: p.name,
    badge: p.featured ? "FEATURED" : "",
    meta: p.year,
    tech: p.tech,
    desc: p.desc,
    actions: actions([
      runBtn("details", "project " + p.id),
      p.demo ? linkBtn("demo ↗", p.demo) : "",
      p.link ? linkBtn("code ↗", p.link) : "",
    ]),
  });
}

/** Full project detail for `project <id>`. */
function projectDetail(p) {
  return (
    h(p.name) +
    kv([
      ["stack", `<span class="cyan">${esc(p.tech)}</span>`],
      ["year", esc(p.year || "—")],
      ["type", esc(p.category)],
    ]) +
    `<p class="entry__desc" style="margin:12px 0 0">${esc(p.details || p.desc)}</p>` +
    (p.stats ? stats(p.stats) : "") +
    (p.features && p.features.length
      ? `<div class="skillgroup__h" style="margin-top:12px">Highlights</div>
         <ul class="entry__list">${p.features
           .map((f) => `<li>${esc(f)}</li>`)
           .join("")}</ul>`
      : "") +
    actions([
      p.demo ? linkBtn("live demo ↗", p.demo) : "",
      p.link ? linkBtn("source ↗", p.link) : "",
      runBtn("back to all", "project"),
    ])
  );
}

/** Blog list. */
function postList(posts) {
  return posts
    .map(
      (p) => `<a class="post" href="${esc(p.url)}" target="_blank" rel="noopener noreferrer">
        <span class="post__meta">${esc(p.category)} &middot; ${esc(p.read)}</span>
        <span class="post__title">${esc(p.title)} ↗</span>
        <span class="post__desc">${esc(p.desc)}</span>
      </a>`
    )
    .join("");
}

/** Column listing of directory contents. */
function lsGrid(nodes) {
  if (!nodes.length) return line("(empty)", "faint");
  return `<div class="ls">${nodes
    .map((n) =>
      n.type === "dir"
        ? `<span class="dir">${esc(n.name)}/</span>`
        : `<span class="file">${esc(n.name)}</span>`
    )
    .join("")}</div>`;
}
