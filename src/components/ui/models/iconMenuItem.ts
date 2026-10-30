import type { IconName } from './iconName';

export type IconMenuItem<T extends string> = {
  id: T;
  label: string;
  icon: IconName;
  variant?: 'default' | 'destructive';
  intent?: 'danger';
  disabled?: boolean;
  selected?: boolean;
};
