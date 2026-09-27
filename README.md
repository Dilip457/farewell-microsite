# Before I Sign Off — Cinematic Farewell Microsite

A premium, cinematic, interactive farewell microsite built as a digital memory
book: an atmospheric dark environment, floating glass colleague cards with 3D
tilt and cursor-following light, and a full-screen "personal note" modal for
every person.

**Live site:** https://dilip457.github.io/farewell-microsite/

## Tech

- **React 18 + Vite** — build tooling
- **Tailwind CSS** — styling
- **Framer Motion** — cinematic entrance, scroll choreography, modal transitions
- **Canvas 2D** — layered particle / dust field
- CSS 3D transforms — card tilt, modal depth, parallax

---

## Project structure — what each file does

```text
farewell-microsite/
│
├── index.html
│      The app shell. Loads the Inter font, sets the page title/meta,
│      favicon, and provides the #root element React mounts into.
│
├── vite.config.js
│      Build configuration: React plugin + `base: "./"` so the production
│      build works when hosted from a subpath (GitHub Pages).
│
├── tailwind.config.js / postcss.config.js
│      Tailwind CSS wiring (content paths, autoprefixer).
│
├── package.json
│      Dependencies and scripts — `npm run dev` (local server),
│      `npm run build` (production build), `npm run preview`.
│
├── .github/workflows/deploy.yml
│      CI/CD. On every push to `main`: installs dependencies, builds the
│      site, and publishes it to GitHub Pages. No manual deployment.
│
└── src/
   │
   ├── main.jsx
   │      React entry point. Imports the stylesheet and mounts <App />
   │      into index.html's #root. Nothing else lives here.
   │
   ├── index.css
   │      The design system. Global Tailwind import plus every custom
   │      visual: editorial typography (.hero-title, .section-label),
   │      glass cards (.glass-card, tints, cursor light, "View note"
   │      reveal), background layers (.orb, .light-leak, .grain,
   │      .vignette), modal styling (.modal-panel, .accent-line,
   │      .pill-button), keyframe animations, and the
   │      prefers-reduced-motion overrides.
   │
   ├── App.jsx
   │      The orchestrator. Owns the three app states —
   │        1. no identity yet  → shows <IdentityGate />
   │        2. identity chosen  → shows the personalized experience
   │        3. #preview in URL  → shows the author preview (all cards)
   │      Handles sessionStorage persistence (refresh keeps the chosen
   │      person), the #preview hash routing, and mounts the shared
   │      background + note modal around whichever view is active.
   │
   ├── data/
   │   └── colleagues.js
   │        THE content file. Author details + the full list of people:
   │        names, personal messages, card numbers, accent colors
   │        (blue/violet/pink) and optional `pin`/`pinHint` soft
   │        verification. Every card, gate chip and modal in the UI is
   │        generated from this list — edit this file to change the site.
   │
   └── components/
       │
       ├── CinematicBackground.jsx
       │      The fixed, always-running atmosphere behind everything:
       │      near-black base gradient → drifting blue/violet orbs →
       │      cinematic light leaks → canvas particle field (depth layers,
       │      pauses while a modal is open for performance) → cursor glow
       │      → film grain → vignette. Purely decorative, aria-hidden.
       │
       ├── IdentityGate.jsx
       │      The entry screen ("Which one are you?"). Searchable list of
       │      names from colleagues.js; if a person has a `pin`, asks that
       │      one question before continuing. Calls onIdentify(person)
       │      on success — no credentials ever sent to anyone.
       │
       ├── HeroSection.jsx
       │      Section 01: "Before I Sign Off." Oversized editorial
       │      heading, intro paragraph, scroll indicator. Handles the
       │      cinematic blur-rise entrance and the scroll-driven parallax
       │      (hero drifts up, scales down, fades as you scroll away).
       │
       ├── PeopleSection.jsx
       │      Section 02, with two modes:
       │        - default: the personalized reveal — shows ONE featured
       │          card for the chosen identity ("A few words, for you, X.")
       │        - preview mode: the full grid of every colleague card,
       │          for the author to review all notes
       │
       ├── PersonCard.jsx
       │      One glass tile. 3D tilt (±4°) following the cursor,
       │      spring-smoothed; soft light that tracks the cursor inside
       │      the card; hover lift + "View note" reveal; keyboard focus
       │      mirrors hover. `featured` variant = the single personalized
       │      card ("Open your note", no sequence number).
       │
       └── PersonalNoteModal.jsx
            The emotional centerpiece. Full-screen glass modal with 3D
            entrance (scale + depth), cyan accent line, the personal
            message, and four ways to close (X, Close button, Escape,
            click-outside). Owns the page scroll lock, Escape handling
            and focus management (focus moves into the modal and returns
            to the card on close).
```

## How the flow works

**What a colleague experiences (the plain link):**

```text
open the shared link
   ↓
CinematicBackground is running behind everything
   ↓
IdentityGate — "Which one are you?"  (search + pick their name,
optional pin if you set one)
   ↓
choice saved to sessionStorage  (refresh keeps it)
   ↓
HeroSection — "Before I Sign Off." entrance + scroll parallax
   ↓
PeopleSection — "A few words, for you, <first name>."
   ↓
their ONE featured card → click → PersonalNoteModal
   ↓
their personal message → close (X / button / Escape / click-outside)
   ↓
closing footer — "With appreciation — Dilip Sanjay"
```

**What you experience (the `#preview` link):**

Same, but the gate is skipped and PeopleSection renders the full grid of
every colleague card, so you can open and review each note. An "Exit author
preview" link sits in the footer.

**How the code flows:** `main.jsx` mounts `App.jsx` → App reads
`sessionStorage` and the URL hash to decide between Gate / Experience /
Preview → `CinematicBackground` renders behind all three → the gate calls
`onIdentify(person)` with an entry from `colleagues.js` → App stores the
identity and renders `HeroSection` + `PeopleSection` (single-card mode) →
a card click opens `PersonalNoteModal` with that person's message → the
"Switch person" / "Exit preview" footer links reset the state.

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
