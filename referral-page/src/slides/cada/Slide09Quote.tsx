import React from 'react';
import { CadaSlide } from './CadaSlide';

/** Real client words, used with permission. Do not paraphrase or shorten. */
export default function Slide09Quote() {
  return (
    <CadaSlide theme="dark" section="07 · In his words" index={8}>
      <blockquote className="cada-quote cada-quote--long">
        &ldquo;Working with the brilliant team of CADA Ventures to develop the Austin Advisory
        Services website was an outstanding experience. Their expertise and dedication resulted in
        a professional, effective website that delivers tremendous value and peace of mind to our
        clients.&rdquo;
      </blockquote>
      <cite className="cada-cite">Edmund Milford · Austin Advisory Services</cite>
    </CadaSlide>
  );
}
