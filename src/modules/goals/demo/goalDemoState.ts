import 'server-only';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { populatedDemoUsers } from '@/services/demo/demoFixtures';
import { getDemoPortalState } from '@/services/demo/demoPortalState';
import { gentlePathGoalStrings as copy } from '@/strings';
import type { Goal } from '../models/goal';
import type { GoalMedia } from '../models/goalMedia';
import type { DemoGoalUpload } from './models/demoGoalUpload';
import type { DemoGoalState } from './models/demoGoalState';

const globalState = globalThis as typeof globalThis & {
  gentlePathGoals?: DemoGoalState;
};
function createState(): DemoGoalState {
  const uploads = new Map<string, DemoGoalUpload>();
  const image = readFileSync(
    join(process.cwd(), 'public/gentlepath/family-connection-blonde.png'),
  );
  const goals = populatedDemoUsers.flatMap((user) => {
    const child = getDemoPortalState().children.find(
      (item) => item.userId === user.id,
    );
    if (!child) return [];
    return [
      copy.demoGoalTitle,
      copy.demoCompletedTitle,
      copy.demoArchivedTitle,
    ].map((title, index): Goal => {
      const id = crypto.randomUUID();
      const mediaId = crypto.randomUUID();
      const date = new Date(Date.now() - (index + 1) * 86400000).toISOString();
      const media: GoalMedia = {
        id: mediaId,
        goal_id: id,
        user_id: user.id,
        child_id: child.id,
        upload_session_id: mediaId,
        original_file_name: 'family-connection-blonde.png',
        mime_type: 'image/png',
        size_bytes: image.length,
        position: 0,
        created_at: date,
      };
      if (index === 0)
        uploads.set(mediaId, {
          id: mediaId,
          userId: user.id,
          input: {
            child_id: child.id,
            original_file_name: media.original_file_name,
            mime_type: media.mime_type,
            size_bytes: image.length,
          },
          expiresAt: 0,
          retainUntil: Number.MAX_SAFE_INTEGER,
          bytes: image,
          media,
        });
      return {
        id,
        user_id: user.id,
        child_id: child.id,
        title,
        description: copy.demoGoalDescription,
        status: index === 0 ? 'ACTIVE' : index === 1 ? 'COMPLETED' : 'ARCHIVED',
        cover_media_id: index === 0 ? mediaId : null,
        completed_at: index === 1 ? date : null,
        deleted: false,
        created_at: date,
        updated_at: date,
        media: index === 0 ? [media] : [],
        notes: [
          {
            id: crypto.randomUUID(),
            goal_id: id,
            message: copy.demoNote,
            occurred_at: date,
            created_at: date,
            updated_at: date,
          },
        ],
      };
    });
  });
  return { goals, uploads };
}
export function getDemoGoalState(): DemoGoalState {
  return (globalState.gentlePathGoals ??= createState());
}
export function resetDemoGoalState(): void {
  delete globalState.gentlePathGoals;
}

export function resetDemoGoalUser(userId: string): void {
  const state = getDemoGoalState();
  state.goals = state.goals.filter((goal) => goal.user_id !== userId);
  for (const [id, upload] of state.uploads)
    if (upload.userId === userId) state.uploads.delete(id);
}
