import { gentlePathPortalStrings as copy } from '@/strings';
import type { JournalEmotion } from '../models/journalEmotion';

export function JournalEmotions({
  emotions,
}: {
  emotions: readonly JournalEmotion[];
}) {
  return emotions.map((emotion) => (
    <span key={emotion} className="gp-emotion" data-emotion={emotion}>
      {Object.hasOwn(copy.journal.emotions, emotion)
        ? copy.journal.emotions[emotion as keyof typeof copy.journal.emotions]
        : emotion}
    </span>
  ));
}
