import type { IconName } from './iconName';

export interface QuickActionItem {
  id: string;
  label: string;
  icon: IconName;
  onClick: () => void;
}
