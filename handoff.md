# Handoff Documentation: CADA Referral Deck

**Project Target:** `cada.ventures`  
**Live Referral URL:** `https://cada.ventures/welcome/ed-milford`  
**GitHub Repository:** `https://github.com/Duhvid143/cadafilms.git` (`main` branch)

---

## 1. Project Objective & Context

The **CADA Referral Deck** is a web-native, highly responsive 10-slide presentation deck designed for referred prospective clients landing on `cada.ventures`. 

- **Why it exists:** Referred leads arrive with borrowed trust from an existing client (e.g., Ed Milford). The page catches that trust and guides them through CADA's philosophy, process, selected work, and CTA to schedule a call without friction.
- **Key Constraint:** **No embedded Figma prototypes.** The original approach used Figma iframes, which were rejected due to poor load performance and heavy player overhead. This implementation is pure HTML/CSS/React rendered natively in the browser for instant load speeds.

---

## 2. Directory Structure & Architecture

```
CADA_FILMS_site/
├── cadafilms/                         <-- Master Git Repository (Deployed via Vercel)
│   ├── welcome/
│   │   ├── ed-milford/               <-- Compiled production files for Ed Milford (/welcome/ed-milford)
│   │   │   ├── index.html
│   │   │   └── assets/
│   │   └── index.html                <-- Root fallback for /welcome/
│   └── referral-page/                <-- Source code inside main repository
├── Referral Page/                     <-- Standalone source application directory
└── /Users/Tic/.gemini/antigravity/scratch/ReferralPage/ <-- Local APFS fast build workspace
```

> **Important Note on Builds:** Running `npm install` or `vite build` directly on external exFAT drives can trigger file-locking errors (`ENOTEMPTY`). Always perform production builds inside the local scratch APFS workspace (`scratch/ReferralPage`), then copy the compiled `dist/` bundle into `cadafilms/welcome/`.

---

## 3. Work Accomplished & Recent Polish

1. **Full Presentation View (No Chrome):**
   - Removed slide editor chrome, top toolbars, slide list sidebars, and presenter notes overlay from `Index.tsx`.
   - The app runs exclusively in clean, full-screen 16:9 presentation mode.
2. **Keyboard & Touch Navigation:**
   - Smooth navigation using `ArrowRight` / `Space` / `ArrowDown` for Next and `ArrowLeft` / `ArrowUp` for Previous.
   - Touch swipe gestures enabled for mobile devices.
3. **Seamless Black Pillarboxing:**
   - Configured `SlideCanvas.tsx` with pure `#000000` black background (`bg-black`), zero outer padding (`p-0`), and removed rounded corner clipping (`rounded-none`).
4. **Asset & Image Fallback Handling:**
   - Slide 07 proof images (Austin Advisory Services, Toys2000, Combyne, Grove Cleaners) are served in high-quality `.webp` with automatic `.png` fallback handling via dataset retry logic.
5. **Copy & Content Updates:**
   - **Slide 07 (Selected Work):** Updated Grove Cleaners status tag to `"CONCEPT DESIGN"`.
   - **Slide 09 (In His Words):** Shortened quote text to `"Great work on the website!"` and removed the `"Quote used with permission."` line.
6. **Animated Progress Bar:**
   - Fixed a duplicate upper bar bug by removing `.cada-bar` from `CadaSlide.tsx`.
   - Enabled a single screen-level bottom orange progress bar (`.bar` in `SlideCanvas.tsx`) with smooth `transition: width 0.42s cubic-bezier(0.2, 0.7, 0.3, 1)`.

---

## 4. How to Build & Deploy Updates

When modifying the referral deck source code:

1. **Edit Source Files:**
   Modify components inside `Referral Page/src/` (and keep `cadafilms/referral-page/src/` in sync).

2. **Rebuild Bundle (Fast Local Workspace):**
   ```bash
   cd "/Users/Tic/.gemini/antigravity/scratch/ReferralPage"
   
   # Build for specific referrer slug (/welcome/ed-milford)
   npm run build -- --base=/welcome/ed-milford/
   
   # Build root welcome fallback (/welcome)
   npm run build -- --base=/welcome/
   ```

3. **Deploy to Master Repo (`cadafilms`):**
   Copy `dist/index.html` and `dist/assets/*` into:
   - `/Volumes/Extreme Pro/Personal_Projects/Coding_Projects/CADA_FILMS_site/cadafilms/welcome/ed-milford/`
   - `/Volumes/Extreme Pro/Personal_Projects/Coding_Projects/CADA_FILMS_site/cadafilms/welcome/`

4. **Commit & Push to GitHub:**
   ```bash
   cd "/Volumes/Extreme Pro/Personal_Projects/Coding_Projects/CADA_FILMS_site/cadafilms"
   git add welcome/ referral-page/ handoff.md
   git commit -m "Describe your update"
   git push origin main
   ```
   *(Vercel automatically picks up commits pushed to `main` and deploys them instantly).*

---

## 5. How to Create a New Referrer Landing Page

To generate a new personalized URL for a new referrer (e.g. `Jane Doe` at `/welcome/jane-doe`):

1. Update referrer metadata object in `CadaSlide.tsx`:
   ```ts
   export const REFERRER = { first: 'Jane', full: 'Jane Doe' };
   ```
2. Update the page title and the `og:`/`twitter:` strings in `index.html`. These
   name the referrer and their company, and they are what a referred stranger
   sees in Messages, LinkedIn, Slack and email *before* they click — the page is
   distributed by being forwarded, so this is not optional polish. There is a
   comment in `index.html` marking the block.
3. Run build:
   ```bash
   npm run build -- --base=/welcome/jane-doe/
   ```
4. Copy output `dist/` files into `cadafilms/welcome/jane-doe/`.
5. Commit and push to `origin/main`.

> **Do not add `<link rel="preload">` for the slide-7 tiles to `index.html`.**
> Vite rewrites root-relative hrefs in that file against `--base`, so
> `/welcome/assets/x.webp` ships as `/welcome/<slug>/welcome/assets/x.webp` and
> 404s. The tiles are warmed from `src/pages/Index.tsx` instead, where the path
> is the same constant the `<img>` uses.

---

## 6. Key Verification Checklist for Future Agents

- [ ] Does `https://cada.ventures/welcome/ed-milford` load cleanly without 404 errors?
- [ ] Are arrow keys working smoothly to step through slides 1 through 10?
- [ ] Is there only ONE single orange progress bar smoothly animating along the bottom of the screen?
- [ ] Are there any white or gray side bars? (Should be pure `#000000` black pillarboxing).
- [ ] Are all four proof images on Slide 07 painted the instant the slide appears, on a hard refresh?
- [ ] Is the page title client-facing and does it name the right referrer?
- [ ] Are the arrow buttons visible on the cover slide, and do they stay visible on every slide?
- [ ] Does each interior slide print its section label once (top rail only, no eyebrow)?
- [ ] Is `info@cada.ventures` in the footer underlined?
