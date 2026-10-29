import type { PollInput } from '../../models/poll';
import type { DemoPollOption } from './demoPollOption';
export interface DemoPoll extends Omit<PollInput, 'options'> {
  id: string;
  userId: string;
  options: DemoPollOption[];
  createdAt: string;
  updatedAt: string;
  deleted: boolean;
  hidden: boolean;
  votingLocked?: boolean;
}
