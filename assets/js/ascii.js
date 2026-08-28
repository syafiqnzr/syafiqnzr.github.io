/* ============================================================
   ASCII.JS — figlet "Standard" font, the classic banner look.

   Each glyph is 5 rows. Rows inside a glyph are padded to that
   glyph's own width at render time, so small width slips in the
   data below cannot break the alignment of the whole banner.

   Want a different font? Generate the art at patorjk.com and
   paste it into PROFILE.bannerArt in data.js — that overrides
   this font completely.
   ============================================================ */

const FIGLET = {
  A: ["     _    ", "    / \\   ", "   / _ \\  ", "  / ___ \\ ", " /_/   \\_\\"],
  B: ["  ____  ", " | __ ) ", " |  _ \\ ", " | |_) |", " |____/ "],
  C: ["   ____ ", "  / ___|", " | |    ", " | |___ ", "  \\____|"],
  D: ["  ____  ", " |  _ \\ ", " | | | |", " | |_| |", " |____/ "],
  E: ["  _____ ", " | ____|", " |  _|  ", " | |___ ", " |_____|"],
  F: ["  _____ ", " |  ___|", " | |_   ", " |  _|  ", " |_|    "],
  G: ["   ____ ", "  / ___|", " | |  _ ", " | |_| |", "  \\____|"],
  H: ["  _   _ ", " | | | |", " | |_| |", " |  _  |", " |_| |_|"],
  I: ["  ___ ", " |_ _|", "  | | ", "  | | ", " |___|"],
  J: ["      _ ", "      | |", "  _   | |", " | |__| |", "  \\____/ "],
  K: ["  _  __", " | |/ /", " | ' / ", " | . \\ ", " |_|\\_\\"],
  L: ["  _     ", " | |    ", " | |    ", " | |___ ", " |_____|"],
  M: ["  __  __ ", " |  \\/  |", " | |\\/| |", " | |  | |", " |_|  |_|"],
  N: ["  _   _ ", " | \\ | |", " |  \\| |", " | |\\  |", " |_| \\_|"],
  O: ["   ___  ", "  / _ \\ ", " | | | |", " | |_| |", "  \\___/ "],
  P: ["  ____  ", " |  _ \\ ", " | |_) |", " |  __/ ", " |_|    "],
  Q: ["   ___  ", "  / _ \\ ", " | | | |", " | |_| |", "  \\__\\_\\"],
  R: ["  ____  ", " |  _ \\ ", " | |_) |", " |  _ < ", " |_| \\_\\"],
  S: ["  ____  ", " / ___| ", " \\___ \\ ", "  ___) |", " |____/ "],
  T: ["  _____ ", " |_   _|", "   | |  ", "   | |  ", "   |_|  "],
  U: ["  _   _ ", " | | | |", " | | | |", " | |_| |", "  \\___/ "],
  V: [" __     __", " \\ \\   / /", "  \\ \\ / / ", "   \\ V /  ", "    \\_/   "],
  W: [" __        __", " \\ \\      / /", "  \\ \\ /\\ / / ", "   \\ V  V /  ", "    \\_/\\_/   "],
  X: [" __  __", " \\ \\/ /", "  \\  / ", "  /  \\ ", " /_/\\_\\"],
  Y: [" __   __", " \\ \\ / /", "  \\ V / ", "   | |  ", "   |_|  "],
  Z: ["  _____", " |__  /", "   / / ", "  / /_ ", " /____|"],

  0: ["   ___  ", "  / _ \\ ", " | | | |", " | |_| |", "  \\___/ "],
  1: ["  _ ", " / |", " | |", " | |", " |_|"],
  2: ["  ____  ", " |___ \\ ", "   __) |", "  / __/ ", " |_____|"],
  3: ["  _____ ", " |___ / ", "   |_ \\ ", "  ___) |", " |____/ "],
  4: ["  _  _   ", " | || |  ", " | || |_ ", " |__   _|", "    |_|  "],
  5: ["  ____  ", " | ___| ", " |___ \\ ", "  ___) |", " |____/ "],
  6: ["   __   ", "  / /_  ", " | '_ \\ ", " | (_) |", "  \\___/ "],
  7: ["  _____ ", " |___  |", "    / / ", "   / /  ", "  /_/   "],
  8: ["   ___  ", "  ( _ ) ", "  / _ \\ ", " | (_) |", "  \\___/ "],
  9: ["   ___  ", "  / _ \\ ", " | (_) |", "  \\__, |", "    /_/ "],

  " ": ["    ", "    ", "    ", "    ", "    "],
  ".": ["    ", "    ", "    ", "  _ ", " (_)"],
  "-": ["       ", "       ", "  ____ ", " |____|", "       "],
  _: ["        ", "        ", "        ", "  _____ ", " |_____|"],
};

const FIGLET_ROWS = 5;

/**
 * Render `text` as figlet "Standard" art.
 * Unknown characters are skipped; lowercase is folded to uppercase.
 */
function asciiBanner(text) {
  const glyphs = String(text)
    .toUpperCase()
    .split("")
    .map((c) => FIGLET[c])
    .filter(Boolean);

  if (!glyphs.length) return "";

  // pad every row of a glyph to that glyph's widest row
  const padded = glyphs.map((g) => {
    const w = Math.max(...g.map((r) => r.length));
    return g.map((r) => r.padEnd(w, " "));
  });

  const rows = [];
  for (let r = 0; r < FIGLET_ROWS; r++) {
    rows.push(padded.map((g) => g[r]).join(""));
  }
  return rows.join("\n");
}

/** How many characters wide `text` would render. Used for responsive sizing. */
function asciiWidth(text) {
  const first = asciiBanner(text).split("\n")[0];
  return first ? first.length : 0;
}
