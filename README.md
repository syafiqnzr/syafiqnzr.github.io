# syafiqnzr.github.io

GitHub Pages user site. Two portfolios live here — GitHub Pages serves the
whole repository, so a folder becomes a path.

| Path | Site | Source |
| --- | --- | --- |
| `/` | Platform Engineer portfolio | Built from the Laravel project in `devops-portfolio` |
| `/terminal` | Interactive terminal portfolio | Lives here, in `terminal/` |

```
index.html      the main site — GENERATED, do not edit by hand
.nojekyll       serve files untouched, no Jekyll pass
terminal/       the terminal portfolio, edited directly
└── assets/
```

## Updating the main site (`/`)

`index.html` at the root is build output. Editing it here gets overwritten.
Edit the Blade template in the `devops-portfolio` project instead, then:

```bash
php artisan site:build --output=../portfolio
```

That rewrites `index.html` and `.nojekyll` in this repo. Commit and push.

## Updating the terminal site (`/terminal`)

Edit `terminal/assets/js/data.js` — all of its content lives there. See
`terminal/README.md` for the full guide. No build step; commit and push.

## Deploying

Pushing to `main` is the deploy. Pages is configured as **Deploy from a
branch → main → / (root)**, and picks up changes within a minute or two.
