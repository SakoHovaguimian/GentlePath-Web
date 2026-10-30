import { z } from 'zod';

export const MilestoneProgressStateSchema = z.enum([
  'unrecorded',
  'not_yet',
  'emerging',
  'often',
  'stopped',
  'other',
]);
export type MilestoneProgressState = z.infer<
  typeof MilestoneProgressStateSchema
>;

export function milestoneProgressState(value?: string): MilestoneProgressState {
  if (!value) return 'unrecorded';
  if (
    value === 'not_yet' ||
    value === 'emerging' ||
    value === 'often' ||
    value === 'stopped'
  )
    return value;
  return 'other';
}
