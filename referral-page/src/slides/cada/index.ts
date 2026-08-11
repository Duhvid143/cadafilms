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

export const cadaSlides = [
  { component: Slide01Cover, name: 'Cover', template: 'title' },
  { component: Slide02Welcome, name: 'Ed sent you', template: 'statement' },
  { component: Slide03SmallOnPurpose, name: 'Small on purpose', template: 'statement' },
  { component: Slide04OurRead, name: 'Our read first', template: 'statement' },
  { component: Slide05Identity, name: 'Your identity', template: 'statement' },
  { component: Slide06WhatWeDo, name: 'What we do', template: 'three-up' },
  { component: Slide07SelectedWork, name: 'Selected work', template: 'grid' },
  { component: Slide08Process, name: 'The process', template: 'process' },
  { component: Slide09Quote, name: 'In his words', template: 'quote' },
  { component: Slide10Ask, name: 'The ask', template: 'cta' },
];
