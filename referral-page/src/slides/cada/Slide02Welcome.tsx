import React from 'react';
import { CadaSlide, REFERRER } from './CadaSlide';

export default function Slide02Welcome() {
  return (
    <CadaSlide theme="light" section="01 · Welcome" index={2}>
      <h1 className="cada-h1">{REFERRER.first} sent you.</h1>
      <p className="cada-lede">
        So we will skip the part where we convince you we are real. Someone you trust already did
        that. This is just how we work, and what you would be getting.
      </p>
    </CadaSlide>
  );
}
