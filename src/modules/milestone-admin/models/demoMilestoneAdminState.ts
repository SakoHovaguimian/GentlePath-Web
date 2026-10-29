import type { MilestoneGuidance } from './milestoneGuidance';
import type { FamilyTip } from './familyTip';
import type { MilestoneObservation } from './milestoneObservation';
export interface DemoMilestoneAdminState {
  milestones: MilestoneGuidance[];
  tips: Array<FamilyTip & { deleted: boolean }>;
  hiddenMilestoneIds: Set<string>;
  referencedOptionIds: Set<string>;
  observations: MilestoneObservation[];
}
