# Terminal Portfolio

An interactive terminal portfolio. Visitors type commands to explore —
`whoami`, `project`, `skills`, `ls`, `cat about.txt` — in a virtual file
system that behaves like a real shell.

Built as plain HTML, CSS and JavaScript. No build step, no dependencies,
no framework. Open `index.html` and it runs.

> Design follows [sk-terminal-portfolio](https://github.com/sathishk-dev/terminal-portfolio),
> rebuilt in vanilla JS so it can be served straight from a git repo
> without a Node toolchain.

## Files

```
index.html            window chrome: title bar, profile header, prompt, footer
assets/css/style.css  all styling; the five palettes are CSS variables at the top
assets/js/data.js     >>> YOUR CONTENT LIVES HERE <<<
assets/js/ascii.js    figlet "Standard" font for the banner
assets/js/matrix.js   the falling code animation behind the window
assets/js/render.js   HTML builders (entries, skill bars, stat strips)
assets/js/fs.js       virtual file system built from your data
assets/js/commands.js every command the terminal understands
assets/js/terminal.js the shell engine: input, history, autocomplete
```

## Editing content

Everything visible comes from `assets/js/data.js`:

| Constant | What it controls |
| --- | --- |
| `PROFILE` | name, initials, title, github, location, bio, resume path, banner word, socials, footer |
| `SKILLS` | skill groups; `percent` drives the ASCII bar |
| `EXPERIENCE` | work history |
| `EDUCATION` | degrees and certifications |
| `PROJECTS` | projects; `id` powers `project <id>` and `cd <id>`, `category` groups them in `ls` |
| `POSTS` | blog links (delete the array if you do not blog) |

Change a value, save, refresh. That is the whole workflow.

### The banner

`PROFILE.banner` is drawn with a built-in figlet "Standard" font covering
A–Z, 0–9, space, `.`, `-` and `_`. Lowercase is folded to uppercase.
Short words look best — eight characters or fewer.

Want a different font or mixed case? Generate the art at
[patorjk.com](https://patorjk.com/software/taag/) and set
`PROFILE.bannerArt` to that string — it overrides the built-in font.

### The file system

`assets/js/fs.js` builds the tree from your data automatically:

```
~
├── education/          one .txt per entry in EDUCATION
├── experience/         one .txt per entry in EXPERIENCE
├── projects/           grouped by each project's `category`
│   ├── web/
│   ├── tools/
│   └── mobile/
├── about.txt
├── contact.txt
├── resume.pdf
└── skills.txt
```

Add a project with `category: "games"` and a `games/` directory appears.
Nothing to wire up by hand.

## Commands

| Command | What it does |
| --- | --- |
| `help` | list every command (`/help` works too) |
| `whoami` | bio and contact info |
| `project [id]` | all projects, or one in detail |
| `skills` | technical skills with ASCII bars |
| `experience` · `education` | work history and degrees |
| `blog` | writing |
| `contact` · `resume` | how to reach me, resume download |
| `ls` · `tree` · `cd` · `cat` · `pwd` | move around the file system |
| `theme [name]` | github · dracula · hacker · mono · light |
| `matrix` | toggle the falling code animation |
| `banner` · `neofetch` · `home` · `clear` | chrome and housekeeping |

Hidden extras: `history`, `date`, `echo`, `sudo`, `rm -rf /`, `coffee`, `exit`.

Keyboard: `TAB` autocompletes commands, project ids, theme names and file
paths; `↑`/`↓` walk history; `Ctrl+L` clears; `Ctrl+C` cancels the line.

Deep links work — `index.html#skills` runs `skills` on load.

### Adding a command

In `assets/js/commands.js`:

```js
uses: {
  desc: "What I build with",
  run() {
    return h("uses") + line("14\" MacBook Pro, Neovim, Ghostty.");
  },
},
```

It appears in `help` and in TAB completion automatically. Add
`hidden: true` to keep it out of `help`.

## Themes

Five palettes: `github` (default), `dracula`, `hacker`, `mono`, `light`.
Visitors switch with `theme dracula`; the choice persists in
`localStorage`, and the matrix rain recolours with it.

To add one: copy a `:root[data-theme="..."]` block in `style.css` and add
its name to `THEMES` in `commands.js`.

## Running locally

Any static server works:

```bash
npx serve .
```

Opening `index.html` directly from disk works too, in most browsers.

## Deploying to GitHub Pages

```bash
git init && git add -A && git commit -m "Initial portfolio"
```

Create an empty repo on GitHub, then:

```bash
git remote add origin https://github.com/YOURNAME/YOURNAME.github.io.git && git branch -M main && git push -u origin main
```

In the repo: **Settings → Pages → Source: Deploy from a branch → main / (root)**.

Naming the repo `YOURNAME.github.io` publishes at `https://YOURNAME.github.io`.
Any other name publishes at `https://YOURNAME.github.io/REPO-NAME/` — every
path in the site is relative, so a subdirectory works fine.

`.nojekyll` is already committed so GitHub serves the files untouched.

## Before going live

- [ ] Replace every placeholder in `assets/js/data.js`
- [ ] Drop your PDF at `assets/resume.pdf` (or change `PROFILE.resume`)
- [ ] Update the `<title>` and `og:` meta tags in `index.html`
- [ ] Check the social URLs actually resolve

## Not carried over from the reference

The original has a few things that need a backend or a build step:

- **Snake and tic-tac-toe games** — pure client-side, could be added later.
- **Cloud leaderboard** (Supabase) — needs a database and API keys.
- **Contact form** (Formspree) — this build uses a `mailto:` link instead,
  so there is no third-party dependency and no key to leak.
