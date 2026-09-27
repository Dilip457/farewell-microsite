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

## How the identity gate works

Everyone receives the **same link**. On open, the site asks *"Which one
are you?"* — each colleague picks their own name (with an optional search
box), and from then on the page shows **only their card and their note**.
No passwords, no per-person links, nothing to distribute.

- The choice is remembered for the browser session (refresh keeps it);
  a small “Not you? Switch person” link sits in the footer.
- **Optional soft verification:** in `src/data/colleagues.js` you can add
  `pin` + `pinHint` per person (e.g. last 4 digits of their phone —
  something they already know). If set, the gate asks that one question
  before opening their note. Nothing is ever sent to them.

> Note: GitHub Pages is static hosting, so this is a friendly privacy
> gate, not cryptographic security — a determined person could inspect
> the source. For a farewell among colleagues that is normally exactly
> the right trade-off.

## Author preview — reviewing every note

To see **all cards at once** (skip the gate), append `#preview` to the
site URL — a fragment known only to the author and never sent to anyone:

```
https://<your-site>/#preview
```

This shows the full grid of every colleague card; open each to review its
note. An “Exit author preview” link sits in the footer. Visitors using the
plain link are unaffected.

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
