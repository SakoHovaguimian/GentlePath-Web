import type { PollBallot } from '../../models/pollBallot';
import type { DemoPoll } from './demoPoll';
import type { DemoPollComment } from './demoPollComment';
export interface DemoPollState {
  polls: DemoPoll[];
  ballots: PollBallot[];
  comments: DemoPollComment[];
  commentLikes: Map<string, Set<string>>;
}
