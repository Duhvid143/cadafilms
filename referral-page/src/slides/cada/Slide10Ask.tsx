import React from 'react';
import { CadaSlide, CADA_TEL, CADA_TEL_DISPLAY, CADA_EMAIL } from './CadaSlide';

export default function Slide10Ask() {
  return (
    <CadaSlide theme="dark" section="09 · Next" index={10}>
      <p className="cada-eyebrow">09 · Next</p>
      <h1 className="cada-h1">Let&rsquo;s start the conversation.</h1>
      <p className="cada-lede">
        Thirty minutes, no pitch, no obligation. Tell us what you are working with and we will tell
        you plainly whether we are the right fit.
      </p>
      <p>
        <a className="cada-cta" href={`tel:${CADA_TEL}`}>
          Call {CADA_TEL_DISPLAY}
        </a>
      </p>
      <span className="cada-alt">
        or email <a href={`mailto:${CADA_EMAIL}`}>{CADA_EMAIL}</a>
      </span>
    </CadaSlide>
  );
}
