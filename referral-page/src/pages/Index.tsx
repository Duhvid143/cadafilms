import React, { useState, useEffect } from 'react';
import { ChevronsLeft, ChevronsRight } from 'lucide-react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Toolbar } from '@/components/layout/Toolbar';
import { SlideCanvas } from '@/components/slides/SlideCanvas';
import { SlideOverviewGrid } from '@/components/slides/SlideOverviewGrid';
import { PresentationMode } from '@/components/slides/PresentationMode';
import { PresenterView } from '@/components/slides/PresenterView';
import { PresenterNotesPanel } from '@/components/slides/PresenterNotesPanel';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cadaSlides as showcaseSlides } from '@/slides/cada';
import { TILES as SLIDE7_TILES } from '@/slides/cada/Slide07SelectedWork';

interface SlideData {
  id: string;
  component: React.ComponentType<any>;
  name: string;
  isWIP: boolean;
  description?: string;
}

export default function Index() {
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);

  const slides = React.useMemo<SlideData[]>(() => 
    showcaseSlides.map((s) => ({
      id: `slide-${s.name.toLowerCase().replace(/\s+/g, '-')}`,
      component: s.component,
      name: s.name,
      isWIP: false,
      description: undefined,
    })),
    []
  );

  // Slide 7 is the proof slide, and only the active slide is mounted, so its
  // four tiles are fetched and decoded the moment it appears. They arrive in
  // time but paint a frame or two late, which is why tiles read as empty on
  // arrival. Fetching AND decoding them up front makes the paint immediate.
  // ~200KB total, off the critical path.
  useEffect(() => {
    let cancelled = false;
    const warm = () => {
      if (cancelled) return;
      for (const { src } of SLIDE7_TILES) {
        const img = new Image();
        img.src = src;
        // Errors are non-fatal here: the <img> in the slide keeps its own
        // fallback chain. This is a warm-up, not the load path.
        img.decode?.().catch(() => {});
      }
    };
    // The timeout matters: on a slow device idle time may not arrive before
    // someone has clicked through to slide 7, and this must not be starved.
    const idle =
      window.requestIdleCallback?.(warm, { timeout: 1200 }) ?? window.setTimeout(warm, 300);
    return () => {
      cancelled = true;
      if (window.cancelIdleCallback) window.cancelIdleCallback(idle as number);
      else window.clearTimeout(idle as number);
    };
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.key === 'ArrowDown' || e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        setActiveSlideIndex(prev => Math.min(slides.length - 1, prev + 1));
      } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        e.preventDefault();
        setActiveSlideIndex(prev => Math.max(0, prev - 1));
      } else if (e.key === 'Home') {
        e.preventDefault();
        setActiveSlideIndex(0);
      } else if (e.key === 'End') {
        e.preventDefault();
        setActiveSlideIndex(slides.length - 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [slides.length]);

  // Touch swipe. A forwarded referral link is usually opened on a phone, so
  // this is the primary navigation there, not a nicety.
  useEffect(() => {
    let startX = 0;
    let startY = 0;

    const onTouchStart = (e: TouchEvent) => {
      startX = e.changedTouches[0].clientX;
      startY = e.changedTouches[0].clientY;
    };

    const onTouchEnd = (e: TouchEvent) => {
      const dx = e.changedTouches[0].clientX - startX;
      const dy = e.changedTouches[0].clientY - startY;
      // Horizontal intent only, and far enough to not be a stray tap.
      if (Math.abs(dx) < 48 || Math.abs(dx) <= Math.abs(dy)) return;
      setActiveSlideIndex(prev =>
        dx < 0 ? Math.min(slides.length - 1, prev + 1) : Math.max(0, prev - 1)
      );
    };

    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchend', onTouchEnd, { passive: true });
    return () => {
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, [slides.length]);

  const ActiveSlideComponent = slides[activeSlideIndex]?.component || showcaseSlides[0].component;
  const activeSlideTheme = showcaseSlides[activeSlideIndex]?.theme ?? 'dark';

  return (
    <div className="h-screen w-screen overflow-hidden bg-[hsl(var(--canvas-bg))] flex flex-col">
      <div className="flex-1 relative overflow-hidden">
        <SlideCanvas
          currentSlide={activeSlideIndex + 1}
          totalSlides={slides.length}
          onPrevSlide={() => setActiveSlideIndex(Math.max(0, activeSlideIndex - 1))}
          onNextSlide={() => setActiveSlideIndex(Math.min(slides.length - 1, activeSlideIndex + 1))}
          slideTheme={activeSlideTheme}
        >
          <ActiveSlideComponent />
        </SlideCanvas>
      </div>
    </div>
  );
}
