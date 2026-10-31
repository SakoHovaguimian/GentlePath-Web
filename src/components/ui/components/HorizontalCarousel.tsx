'use client';
import { useEffect, useRef, useState } from 'react';
import { strings } from '@/strings';
import { prefersReducedMotion } from '../lib/motionPreferences';
import type { HorizontalCarouselProps } from '../models/horizontalCarouselProps';
import { IconButton } from './IconButton';
import { UiIcon } from './UiIcon';
import './HorizontalCarousel.css';

/** Native scrolling supplies touch, trackpad, and keyboard operation without rotating content. */
export function HorizontalCarousel({
  label,
  children,
}: HorizontalCarouselProps) {
  const track = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ start: true, end: true });
  useEffect(() => {
    const element = track.current;
    if (!element) return;
    const measure = () =>
      setEdges({
        start: element.scrollLeft <= 1,
        end:
          element.scrollLeft + element.clientWidth >= element.scrollWidth - 2,
      });
    measure();
    element.addEventListener('scroll', measure, { passive: true });
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    for (const child of element.children) observer.observe(child);
    return () => {
      observer.disconnect();
      element.removeEventListener('scroll', measure);
    };
  }, [children]);
  const move = (direction: number) => {
    const element = track.current;
    if (!element) return;
    element.scrollBy({
      left: direction * element.clientWidth,
      behavior: prefersReducedMotion() ? 'instant' : 'smooth',
    });
  };
  return (
    <div className="ui-horizontal-carousel" role="region" aria-label={label}>
      <div className="ui-horizontal-carousel__controls">
        <IconButton
          label={strings.ui.carousel.previous}
          variant="secondary"
          disabled={edges.start}
          onClick={() => move(-1)}
        >
          <UiIcon name="chevronLeft" />
        </IconButton>
        <IconButton
          label={strings.ui.carousel.next}
          variant="secondary"
          disabled={edges.end}
          onClick={() => move(1)}
        >
          <UiIcon name="chevronRight" />
        </IconButton>
      </div>
      <div
        ref={track}
        className="ui-horizontal-carousel__track"
        tabIndex={0}
        role="group"
        aria-label={label}
      >
        {children}
      </div>
    </div>
  );
}
