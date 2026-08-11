import React from 'react';
import { CadaSlide } from './CadaSlide';

export default function Slide04OurRead() {
  return (
    <CadaSlide theme="dark" section="03 · How we work" index={4}>
      <h2 className="cada-h2">You see our read before we build anything.</h2>
      <p className="cada-lede">
        We start by learning how the business actually runs. Then we write that back to you, along
        with what we would do about it, before a single page exists.
      </p>
      <p className="cada-lede">
        If we have misread something, you catch it on paper. That is where changes are free.
      </p>
    </CadaSlide>
  );
}
