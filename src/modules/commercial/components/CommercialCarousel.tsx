'use client';
import { useEffect, useState } from 'react';
import { Button, UiIcon } from '@/components/ui';
import { prefersReducedMotion } from '@/components/ui/lib/motionPreferences';
import { useMotionPreference } from '@/providers/MotionPreferenceProvider';
import { gentlePathCommercialStrings as copy } from '@/strings';
import type { AdPlacementPublic } from '../models/adPlacement';
import { ServedCreativeCard } from './ServedCreativeCard';
interface CommercialCarouselProps {
  placement: AdPlacementPublic;
  simulate: boolean;
  busy: boolean;
  onSimulate: (id: string) => void;
}
export function CommercialCarousel({
  placement,
  simulate,
  busy,
  onSimulate,
}: CommercialCarouselProps) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const { preference } = useMotionPreference();
  const count = placement.items.length;
  const active = Math.min(index, Math.max(0, count - 1));
  const seconds = placement.auto_advance_seconds;
  useEffect(() => {
    if (
      !seconds ||
      count < 2 ||
      paused ||
      hovered ||
      focused ||
      busy ||
      preference === 'reduced'
    )
      return;
    const timer = window.setInterval(() => {
      if (!document.hidden && !prefersReducedMotion())
        setIndex((current) => (current + 1) % count);
    }, seconds * 1000);
    return () => window.clearInterval(timer);
  }, [seconds, count, paused, hovered, focused, busy, preference]);
  return (
    <div
      role="region"
      aria-label={placement.name}
      className="grid min-w-0 gap-4"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocusCapture={() => setFocused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget))
          setFocused(false);
      }}
    >
      <div className="grid min-w-0 items-stretch">
        {placement.items.map((item, position) => (
          <div
            key={item.id}
            aria-hidden={position !== active}
            inert={position !== active}
            className={`col-start-1 row-start-1 grid min-w-0 ${position === active ? '' : 'invisible pointer-events-none'}`}
          >
            <ServedCreativeCard
              item={item}
              simulate={simulate}
              busy={busy}
              onSimulate={onSimulate}
            />
          </div>
        ))}
      </div>
      {count > 1 && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            <Button
              variant="secondary"
              aria-label={copy.previousCreative}
              onClick={() => {
                setPaused(true);
                setIndex((active - 1 + count) % count);
              }}
            >
              <UiIcon name="chevronLeft" />
              {copy.previousCreative}
            </Button>
            <Button
              variant="secondary"
              aria-label={copy.nextCreative}
              onClick={() => {
                setPaused(true);
                setIndex((active + 1) % count);
              }}
            >
              {copy.nextCreative}
              <UiIcon name="chevronRight" />
            </Button>
          </div>
          {placement.show_pagination && (
            <p
              className="m-0 text-sm text-tertiary"
              role="status"
              aria-live={
                seconds && !paused && !hovered && !focused ? 'off' : 'polite'
              }
            >
              {copy.slidePosition(active + 1, count)}
            </p>
          )}
          {seconds && (
            <Button
              variant="ghost"
              aria-pressed={paused}
              onClick={() => setPaused((current) => !current)}
            >
              {paused ? copy.resumeRotation : copy.pauseRotation}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
