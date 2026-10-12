import type { ReactNode } from 'react';
import type { IconName } from './iconName';

export type DetailItem = {
  label: string;
  value: ReactNode;
  icon?: IconName;
  fullWidth?: boolean;
};
