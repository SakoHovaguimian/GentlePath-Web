import type { Metadata } from 'next';
import { gentlePathMilestoneAdminStrings as copy } from '@/strings';
import { FamilyTipsScreen } from '@/modules/milestone-admin/FamilyTipsScreen';
export const metadata: Metadata = { title: copy.reviewTitle };
export default function TipReviewPage() {
  return <FamilyTipsScreen staff />;
}
