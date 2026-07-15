/* ===================================================================
   Austin Advisory Services — Interactive Logic
   =================================================================== */
import './styles.css';

document.addEventListener('DOMContentLoaded', () => {
  initHeaderScroll();
  initAccordion();
  initScrollAnimations();
  initSmoothScrolling();
  initContactModal();
  initMobileNav();
});

/* ─── Header scroll effect ─── */
function initHeaderScroll() {
  const header = document.getElementById('site-header');
  if (!header) return;

  const onScroll = () => {
    if (window.scrollY > 60) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // initial check
}

/* ─── Accordion (Types of Auditing) ─── */
function initAccordion() {
  const items = document.querySelectorAll('[data-accordion]');

  items.forEach((item) => {
    const header = item.querySelector('.accordion-header');
    if (!header) return;

    header.addEventListener('click', () => {
      const isActive = item.classList.contains('active');

      // Close all items
      items.forEach((other) => other.classList.remove('active'));

      // Toggle clicked item
      if (!isActive) {
        item.classList.add('active');
      }
    });
  });
}

/* ─── Scroll-triggered animations (IntersectionObserver) ─── */
function initScrollAnimations() {
  const elements = document.querySelectorAll('.animate-on-scroll');

  if (!elements.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // Stagger sibling animations
          const siblings = entry.target.parentElement?.querySelectorAll('.animate-on-scroll');
          if (siblings) {
            const index = Array.from(siblings).indexOf(entry.target);
            entry.target.style.transitionDelay = `${index * 0.1}s`;
          }
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.15,
      rootMargin: '0px 0px -40px 0px',
    }
  );

  elements.forEach((el) => observer.observe(el));
}

/* ─── Smooth scrolling for anchor links ─── */
function initSmoothScrolling() {
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href');
      if (targetId === '#') return;

      const target = document.querySelector(targetId);
      if (!target) return;

      e.preventDefault();

      // Close mobile nav if open
      const nav = document.getElementById('main-nav');
      const toggle = document.getElementById('nav-toggle');
      if (nav && nav.classList.contains('open')) {
        nav.classList.remove('open');
        toggle?.setAttribute('aria-expanded', 'false');
      }

      // Update active nav link
      document.querySelectorAll('.nav-link').forEach((n) => n.classList.remove('active'));
      if (link.classList.contains('nav-link')) {
        link.classList.add('active');
      }

      const headerOffset = 80;
      const elementPosition = target.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    });
  });
}

/* ─── Contact CTA → Success Modal ─── */
function initContactModal() {
  const btn = document.getElementById('contact-cta-btn');
  const modal = document.getElementById('success-modal');
  const closeBtn = document.getElementById('modal-close-btn');

  if (!btn || !modal || !closeBtn) return;

  const openModal = () => {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    closeBtn.focus();
  };

  const closeModal = () => {
    modal.classList.remove('active');
    document.body.style.overflow = '';
    btn.focus();
  };

  btn.addEventListener('click', openModal);
  closeBtn.addEventListener('click', closeModal);

  // Close on overlay click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      closeModal();
    }
  });
}

/* ─── Mobile navigation toggle ─── */
function initMobileNav() {
  const toggle = document.getElementById('nav-toggle');
  const nav = document.getElementById('main-nav');

  if (!toggle || !nav) return;

  toggle.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  });
}
