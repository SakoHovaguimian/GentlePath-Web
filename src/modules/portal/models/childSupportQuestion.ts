import type { IconName } from '@/components/ui/models/iconName';
import type { ChildSupportDetails } from './childSupportDetails';

export interface ChildSupportQuestion {
  key: keyof ChildSupportDetails;
  icon: IconName;
}
