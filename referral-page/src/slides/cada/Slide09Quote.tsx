import React from 'react';
import { CadaSlide } from './CadaSlide';

/** Real client words, used with permission. Do not paraphrase or shorten. */
export default function Slide09Quote() {
  return (
    <CadaSlide theme="dark" section="08 · In his words" index={9}>
      <p className="cada-eyebrow">08 · In his words</p>
      <blockquote className="cada-quote">
        &ldquo;Great work on the website. I&rsquo;m already getting enormous compliments on its look
        and functionality.&rdquo;
      </blockquote>
      <cite className="cada-cite">Edmund A. Milford, CPA · Austin Advisory Services</cite>
      <p className="cada-small" style={{ marginTop: 18 }}>
        Quote used with permission.
      </p>
    </CadaSlide>
  );
}
