# Swap the Toys2000 tile to a real website hero

The Toys2000 tile on slide 7 is currently a logo on a white field, which breaks the handoff rule that all four tiles are hero shots, not logo comparisons. The uploaded Toys2000 homepage screenshot fixes that.

## What changes

Regenerate `public/welcome/assets/toys2000.webp` from the uploaded screenshot so it matches the other three tiles: a live site hero, 1280x800, 16:10, WebP quality 85.

Nothing else changes. Same filename, same path, same markup, so both the static deck (`public/welcome/ed/index.html`) and the React deck pick it up automatically. The "Live" accuracy label stays exactly as written.

## Crop details

The upload has a 5px green capture frame and is portrait (794x916). Measured bands:

```text
0-5      green capture frame (trim)
6-85     white header with Toys2000 logo + nav
86-184   orange "Toy Fair in New York" banner
185-203  white gap
204-500  hero photograph (plush toys, blocks, figures)
500-509  rainbow divider bar
```

Crop to x 6-788, y 6-495 (782x489, ratio 1.599), then resize to 1280x800 with Lanczos and encode WebP q85. That keeps logo, orange banner, and the bulk of the hero photo, and cleanly drops the green frame and the below-the-fold copy.

## Verification

- Regenerate the four-tile contact sheet and confirm the Toys2000 tile reads as a website, consistent with Austin Advisory, Combyne, and Grove.
- Confirm file size stays in the ~40-60KB range so the four-image budget stays near 200KB.
- Re-shoot slide 7 in the static deck at desktop and 375px to confirm no layout shift and labels intact.
