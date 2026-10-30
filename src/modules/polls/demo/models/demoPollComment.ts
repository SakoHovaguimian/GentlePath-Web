export interface DemoPollComment {
  id: string;
  pollId: string;
  parentCommentId: string | null;
  userId: string;
  body: string;
  createdAt: string;
  updatedAt: string;
  deleted: boolean;
  hidden: boolean;
}
