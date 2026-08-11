import React from 'react';
import { CadaSlide } from './CadaSlide';

export default function Slide03SmallOnPurpose() {
  return (
    <CadaSlide theme="light" section="02 · How we work" index={3}>
      <p className="cada-eyebrow">02 · How we work</p>
      <h2 className="cada-h2">The person who learns your business is the one who builds it.</h2>
      <p className="cada-lede">
        We are a small team, deliberately. There is no account manager relaying notes to a developer
        who never spoke to you. You deal with the people doing the work, start to finish.
      </p>
      <p className="cada-lede">
        That is why things move quickly, and why less gets lost between the conversation and the
        result.
      </p>
    </CadaSlide>
  );
}
