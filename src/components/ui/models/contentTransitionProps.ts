import type { ReactNode } from 'react';
export interface ContentTransitionProps {
  children: ReactNode;
  revision: unknown;
  busy?: boolean;
}
