import type { Goal } from '../../models/goal';
import type { DemoGoalUpload } from './demoGoalUpload';

export interface DemoGoalState {
  goals: Goal[];
  uploads: Map<string, DemoGoalUpload>;
}
