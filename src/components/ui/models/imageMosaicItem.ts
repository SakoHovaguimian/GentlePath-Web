import type { ReactNode } from 'react';

export type ImageMosaicItem = {
  id: string;
  title: string;
  alt: string;
  src?: string;
  caption?: string;
  fallback: ReactNode;
};
