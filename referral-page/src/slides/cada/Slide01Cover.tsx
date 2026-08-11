import React from 'react';
import { CadaSlide, CadaMark, REFERRER } from './CadaSlide';

export default function Slide01Cover() {
  return (
    <CadaSlide theme="dark" section="Referral" index={1}>
      <p className="cada-eyebrow">A referral from {REFERRER.full}</p>
      <CadaMark className="cada-wordmark" />
      <p className="cada-small" style={{ marginTop: 44 }}>
        Prepared for a colleague of Austin Advisory Services
      </p>
    </CadaSlide>
  );
}
