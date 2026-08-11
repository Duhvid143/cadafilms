import React from 'react';
import { CadaSlide } from './CadaSlide';

const SERVICES = [
  {
    n: '01',
    title: 'Websites',
    body: 'Design and build, from a single page to a custom platform with client logins and databases behind it.',
  },
  {
    n: '02',
    title: 'Brand strategy',
    body: 'Logo and identity design, brand guidelines, positioning and messaging, and applying all of it across the site and anywhere else you show up.',
  },
  {
    n: '03',
    title: 'Ongoing care',
    body: 'Hosting, updates, backups, uptime monitoring, and priority support. Small changes handled without a quote.',
  },
];

export default function Slide06WhatWeDo() {
  return (
    <CadaSlide theme="light" section="05 · The work" index={6}>
      <h2 className="cada-h2">What we do.</h2>
      <div className="cada-cols cada-cols--3">
        {SERVICES.map((s) => (
          <div className="cada-col" key={s.n}>
            <span className="cada-n">{s.n}</span>
            <h3 className="cada-h3">{s.title}</h3>
            <p className="cada-small">{s.body}</p>
          </div>
        ))}
      </div>
      <p className="cada-small" style={{ marginTop: 48, maxWidth: '44em' }}>
        We also run our own community brand, TIUM, across Instagram, TikTok, LinkedIn and
        athinkingmedium.com. So the brand work is not theoretical for us.
      </p>
    </CadaSlide>
  );
}
