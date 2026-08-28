/* ============================================================
   FS.JS — a virtual file system built from data.js, so `ls`,
   `tree`, `cd` and `cat` behave like a real shell.

   Files are not text on disk; each one knows how to render
   itself, which is what `cat` prints.
   ============================================================ */

function slug(s) {
  return String(s)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

const FS = (function () {
  function dir(name, children) {
    return { name, type: "dir", children };
  }
  function file(name, render) {
    return { name, type: "file", render };
  }

  /**
   * Two roles at the same company (or two degrees from one school)
   * would otherwise produce the same filename. Append -2, -3, … so
   * every entry stays reachable by `cat`.
   */
  function uniqueName(name, taken) {
    if (!taken.has(name)) {
      taken.add(name);
      return name;
    }
    const ext = (name.match(/\.[^.]+$/) || [""])[0];
    const base = name.slice(0, name.length - ext.length);
    let n = 2;
    let candidate;
    do {
      candidate = `${base}-${n++}${ext}`;
    } while (taken.has(candidate));
    taken.add(candidate);
    return candidate;
  }

  /* ---- projects/<category>/<id> ---------------------------- */
  const categories = [...new Set(PROJECTS.map((p) => p.category))];
  const projectsDir = dir(
    "projects",
    categories.map((cat) =>
      dir(
        cat,
        PROJECTS.filter((p) => p.category === cat).map((p) =>
          file(p.id, () => projectDetail(p))
        )
      )
    )
  );

  /* ---- experience/ ---------------------------------------- */
  const expTaken = new Set();
  const experienceDir = dir(
    "experience",
    EXPERIENCE.map((e) =>
      file(uniqueName(slug(e.role) + ".txt", expTaken), () =>
        entry({
          name: e.role,
          at: e.company,
          meta: e.period,
          desc: e.desc,
        })
      )
    )
  );

  /* ---- education/ ----------------------------------------- */
  const eduTaken = new Set();
  const educationDir = dir(
    "education",
    EDUCATION.map((e) =>
      file(uniqueName(slug(e.school) + ".txt", eduTaken), () =>
        entry({ name: e.degree, at: e.school, meta: e.year, desc: e.desc })
      )
    )
  );

  /* ---- root ------------------------------------------------ */
  const root = dir("~", [
    file("about.txt", () => COMMANDS.whoami.run([], window.__term)),
    file("skills.txt", () => skillList(SKILLS)),
    file("contact.txt", () => COMMANDS.contact.run([], window.__term)),
    file("resume.pdf", () =>
      raw(
        `Binary file. ${link("Download resume ↗", PROFILE.resume)}`,
        "muted"
      )
    ),
    experienceDir,
    educationDir,
    projectsDir,
  ]);

  /** Children of a directory, dirs first then files, each alphabetical. */
  function list(node) {
    if (!node || node.type !== "dir") return [];
    return [...node.children].sort((a, b) => {
      if (a.type !== b.type) return a.type === "dir" ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
  }

  /**
   * Resolve a path against a stack of directories.
   * Returns { node, stack } or null when the path does not exist.
   * `stack` is the new path stack when the target is a directory.
   */
  function resolve(path, stack) {
    let cur = [...stack];

    const parts = String(path)
      .split("/")
      .filter((p) => p !== "" && p !== ".");

    if (String(path).startsWith("/") || String(path).startsWith("~")) {
      cur = [root];
    }

    for (const part of parts) {
      if (part === "~") {
        cur = [root];
        continue;
      }
      if (part === "..") {
        if (cur.length > 1) cur.pop();
        continue;
      }
      const here = cur[cur.length - 1];
      if (here.type !== "dir") return null;
      const hit = here.children.find((c) => c.name === part);
      if (!hit) return null;
      if (hit.type === "dir") cur.push(hit);
      else return { node: hit, stack: cur };
    }
    return { node: cur[cur.length - 1], stack: cur };
  }

  /** "~/projects/web" for the prompt. */
  function pathString(stack) {
    return stack.map((n) => n.name).join("/").replace(/^~\/?/, "~/").replace(/\/$/, "") || "~";
  }

  /** Recursive tree drawing, returns HTML. */
  function tree(node, prefix = "") {
    const kids = list(node);
    let out = "";
    kids.forEach((k, i) => {
      const last = i === kids.length - 1;
      const branch = last ? "└── " : "├── ";
      const cls = k.type === "dir" ? "dir" : "file";
      const suffix = k.type === "dir" ? "/" : "";
      out +=
        esc(prefix + branch) +
        `<span class="${cls}">${esc(k.name + suffix)}</span>\n`;
      if (k.type === "dir") out += tree(k, prefix + (last ? "    " : "│   "));
    });
    return out;
  }

  /** Every path in the tree, used for TAB completion. */
  function names(stack) {
    return list(stack[stack.length - 1]).map((n) =>
      n.type === "dir" ? n.name + "/" : n.name
    );
  }

  return { root, list, resolve, pathString, tree, names };
})();
