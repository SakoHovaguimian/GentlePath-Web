export interface DemoCommunityComment {
  id: string;
  postId: string;
  parentCommentId: string | null;
  userId: string;
  body: string;
  createdAt: string;
  updatedAt: string;
  deleted: boolean;
  hidden: boolean;
}
