import type { Metadata } from 'next';
import { gentlePathMilestoneAdminStrings as copy } from '@/strings';
import { FamilyTipsScreen } from '@/modules/milestone-admin/FamilyTipsScreen';
export const metadata: Metadata = { title: copy.tipsTitle };
export default function TipsPage() {
  return <FamilyTipsScreen />;
}
