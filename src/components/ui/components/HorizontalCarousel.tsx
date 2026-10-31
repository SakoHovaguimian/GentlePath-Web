'use client';

import type { HorizontalCarouselProps } from '../models/horizontalCarouselProps';
import './HorizontalCarousel.css';

/** A partial next card signals native touch, trackpad, and keyboard scrolling. */
export function HorizontalCarousel({
  label,
  children,
  variant = 'cards',
  trackRef,
  onScroll,
}: HorizontalCarouselProps) {
  return (
    <div
      className="ui-horizontal-carousel"
      data-variant={variant}
      role="region"
      aria-label={label}
    >
      <div
        ref={trackRef}
        onScroll={onScroll}
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
