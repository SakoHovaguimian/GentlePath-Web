export interface DemoThreadComment {
  id: string;
  parentCommentId: string | null;
  userId: string;
  deleted: boolean;
  hidden: boolean;
}
