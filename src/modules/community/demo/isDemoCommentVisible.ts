import type { DemoThreadComment } from './models/demoThreadComment';

export function isDemoCommentVisible<T extends DemoThreadComment>(
  comment: T,
  comments: T[],
  resourceId: (comment: T) => string,
  activeUser: (userId: string) => unknown,
): boolean {
  const visited = new Set<string>();
  let current: T | undefined = comment;
  while (current) {
    if (
      visited.has(current.id) ||
      current.deleted ||
      current.hidden ||
      !activeUser(current.userId)
    )
      return false;
    visited.add(current.id);
    if (!current.parentCommentId) return true;
    const parentId: string = current.parentCommentId;
    current = comments.find(
      (parent) =>
        parent.id === parentId && resourceId(parent) === resourceId(comment),
    );
  }
  return false;
}
