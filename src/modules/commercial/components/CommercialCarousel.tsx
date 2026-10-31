'use client';
import { useEffect, useRef, useState, type SyntheticEvent } from 'react';
import { Button, HorizontalCarousel } from '@/components/ui';
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
  const track = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const { preference } = useMotionPreference();
  const count = placement.items.length;
  const active = Math.min(index, Math.max(0, count - 1));
  const seconds = placement.auto_advance_seconds;
  const pauseForInteraction = (event: SyntheticEvent) => {
    if (
      event.target instanceof Element &&
      event.target.closest('.ui-horizontal-carousel')
    )
      setPaused(true);
  };
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
      const element = track.current;
      if (document.hidden || prefersReducedMotion() || !element) return;
      const cards = [...element.children] as HTMLElement[];
      const current = cards.reduce(
        (nearest, card, position) =>
          Math.abs(card.offsetLeft - cards[0].offsetLeft - element.scrollLeft) <
          Math.abs(
            cards[nearest].offsetLeft -
              cards[0].offsetLeft -
              element.scrollLeft,
          )
            ? position
            : nearest,
        0,
      );
      const next = cards[(current + 1) % count];
      element.scrollTo({
        left: next.offsetLeft - cards[0].offsetLeft,
        behavior: 'smooth',
      });
    }, seconds * 1000);
    return () => window.clearInterval(timer);
  }, [seconds, count, paused, hovered, focused, busy, preference]);
  return (
    <div
      role="region"
      aria-label={placement.name}
      className="grid min-w-0 gap-4"
      onPointerDown={pauseForInteraction}
      onWheel={pauseForInteraction}
      onKeyDown={pauseForInteraction}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocusCapture={() => setFocused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget))
          setFocused(false);
      }}
    >
      <HorizontalCarousel
        label={placement.name}
        variant="feature"
        trackRef={track}
        onScroll={(event) => {
          const element = event.currentTarget;
          const cards = [...element.children] as HTMLElement[];
          if (!cards.length) return;
          const nearest = cards.reduce(
            (selected, card, position) =>
              Math.abs(
                card.offsetLeft - cards[0].offsetLeft - element.scrollLeft,
              ) <
              Math.abs(
                cards[selected].offsetLeft -
                  cards[0].offsetLeft -
                  element.scrollLeft,
              )
                ? position
                : selected,
            0,
          );
          setIndex(nearest);
        }}
      >
        {placement.items.map((item) => (
          <div key={item.id} className="grid min-w-0">
            <ServedCreativeCard
              item={item}
              simulate={simulate}
              busy={busy}
              onSimulate={onSimulate}
            />
          </div>
        ))}
      </HorizontalCarousel>
      {count > 1 && (
        <div className="flex flex-wrap items-center justify-between gap-3">
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
