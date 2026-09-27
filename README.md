# Before I Sign Off — Cinematic Farewell Microsite

A premium, cinematic, interactive farewell microsite built as a digital memory
book: an atmospheric dark environment, floating glass colleague cards with 3D
tilt and cursor-following light, and a full-screen "personal note" modal for
every person.

## Tech

- **React 18 + Vite** — build tooling
- **Tailwind CSS** — styling
- **Framer Motion** — cinematic entrance, scroll choreography, modal transitions
- **Canvas 2D** — layered particle / dust field
- CSS 3D transforms — card tilt, modal depth, parallax

## Editing the content

Everything is data-driven. Open [`src/data/colleagues.js`](src/data/colleagues.js)
to change names, personal messages, ordering or per-card accent
(`blue` / `violet` / `pink`). Cards and modals are generated automatically from
that list — no component edits needed.

## Local development

```bash
npm install
npm run dev      # start dev server
npm run build    # production build to dist/
npm run preview  # preview the production build
```

## Deployment (GitHub Pages)

The repo ships with a GitHub Actions workflow (`.github/workflows/deploy.yml`)
that builds the site and publishes it to GitHub Pages on every push to `main`.

To enable it: repo **Settings → Pages → Build and deployment → Source:
GitHub Actions**.

The Vite `base` is set to `./` so the build works from any subpath.
