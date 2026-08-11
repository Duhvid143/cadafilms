# Slide 7 proof tiles

Four files, and only these four. They are served from `/welcome/assets/` and
shared by every referrer page — do not duplicate them per referrer.

| Tile | File |
|---|---|
| Austin Advisory Services | `austin-advisory.webp` |
| Toys2000 | `toys2000.webp` |
| Combyne | `combyne.webp` |
| Grove Cleaners | `grove.webp` |

**Spec:** 1280x800 WebP (16:10), quality ~85, 38-72KB. The slide renders them
at roughly 300px wide.

**They must be website heroes** — not logo comparisons, not before/after pairs.
Four comparable heroes read as a portfolio; a mix reads as four unrelated
images, and side-by-side comparisons turn to mush at 300px.

**Crop tightly.** The Grove tile previously shipped as a screenshot of a Figma
frame: 930x650, 481KB, with the frame label "New Landing Page" and white
margins included. If you are exporting from a Figma case-study slide, crop to
the artwork itself, not the frame.

No `.png` variants. An earlier `onError` chain fell back to them and the Grove
PNG was that same bad export, so a failed WebP could have put the wrong image
on the proof slide. A tile that fails now keeps its placeholder frame instead.

Source screenshots for re-exports live outside the repo, in the project's
`files/source-screenshots/selected-work/`.
