# CADA Referral Deck

Two parallel builds from one source of copy: the shipped static page, and a React version inside SlideForge for editing and preview.

## 1. The static page (the deliverable)

A single self-contained HTML file, no build step, no framework, no runtime dependencies — exactly as the handoff specifies.

```text
public/
  welcome/
    assets/
      austin-advisory.webp
      toys2000.webp
      combyne.webp
      grove.webp
    ed/
      index.html        -> served at /welcome/ed/
```

Nested directories, so all four image paths are absolute (`/welcome/assets/…`). One copy of the images serves every referrer page. Creating referrer #2 is: copy `ed/` to `<slug>/`, edit the `REFERRER` object and the cover subline. Nothing else.

The file contains everything from the handoff: the ten slides, the inline `<use href="#cada">` SVG symbol at `fill="currentColor"`, the Inter / Inter Tight preconnect load, the token set (`--paper`, `--void`, `--ink`, `--accent`, `--mute`, `--mute-inv`), keyboard + click + swipe navigation, the fixed progress bar, per-slide `data-theme` driving `body.dark`, and the `prefers-reduced-motion` kill switch.

Copy goes in verbatim from the copy document. The three accuracy tags on slide 7 — Live, Live, Design delivered, Our concept — and Ed's slide 9 quote are treated as fixed text.

CTA is `tel:+13053025662` with the email as the secondary line.

No Figma iframe anywhere.

### Images

Processing your uploads into the four tiles: cropped to 16:10, resized to 1280x800, exported as WebP at quality 85, written to `public/welcome/assets/`.

| Tile | Source | Note |
| --- | --- | --- |
| Austin Advisory | Clarity & Compliance hero | Crops cleanly to 16:10 |
| Combyne | Combyne Your Style hero | Near-square source; will extend the white background sideways rather than letterbox |
| Grove Cleaners | New Landing Page hero | Crops cleanly, cream background extends if needed |
| Toys2000 | Old logo / new logo | See below |

The Toys2000 upload is a logo before-and-after, not a website hero. The handoff is explicit that all four tiles should be comparable heroes, because comparisons turn to mush at ~300px wide and mixed image types stop reading as a portfolio. I'll build the tile from the new Toys2000 logo alone on a clean field, dropping the old logo and the arrow, which keeps it legible at tile size. If you have a Toys2000 site screenshot, that's the better swap and it drops straight in.

Every tile gets explicit `width`/`height`, `aspect-ratio: 16/10`, `object-fit: cover` and `loading="lazy"`, so nothing shifts on load.


### robots.txt

Adding `Disallow: /welcome/` so referrer pages stay out of search. Flagging this as one of David's open questions — easy to reverse.

## 2. The SlideForge version (editing and preview)

The same ten slides as React components, so the deck can be edited, presented, and reviewed inside this app.

- `src/slides/cada/Slide01Cover.tsx` … `Slide10Ask.tsx`, registered in `src/slides/cada/index.ts`
- A `CadaSlide` layout component carrying the CADA look: light/dark theming, the top micro rail, the footer, the logo mark
- CADA tokens added to `src/index.css` as `--slide-*` values so the whole deck restyles from one place
- `src/pages/Index.tsx` switched from `showcaseSlides` to `cadaSlides`

These render at the app's 1920x1080 slide resolution rather than the fluid `clamp()` scale of the static file, so the two are visually matched but not byte-identical. The static file stays the source of truth for what ships.

## 3. Verification

Checked against the acceptance criteria before handing back: renders with no blocking external weight, referrer name on slides 1 and 2, logo inverting correctly across light and dark slides, keyboard and click and swipe navigation, no horizontal scroll at 375px, `tel:` link well-formed, all four tiles reserving space with no layout shift, the three accuracy tags present, reduced-motion disabling animation.

I'll screenshot all ten slides at desktop and at 375px and inspect each one.

## Technical notes

- Files under `public/` are copied verbatim into the build and served as real files, so `/welcome/ed/` resolves to the static HTML and never hits the React SPA router. The React app at `/` is unaffected.
- Zero new dependencies.
- Not touching the existing showcase slides; they stay in the repo.

## Not doing

- No Figma embed, now or lazily.
- No React port of the shipping page. The static file stays vanilla.
