import React from 'react';
import { CadaSlide, REFERRER } from './CadaSlide';

export default function Slide02Welcome() {
  return (
    <CadaSlide theme="light" section="01 · Welcome" index={2}>
      <h1 className="cada-h1">{REFERRER.first} sent you.</h1>
      {/*
        PER REFERRER: "He" refers to the name in the headline above. Ed Milford
        uses he/him. Check this when you swap REFERRER — it is the one place in
        the deck where the referrer's pronoun is written into the copy.
      */}
      <p className="cada-lede">
        He thought we would be a good fit. This is the short version of why: how we work, what we
        have made, and what it is like to hire us. Our number is on the last page.
      </p>
    </CadaSlide>
  );
}
