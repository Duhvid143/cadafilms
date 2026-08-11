# Slide 7 proof tiles

Four files, and only these four. They are served from `/welcome/assets/` and
shared by every referrer page — do not duplicate them per referrer.

| Tile | File |
|---|---|
| Austin Advisory Services | `austin-advisory.webp` |
| Toys2000 | `toys2000.webp` |
| Combyne | `combyne.webp` |
| Ileana Garcia | `ileana-garcia.webp` |

**Spec:** 16:10 WebP, quality ~85, 33-72KB. The slide renders them at roughly
300px wide, so ~600px of source covers a 2x screen. Three are 1280x800;
`ileana-garcia.webp` is 770x481, which is the native resolution of its source
capture. It was left unscaled on purpose — the image is type-heavy and a 1.66x
upscale visibly softened the serif name lockup for no added detail. Aspect
ratio is what has to match, not pixel count.

**They must be website heroes** — not logo comparisons, not before/after pairs.
Four comparable heroes read as a portfolio; a mix reads as four unrelated
images, and side-by-side comparisons turn to mush at 300px.

**Crop tightly.** The since-retired Grove tile shipped as a screenshot of a
Figma frame: 930x650, 481KB, with the frame label "New Landing Page" and white
margins included. If you are exporting from a Figma case-study slide, crop to
the artwork itself, not the frame.

**Ileana Garcia is concept work, not a client.** The `Concept Design` tag and
the "Concept for a Florida State Senate campaign" opening of the tile copy are
what carry that. She is a sitting elected official, so do not reword either in
a way that implies she engaged CADA.

No `.png` variants. An earlier `onError` chain fell back to them and the Grove
PNG was that same bad export, so a failed WebP could have put the wrong image
on the proof slide. A tile that fails now keeps its placeholder frame instead.

Source screenshots for re-exports live outside the repo, in the project's
`files/source-screenshots/selected-work/`.
