import React from 'react';
import { CadaSlide } from './CadaSlide';

/**
 * The three status tags below are accuracy claims, not decoration.
 * Combyne was designed but never built; Grove Cleaners is unsolicited
 * concept work, not a client. Do not remove, soften or tidy these.
 */
export const TILES = [
  {
    src: '/welcome/assets/austin-advisory.webp',
    alt: 'Austin Advisory Services website hero',
    tag: 'Live',
    live: true,
    title: 'Austin Advisory Services',
    body: 'Orlando CPA practice. A single page built around a logo and copy the client already had, with the credentials given room to carry the weight.',
  },
  {
    src: '/welcome/assets/toys2000.webp',
    alt: 'Toys2000 brand identity',
    tag: 'Live',
    live: true,
    title: 'Toys2000',
    body: 'Thirty years in wholesale toy distribution. New logo, brand guidelines, and a custom site, plus a secure client portal with password-protected digital catalogs.',
  },
  {
    src: '/welcome/assets/combyne.webp',
    alt: 'Combyne website redesign hero',
    tag: 'Design delivered',
    live: false,
    title: 'Combyne',
    body: 'Fashion tech platform with over six million users. Full site redesign covering new branding, answer engine optimization, and features built to drive engagement and app downloads.',
  },
  {
    src: '/welcome/assets/grove.webp',
    alt: 'Grove Cleaners concept landing page',
    tag: 'Concept Design',
    live: false,
    title: 'Grove Cleaners',
    body: 'A seventy-five-year-old Miami institution, reimagined. Included to show how we approach a legacy business, not as work we were hired for.',
  },
];

export default function Slide07SelectedWork() {
  return (
    <CadaSlide theme="light" section="06 · Selected work" index={7}>
      <h2 className="cada-h2">Samples of Our Work</h2>
      <div className="cada-cols cada-cols--4">
        {TILES.map((t) => (
          <div className="cada-tile" key={t.title}>
            <img 
              src={t.src} 
              width={1280} 
              height={800} 
              loading="eager" 
              decoding="async" 
              alt={t.alt}
              onError={(e) => {
                // One retry, against the per-referrer copy of the assets that
                // sits beside index.html. The old chain also chased .png
                // variants; those are gone, and grove.png in particular was
                // the mis-exported Figma frame, so that step could serve a
                // wrong image on the proof slide. A tile that still fails
                // now keeps its placeholder frame (see .cada-tile img).
                const target = e.currentTarget;
                if (target.dataset.step) return;
                target.dataset.step = '1';
                target.src = t.src.replace('/welcome/assets/', 'assets/');
              }}
            />
            <span className={`cada-tag${t.live ? ' cada-tag--live' : ''}`}>{t.tag}</span>
            <h3 className="cada-h3">{t.title}</h3>
            <p className="cada-small">{t.body}</p>
          </div>
        ))}
      </div>
    </CadaSlide>
  );
}
