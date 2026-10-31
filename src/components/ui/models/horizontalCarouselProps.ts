import type { ReactNode, Ref, UIEventHandler } from 'react';
export interface HorizontalCarouselProps {
  label: string;
  children: ReactNode;
  variant?: 'cards' | 'feature';
  trackRef?: Ref<HTMLDivElement>;
  onScroll?: UIEventHandler<HTMLDivElement>;
}
