import type { GoalMedia } from '../../models/goalMedia';
import type { GoalUploadInput } from '../../models/goalUploadInput';

export interface DemoGoalUpload {
  id: string;
  userId: string;
  input: GoalUploadInput;
  expiresAt: number;
  retainUntil: number;
  bytes?: Buffer;
  media?: GoalMedia;
  cancelled?: boolean;
}
