import React from 'react';
import { CadaSlide } from './CadaSlide';

/**
 * The three status tags below are accuracy claims, not decoration.
 * Combyne was designed but never built; Grove Cleaners is unsolicited
 * concept work, not a client. Do not remove, soften or tidy these.
 */
const TILES = [
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
    tag: 'Our concept. Not a client.',
    live: false,
    title: 'Grove Cleaners',
    body: 'A seventy-five-year-old Miami institution, reimagined. Included to show how we approach a legacy business, not as work we were hired for.',
  },
];

export default function Slide07SelectedWork() {
  return (
    <CadaSlide theme="light" section="06 · Selected work" index={7}>
      <p className="cada-eyebrow">06 · Selected work</p>
      <h2 className="cada-h2">Four projects.</h2>
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
                const target = e.currentTarget;
                const step = parseInt(target.dataset.step || '0', 10);
                if (step === 0) {
                  target.dataset.step = '1';
                  target.src = t.src.replace('/welcome/assets/', 'assets/');
                } else if (step === 1) {
                  target.dataset.step = '2';
                  target.src = t.src.replace('.webp', '.png');
                } else if (step === 2) {
                  target.dataset.step = '3';
                  target.src = t.src.replace('/welcome/assets/', 'assets/referral/').replace('.webp', '.png');
                }
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
