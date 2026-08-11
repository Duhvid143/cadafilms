import Slide01Cover from './Slide01Cover';
import Slide02Welcome from './Slide02Welcome';
import Slide03SmallOnPurpose from './Slide03SmallOnPurpose';
import Slide04OurRead from './Slide04OurRead';
import Slide05Identity from './Slide05Identity';
import Slide06WhatWeDo from './Slide06WhatWeDo';
import Slide07SelectedWork from './Slide07SelectedWork';
import Slide08Process from './Slide08Process';
import Slide09Quote from './Slide09Quote';
import Slide10Ask from './Slide10Ask';

/**
 * `theme` must match the theme prop each component passes to CadaSlide. The
 * navigation arrows sit on top of the slide when the viewport is 16:9, so they
 * have to invert with it or they disappear against the paper background.
 */
export const cadaSlides = [
  { component: Slide01Cover, name: 'Cover', template: 'title', theme: 'dark' },
  { component: Slide02Welcome, name: 'Ed sent you', template: 'statement', theme: 'light' },
  { component: Slide03SmallOnPurpose, name: 'Small on purpose', template: 'statement', theme: 'light' },
  { component: Slide04OurRead, name: 'Our read first', template: 'statement', theme: 'dark' },
  { component: Slide05Identity, name: 'Your identity', template: 'statement', theme: 'light' },
  { component: Slide06WhatWeDo, name: 'What we do', template: 'three-up', theme: 'light' },
  { component: Slide07SelectedWork, name: 'Selected work', template: 'grid', theme: 'light' },
  { component: Slide08Process, name: 'The process', template: 'process', theme: 'dark' },
  { component: Slide09Quote, name: 'In his words', template: 'quote', theme: 'dark' },
  { component: Slide10Ask, name: 'The ask', template: 'cta', theme: 'dark' },
] as const;
