/* ============================================================
   TERMINAL.JS — the shell: welcome screen, input handling,
   history, autocomplete, click-to-run, theme persistence.
   ============================================================ */

(function () {
  "use strict";

  const $ = (sel) => document.querySelector(sel);

  const termEl = $("#term");
  const outEl = $("#output");
  const inputLine = $("#inputline");
  const input = $("#cmdline");
  const ghost = $("#ghost");

  const LS_THEME = "devfolio.theme";
  const LS_MATRIX = "devfolio.matrix";

  /* ---------------------------------------------------------
     the object every command receives
     --------------------------------------------------------- */
  const term = {
    history: [],
    histIndex: 0,
    cwd: null, // set in init(), once FS exists

    print(html, cls) {
      if (!html) return null;
      const div = document.createElement("div");
      div.className = "block" + (cls ? " " + cls : "");
      div.innerHTML = html;
      outEl.appendChild(div);
      scrollDown();
      return div;
    },

    clear() {
      outEl.innerHTML = "";
    },

    top() {
      window.scrollTo(0, 0);
    },

    setTheme(name) {
      document.documentElement.dataset.theme = name;
      MatrixRain.refresh();
      try {
        localStorage.setItem(LS_THEME, name);
      } catch (e) {
        /* private mode — ignore */
      }
    },

    syncPath() {
      $("#p-path").textContent = FS.pathString(this.cwd);
    },

    syncMatrixButton() {
      const on = MatrixRain.isOn();
      $("#matrix-btn").setAttribute("aria-pressed", String(on));
      try {
        localStorage.setItem(LS_MATRIX, on ? "on" : "off");
      } catch (e) {
        /* ignore */
      }
    },

    bannerHTML() {
      const art = PROFILE.bannerArt || asciiBanner(PROFILE.banner);
      return `<pre class="banner">${esc(art)}</pre>`;
    },

    /** Landing screen: banner, welcome line, command table. */
    welcomeHTML() {
      return (
        this.bannerHTML() +
        `<p class="line muted">Welcome to my interactive portfolio.
           <span class="green">Click any command below</span> — or type it at the prompt.</p>` +
        cmdTable(MENU.map((name) => [name, COMMANDS[name].desc])) +
        `<p class="cmdhint">Never used a terminal before? Just click. Every part of
           this site is reachable without typing a single character.</p>`
      );
    },

    run: runCommand,
  };

  // fs.js reaches back for this when rendering about.txt / contact.txt
  window.__term = term;

  /**
   * One module is shown at a time, so every command starts from the
   * top of the page rather than pushing the reader further down.
   */
  function scrollDown() {
    window.scrollTo(0, 0);
    // the card's height changes as the module is swapped; scroll again
    // once that layout has settled so we land exactly at the top
    requestAnimationFrame(() => window.scrollTo(0, 0));
  }

  /** Wipe the previous command's output before the next one renders. */
  function resetModule() {
    outEl.innerHTML = "";
  }

  /* ---------------------------------------------------------
     prompt echo
     --------------------------------------------------------- */
  function promptHTML() {
    return (
      `<span class="p-user">${esc(PROFILE.user)}</span>` +
      `<span class="p-at">@</span>` +
      `<span class="p-host">${esc(PROFILE.host)}</span>` +
      `<span class="p-sep">:</span>` +
      `<span class="p-path">${esc(FS.pathString(term.cwd))}</span>` +
      `<span class="p-dollar">$</span> `
    );
  }

  function echoCommand(rawLine) {
    const div = document.createElement("div");
    div.className = "echo";
    div.innerHTML = promptHTML() + `<span class="cmd">${esc(rawLine)}</span>`;
    outEl.appendChild(div);
  }

  /* ---------------------------------------------------------
     execution
     --------------------------------------------------------- */
  function runCommand(rawLine, opts) {
    const options = opts || {};
    const text = String(rawLine).trim();

    // only one module on screen at a time
    resetModule();

    if (options.echo !== false) echoCommand(text);

    if (!text) {
      scrollDown();
      return;
    }

    if (term.history[term.history.length - 1] !== text) term.history.push(text);
    term.histIndex = term.history.length;

    const parts = text.split(/\s+/);
    const name = parts[0].toLowerCase().replace(/^\//, ""); // `/help` === `help`
    const args = parts.slice(1);

    const cmd = COMMANDS[name];
    if (!cmd) {
      term.print(
        `<p class="line err">command not found: ${esc(name)}</p>` +
          `<p class="line faint">Type <span class="green">help</span> to see what is available.</p>` +
          didYouMean(name)
      );
      return;
    }

    let out = "";
    try {
      out = cmd.run(args, term) || "";
    } catch (err) {
      out = `<p class="line err">${esc(name)}: ${esc(err.message)}</p>`;
    }

    if (out) term.print(out);
    else scrollDown();

    if (name === "resume") window.open(PROFILE.resume, "_blank", "noopener");
  }

  function didYouMean(name) {
    const near = Object.keys(COMMANDS).filter(
      (c) => !COMMANDS[c].hidden && c.startsWith(name.slice(0, 2))
    );
    if (!near.length) return "";
    return `<p class="line faint">Did you mean: ${near
      .map((c) => `<span class="green">${esc(c)}</span>`)
      .join(", ")}?</p>`;
  }

  /* ---------------------------------------------------------
     autocomplete
     --------------------------------------------------------- */
  function candidates(value) {
    const parts = value.split(/\s+/);

    if (parts.length <= 1) {
      const typed = parts[0].replace(/^\//, "").toLowerCase();
      return {
        prefix: parts[0].startsWith("/") ? "/" : "",
        typed: parts[0].replace(/^\//, ""),
        list: Object.keys(COMMANDS).filter((c) => c.startsWith(typed)),
      };
    }

    const cmd = COMMANDS[parts[0].toLowerCase().replace(/^\//, "")];
    const typed = parts[parts.length - 1];
    const pool = cmd && typeof cmd.complete === "function" ? cmd.complete(term) : [];
    return {
      prefix: parts.slice(0, -1).join(" ") + " ",
      typed,
      list: pool.filter((a) => a.toLowerCase().startsWith(typed.toLowerCase())),
    };
  }

  function updateGhost() {
    const value = input.value;
    if (!value) {
      ghost.innerHTML = "";
      return;
    }
    const { prefix, typed, list } = candidates(value);
    const hit = list[0];
    if (!hit || hit === typed) {
      ghost.innerHTML = "";
      return;
    }
    ghost.innerHTML =
      `<span style="color:transparent">${esc(prefix + typed)}</span>` +
      esc(hit.slice(typed.length));
  }

  function doComplete() {
    const value = input.value;
    if (!value.trim()) return;
    const { prefix, typed, list } = candidates(value);
    if (!list.length) return;

    if (list.length === 1) {
      const done = list[0];
      input.value = prefix + done + (done.endsWith("/") ? "" : " ");
    } else {
      let common = list[0];
      list.forEach((c) => {
        while (!c.startsWith(common)) common = common.slice(0, -1);
      });
      input.value = prefix + common;
      if (common === typed) {
        resetModule();
        echoCommand(value);
        term.print(
          `<p class="line muted">${list
            .map((c) => `<span class="green">${esc(c)}</span>`)
            .join("&nbsp;&nbsp;&nbsp;")}</p>`
        );
      }
    }
    updateGhost();
  }

  /* ---------------------------------------------------------
     input events
     --------------------------------------------------------- */
  input.addEventListener("input", updateGhost);

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      const value = input.value;
      input.value = "";
      ghost.innerHTML = "";
      runCommand(value);
      return;
    }

    if (e.key === "Tab") {
      e.preventDefault();
      doComplete();
      return;
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (!term.history.length) return;
      term.histIndex = Math.max(0, term.histIndex - 1);
      input.value = term.history[term.histIndex] || "";
      caretToEnd();
      updateGhost();
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!term.history.length) return;
      term.histIndex = Math.min(term.history.length, term.histIndex + 1);
      input.value = term.history[term.histIndex] || "";
      caretToEnd();
      updateGhost();
      return;
    }

    if (e.ctrlKey && (e.key === "l" || e.key === "L")) {
      e.preventDefault();
      term.clear();
      return;
    }

    if (
      e.ctrlKey &&
      (e.key === "c" || e.key === "C") &&
      !window.getSelection().toString()
    ) {
      e.preventDefault();
      resetModule();
      echoCommand(input.value + "^C");
      input.value = "";
      ghost.innerHTML = "";
      scrollDown();
    }
  });

  function caretToEnd() {
    requestAnimationFrame(() => {
      input.selectionStart = input.selectionEnd = input.value.length;
    });
  }

  /* ---------------------------------------------------------
     click-to-run and focus handling
     --------------------------------------------------------- */
  document.addEventListener("click", (e) => {
    const trigger = e.target.closest("[data-cmd]");
    if (trigger) {
      e.preventDefault();
      runCommand(trigger.dataset.cmd);
      input.focus({ preventScroll: true });
      return;
    }
    if (e.target.closest(".term") && !window.getSelection().toString()) {
      input.focus({ preventScroll: true });
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (document.activeElement === input) return;
    if (e.target.tagName === "BUTTON" || e.target.tagName === "A") return;
    if (e.key.length === 1 || e.key === "Backspace") input.focus({ preventScroll: true });
  });

  $("#matrix-btn").addEventListener("click", () => {
    MatrixRain.toggle();
    term.syncMatrixButton();
  });

  /* ---------------------------------------------------------
     init
     --------------------------------------------------------- */
  function init() {
    term.cwd = [FS.root];

    // restore preferences — the rain stays off until someone asks for it
    let matrixOn = false;
    try {
      const savedTheme = localStorage.getItem(LS_THEME);
      if (savedTheme && THEMES.includes(savedTheme)) {
        document.documentElement.dataset.theme = savedTheme;
      }
      matrixOn = localStorage.getItem(LS_MATRIX) === "on";
    } catch (e) {
      /* private mode — keep defaults */
    }

    // wire identity into the chrome
    document.title = `${PROFILE.name} | ${PROFILE.title}`;
    $("#tb-title").textContent = `${PROFILE.user}@${PROFILE.host}: — bash`;
    $("#pf-initials").textContent = PROFILE.initials;
    $("#pf-name").textContent = PROFILE.name;
    $("#pf-title").textContent = PROFILE.title;
    $("#pf-github").textContent = PROFILE.github;
    $("#pf-github").href = PROFILE.githubUrl;
    $("#pf-location").textContent = PROFILE.location;
    $("#pf-resume").href = PROFILE.resume;
    $("#p-user").textContent = PROFILE.user;
    $("#p-host").textContent = PROFILE.host;
    $("#ft-year").textContent = new Date().getFullYear();
    $("#ft-brand").textContent = PROFILE.footerBrand;
    $("#ft-by").textContent = PROFILE.footerBy;
    term.syncPath();

    if (matrixOn) MatrixRain.start();
    term.syncMatrixButton();

    // the masthead never gets cleared — it is how visitors navigate
    $("#masthead").innerHTML = term.welcomeHTML();
    inputLine.hidden = false;
    input.focus({ preventScroll: true });

    // deep link: index.html#skills runs `skills` on load
    const hash = location.hash.replace(/^#/, "").trim();
    if (hash && COMMANDS[hash.split(/[\s-]/)[0]]) runCommand(hash.replace(/-/g, " "));
  }

  init();
})();
