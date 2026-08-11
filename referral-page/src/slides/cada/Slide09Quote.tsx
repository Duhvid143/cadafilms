import React from 'react';
import { CadaSlide } from './CadaSlide';

/** Real client words, used with permission. Do not paraphrase or shorten. */
export default function Slide09Quote() {
  return (
    <CadaSlide theme="dark" section="08 · In his words" index={9}>
      <blockquote className="cada-quote">
        &ldquo;Great work on the website!&rdquo;
      </blockquote>
      <cite className="cada-cite">Edmund A. Milford, CPA · Austin Advisory Services</cite>
    </CadaSlide>
  );
}
