import React from 'react';
import { CadaSlide } from './CadaSlide';

export default function Slide05Identity() {
  return (
    <CadaSlide theme="light" section="04 · How we work" index={5}>
      <p className="cada-eyebrow">04 · How we work</p>
      <h2 className="cada-h2">Your identity is the starting point, not the thing we replace.</h2>
      <p className="cada-lede">
        Some clients want a full rebuild. Others have a logo they like and wording they have already
        settled on, and they want those respected. Both are fine, and we have done both.
      </p>
      <p className="cada-lede">
        What does not happen is a template dropped on top of your business, or a rebrand nobody
        asked for.
      </p>
    </CadaSlide>
  );
}
