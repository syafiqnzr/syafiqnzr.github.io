/* ============================================================
   MATRIX.JS — falling character rain behind the terminal.

   The trail is faded with `destination-out` rather than by
   painting the background colour, so the same code works on
   every palette including the light one.
   ============================================================ */

const MatrixRain = (function () {
  const canvas = document.getElementById("matrix");
  const ctx = canvas ? canvas.getContext("2d") : null;

  // Binary rain. Swap this string for any character set you like —
  // e.g. "0123456789ABCDEF" for hex, or "</>{}[]$#" for code symbols.
  const CHARS = "01";

  const FONT_SIZE = 15;
  const FRAME_SKIP = 2; // draw every Nth frame — slower, calmer rain

  let cols = 0;
  let drops = [];
  let colour = "#3bde77";
  let raf = null;
  let tick = 0;
  let running = false;

  function readColour() {
    colour =
      getComputedStyle(document.documentElement)
        .getPropertyValue("--rain")
        .trim() || "#3bde77";
  }

  function resize() {
    if (!canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(window.innerWidth * dpr);
    canvas.height = Math.floor(window.innerHeight * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    cols = Math.ceil(window.innerWidth / FONT_SIZE);
    drops = new Array(cols)
      .fill(0)
      .map(() => Math.random() * -60); // stagger the starting heights
  }

  function frame() {
    raf = requestAnimationFrame(frame);
    tick++;
    if (tick % FRAME_SKIP) return;

    const w = window.innerWidth;
    const h = window.innerHeight;

    // fade the previous frame toward transparent
    ctx.globalCompositeOperation = "destination-out";
    ctx.fillStyle = "rgba(0,0,0,0.09)";
    ctx.fillRect(0, 0, w, h);

    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = colour;
    ctx.font = FONT_SIZE + "px 'JetBrains Mono', monospace";

    for (let i = 0; i < cols; i++) {
      const ch = CHARS[(Math.random() * CHARS.length) | 0];
      const y = drops[i] * FONT_SIZE;
      if (y > 0) ctx.fillText(ch, i * FONT_SIZE, y);

      if (y > h && Math.random() > 0.975) drops[i] = 0;
      else drops[i]++;
    }
  }

  function start() {
    if (!ctx || running) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    running = true;
    canvas.hidden = false;
    readColour();
    resize();
    frame();
  }

  function stop() {
    if (!ctx) return;
    running = false;
    if (raf) cancelAnimationFrame(raf);
    raf = null;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    canvas.hidden = true;
  }

  window.addEventListener("resize", () => {
    if (running) resize();
  });

  return {
    start,
    stop,
    toggle() {
      running ? stop() : start();
      return running;
    },
    isOn: () => running,
    /** call after a theme change so the rain picks up the new colour */
    refresh: readColour,
  };
})();
