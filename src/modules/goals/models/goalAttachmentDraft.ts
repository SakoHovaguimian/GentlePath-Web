import type { GoalMedia } from './goalMedia';
export interface GoalAttachmentDraft {
  id: string;
  file?: File;
  media?: GoalMedia;
  progress: number;
  status: 'uploading' | 'ready' | 'failed';
}
