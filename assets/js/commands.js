/* ============================================================
   COMMANDS.JS — every command the terminal understands.
   Each entry: { desc, hidden?, complete?, run(args, term) }
   `run` returns an HTML string to print, or "" to print nothing.
   ============================================================ */

const THEMES = ["github", "dracula", "hacker", "mono", "light"];

/**
 * The menu — the only commands advertised in `help` and on the welcome
 * screen. Everything else below still works when typed, it just is not
 * put in front of visitors. Add or remove a name here to change both
 * lists at once.
 */
const MENU = ["whoami", "project", "skills", "experience", "education", "contact"];

const COMMANDS = {
  /* ================= core ================= */

  help: {
    desc: "Show all available commands",
    run() {
      return (
        h("commands") +
        cmdTable(MENU.map((name) => [name, COMMANDS[name].desc])) +
        `<p class="cmdhint">Click a row to run it, or type the name yourself.</p>` +
        `<p class="line faint">Shell commands work too, if you want them:
           <span class="green">ls</span>,
           <span class="green">tree</span>,
           <span class="green">cd</span>,
           <span class="green">cat</span>,
           <span class="green">resume</span>,
           <span class="green">theme</span>,
           <span class="green">matrix</span>,
           <span class="green">clear</span>.
           <span class="green">TAB</span> autocompletes, <span class="green">↑ ↓</span> walks history.
         </p>`
      );
    },
  },

  whoami: {
    desc: "Display bio & contact info",
    run() {
      return (
        h("whoami") +
        kv([
          ["name", `<span class="green">${esc(PROFILE.name)}</span>`],
          ["role", esc(PROFILE.title)],
          ["location", esc(PROFILE.location)],
          ["email", link(PROFILE.email, "mailto:" + PROFILE.email)],
          ["status", `<span class="yellow">${esc(PROFILE.status)}</span>`],
        ]) +
        `<p class="entry__desc" style="margin-top:12px">${esc(PROFILE.bio)}</p>` +
        `<p class="line faint" style="margin-top:8px">Interests: ${esc(
          PROFILE.interests.join(", ")
        )}</p>` +
        actions([
          runBtn("projects", "project"),
          runBtn("skills", "skills"),
          runBtn("experience", "experience"),
          runBtn("contact", "contact"),
        ])
      );
    },
  },

  project: {
    desc: "View portfolio projects",
    run(args) {
      const id = (args[0] || "").toLowerCase();
      if (!id) {
        return (
          h(`projects (${PROJECTS.length})`) +
          PROJECTS.map(projectRow).join("") +
          `<p class="line faint">Run <span class="green">project &lt;id&gt;</span> for the full breakdown &mdash; ids: ${PROJECTS.map(
            (p) => esc(p.id)
          ).join(", ")}</p>`
        );
      }
      const proj = PROJECTS.find((p) => p.id === id);
      if (!proj) {
        return (
          `<p class="line err">project: no such project: ${esc(id)}</p>` +
          `<p class="line faint">Available: ${PROJECTS.map((p) => esc(p.id)).join(
            ", "
          )}</p>`
        );
      }
      return projectDetail(proj);
    },
    complete: () => PROJECTS.map((p) => p.id),
  },

  skills: {
    desc: "View technical skills",
    run() {
      return h("skills") + skillList(SKILLS);
    },
  },

  experience: {
    desc: "Show work history",
    run() {
      return (
        h("experience") +
        EXPERIENCE.map((e) =>
          entry({ name: e.role, at: e.company, meta: e.period, desc: e.desc })
        ).join("")
      );
    },
  },

  education: {
    desc: "Show degrees and certifications",
    run() {
      return (
        h("education") +
        EDUCATION.map((e) =>
          entry({ name: e.degree, at: e.school, meta: e.year, desc: e.desc })
        ).join("")
      );
    },
  },

  blog: {
    desc: "Read my writing",
    run() {
      if (!POSTS || !POSTS.length) return line("No posts yet.", "faint");
      return h("blog") + postList(POSTS);
    },
  },

  contact: {
    desc: "Get in touch",
    run() {
      return (
        h("contact") +
        line(
          PROFILE.status +
            ". Email is the fastest way to reach me — I usually reply within a day."
        ) +
        kv(
          PROFILE.socials.map((s) => [s.label.toLowerCase(), link(s.handle, s.url)])
        )
      );
    },
  },

  resume: {
    desc: "Open my resume",
    run() {
      return (
        line("Opening resume in a new tab…") +
        actions([linkBtn("resume.pdf ↗", PROFILE.resume)]) +
        `<p class="line faint" style="margin-top:8px">Not there yet? Drop your PDF at <span class="green">${esc(
          PROFILE.resume
        )}</span>.</p>`
      );
    },
  },

  /* ================= file system ================= */

  ls: {
    desc: "List directory contents",
    run(args, term) {
      const target = args.find((a) => !a.startsWith("-")) || ".";
      const hit = FS.resolve(target, term.cwd);
      if (!hit) return `<p class="line err">ls: ${esc(target)}: No such file or directory</p>`;
      if (hit.node.type === "file") return line(hit.node.name, "file");
      return lsGrid(FS.list(hit.node));
    },
    complete: (term) => FS.names(term.cwd),
  },

  tree: {
    desc: "Show the directory tree",
    run(args, term) {
      const target = args[0] || ".";
      const hit = FS.resolve(target, term.cwd);
      if (!hit || hit.node.type !== "dir")
        return `<p class="line err">tree: ${esc(target)}: Not a directory</p>`;
      return (
        `<pre class="tree"><span class="dir">${esc(
          FS.pathString(hit.stack)
        )}</span>\n${FS.tree(hit.node)}</pre>`
      );
    },
    complete: (term) => FS.names(term.cwd),
  },

  cd: {
    desc: "Change directory",
    run(args, term) {
      const target = args[0] || "~";
      const hit = FS.resolve(target, term.cwd);
      if (!hit) return `<p class="line err">cd: ${esc(target)}: No such file or directory</p>`;
      if (hit.node.type === "file") {
        // `cd` onto a file is a common slip — just show the file
        return (
          `<p class="line faint">cd: ${esc(hit.node.name)}: Not a directory — showing it instead</p>` +
          hit.node.render()
        );
      }
      term.cwd = hit.stack;
      term.syncPath();
      return "";
    },
    complete: (term) => FS.names(term.cwd).filter((n) => n.endsWith("/")),
  },

  cat: {
    desc: "Read a file — cat about.txt",
    run(args, term) {
      const target = args[0];
      if (!target) return `<p class="line err">cat: missing operand</p>`;
      const hit = FS.resolve(target, term.cwd);
      if (!hit) return `<p class="line err">cat: ${esc(target)}: No such file or directory</p>`;
      if (hit.node.type === "dir")
        return `<p class="line err">cat: ${esc(target)}: Is a directory</p>`;
      return hit.node.render();
    },
    complete: (term) => FS.names(term.cwd).filter((n) => !n.endsWith("/")),
  },

  pwd: {
    desc: "Print the current directory",
    hidden: true,
    run(args, term) {
      return line(FS.pathString(term.cwd), "blue");
    },
  },

  /* ================= appearance ================= */

  theme: {
    desc: "Change the colour palette — theme dracula",
    run(args, term) {
      const name = (args[0] || "").toLowerCase();
      if (!name) {
        const current = document.documentElement.dataset.theme;
        return (
          line(`Current theme: ${current}`) +
          actions(THEMES.map((t) => runBtn(t === current ? t + " *" : t, "theme " + t)))
        );
      }
      if (!THEMES.includes(name)) {
        return (
          `<p class="line err">theme: unknown theme: ${esc(name)}</p>` +
          `<p class="line faint">Available: ${THEMES.join(", ")}</p>`
        );
      }
      term.setTheme(name);
      return `<p class="line green">Theme set to ${esc(name)}.</p>`;
    },
    complete: () => THEMES,
  },

  matrix: {
    desc: "Toggle the falling code animation",
    run(args, term) {
      const on = MatrixRain.toggle();
      term.syncMatrixButton();
      return `<p class="line green">Matrix rain ${on ? "enabled" : "disabled"}.</p>`;
    },
  },

  banner: {
    desc: "Reprint the banner",
    run(args, term) {
      return term.bannerHTML();
    },
  },

  neofetch: {
    desc: "System information",
    run(args, term) {
      const logo = asciiBanner(PROFILE.initials);
      return `<div style="display:flex;gap:24px;flex-wrap:wrap;align-items:flex-start">
        <pre class="banner" style="font-size:clamp(5px,1vw,9px);margin:0">${esc(logo)}</pre>
        <div style="flex:1;min-width:230px">${kv([
          ["user", `${esc(PROFILE.user)}@${esc(PROFILE.host)}`],
          ["os", "WebOS 1.0 (static)"],
          ["shell", "devfolio-sh 2.0"],
          ["role", esc(PROFILE.title)],
          ["location", esc(PROFILE.location)],
          ["projects", String(PROJECTS.length)],
          ["theme", esc(document.documentElement.dataset.theme)],
        ])}</div>
      </div>`;
    },
  },

  /* ================= shell odds and ends ================= */

  home: {
    desc: "Return to the start screen",
    run(args, term) {
      // clearing also removes the echo line this command just printed,
      // leaving nothing but the masthead — the true start screen
      term.clear();
      term.cwd = [FS.root];
      term.syncPath();
      term.top();
      return "";
    },
  },

  clear: {
    desc: "Clear the screen",
    run(args, term) {
      term.clear();
      return "";
    },
  },

  history: {
    desc: "Show command history",
    hidden: true,
    run(args, term) {
      if (!term.history.length) return line("No history yet.", "faint");
      return `<pre class="pre muted">${term.history
        .map((c, i) => `${String(i + 1).padStart(3)}  ${esc(c)}`)
        .join("\n")}</pre>`;
    },
  },

  date: {
    desc: "Print the current date",
    hidden: true,
    run: () => line(new Date().toString(), "muted"),
  },

  echo: {
    desc: "Print text back",
    hidden: true,
    run: (args) => line(args.join(" "), "fg"),
  },

  /* ================= easter eggs ================= */

  sudo: {
    desc: "Elevate privileges",
    hidden: true,
    run: () =>
      `<p class="line err">${esc(
        PROFILE.user
      )} is not in the sudoers file. This incident has been reported.</p>`,
  },

  rm: {
    desc: "Remove files",
    hidden: true,
    run(args) {
      if (args.join(" ").includes("-rf")) {
        return (
          `<p class="line err">rm: it is a static site. There is nothing here to delete.</p>` +
          `<p class="line faint">Nice try though.</p>`
        );
      }
      return `<p class="line err">rm: permission denied</p>`;
    },
  },

  coffee: {
    desc: "Brew coffee",
    hidden: true,
    run: () => `<p class="line yellow">HTTP 418 — I'm a teapot.</p>`,
  },

  exit: {
    desc: "Close the session",
    hidden: true,
    run: () =>
      `<p class="line muted">There is no exit. Try <span class="green">contact</span> instead.</p>`,
  },
};
