'use client';

import { useEffect, useRef, useState, type RefObject } from 'react';

// Keep the actual list order untouched until drop, with a live visual insertion gap.
export function useReorderDrag(
  list: RefObject<HTMLOListElement | null>,
  onMove: (id: string, targetId: string) => void,
) {
  const geometry = useRef<{ id: string; top: number; height: number }[]>([]);
  const pointer = useRef<{ id: string; y: number; scroll: number } | null>(
    null,
  );
  const [drag, setDrag] = useState<{
    id: string;
    target: string;
    offset: number;
  }>();
  function cancel() {
    pointer.current = null;
    setDrag(undefined);
  }
  useEffect(() => {
    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') cancel();
    };
    window.addEventListener('keydown', escape);
    return () => window.removeEventListener('keydown', escape);
  }, []);
  function start(id: string, y: number) {
    geometry.current = Array.from(list.current?.children ?? []).map((node) => {
      const row = node as HTMLElement;
      row.getAnimations().forEach((animation) => animation.cancel());
      const rect = row.getBoundingClientRect();
      return { id: row.dataset.motionKey!, top: rect.top, height: rect.height };
    });
    pointer.current = { id, y, scroll: window.scrollY };
    setDrag({ id, target: id, offset: 0 });
  }
  function locate(y: number) {
    const origin = pointer.current;
    if (!origin) return;
    const offset = y - origin.y + window.scrollY - origin.scroll;
    const source = geometry.current.find((row) => row.id === origin.id)!;
    const center = source.top + source.height / 2 + offset;
    const nearest = geometry.current.reduce((best, row) =>
      Math.abs(center - row.top - row.height / 2) <
      Math.abs(center - best.top - best.height / 2)
        ? row
        : best,
    );
    return { id: origin.id, target: nearest.id, offset };
  }
  function move(y: number) {
    if (!pointer.current) return;
    if (y < 80) window.scrollBy(0, -16);
    else if (y > window.innerHeight - 80) window.scrollBy(0, 16);
    setDrag(locate(y));
  }
  function drop(y: number) {
    const result = locate(y);
    if (result) {
      onMove(result.id, result.target);
    }
    cancel();
  }
  function offset(id: string) {
    if (!drag) return 0;
    if (id === drag.id) return drag.offset;
    const rows = geometry.current;
    const from = rows.findIndex((row) => row.id === drag.id);
    const to = rows.findIndex((row) => row.id === drag.target);
    const index = rows.findIndex((row) => row.id === id);
    if (from < index && index <= to) return -rows[from].height;
    if (to <= index && index < from) return rows[from].height;
    return 0;
  }
  return { drag, start, move, drop, cancel, offset };
}
