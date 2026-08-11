import React from 'react';
import { CadaSlide } from './CadaSlide';

const STEPS = [
  {
    n: '01',
    title: 'Conversation',
    body: 'Thirty minutes. What you do, who you serve, what is not working. You do most of the talking.',
  },
  {
    n: '02',
    title: 'Our read',
    body: 'We write back what we heard and what we would do about it. No cost, no obligation. Most people find this useful whether or not they hire us.',
  },
  {
    n: '03',
    title: 'Design, then build',
    body: 'You see the whole thing before we build it. Changes are easy at this stage, so this is where we make them.',
  },
  {
    n: '04',
    title: 'Care',
    body: 'Optional, and how most clients stay. Hosting, updates, and someone who answers.',
  },
];

export default function Slide08Process() {
  return (
    <CadaSlide theme="dark" section="07 · The process" index={8}>
      <h2 className="cada-h2">Four steps. You are only busy for the first one.</h2>
      <div className="cada-cols cada-cols--4">
        {STEPS.map((s) => (
          <div className="cada-col" key={s.n}>
            <span className="cada-n">{s.n}</span>
            <h3 className="cada-h3">{s.title}</h3>
            <p className="cada-small">{s.body}</p>
          </div>
        ))}
      </div>
    </CadaSlide>
  );
}
