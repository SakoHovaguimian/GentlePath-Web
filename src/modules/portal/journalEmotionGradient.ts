import type { JournalEmotion } from './models/journalEmotion';

const emotionColors: Readonly<Record<string, string>> = {
  hopeful: 'var(--gp-sage)',
  calm: 'var(--gp-lilac)',
  tired: 'var(--gp-lilac)',
  overwhelmed: 'var(--gp-clay)',
  grateful: 'var(--gp-sunlight)',
};

export function journalEmotionGradient(emotions: readonly JournalEmotion[]) {
  const colors = emotions.map((emotion) =>
    Object.hasOwn(emotionColors, emotion)
      ? emotionColors[emotion]
      : 'var(--gp-sage)',
  );
  if (colors.length < 2) {
    const color = colors[0] ?? 'var(--gp-sage)';
    return `linear-gradient(90deg, ${color}, ${color})`;
  }
  return `linear-gradient(90deg, ${colors.join(', ')})`;
}
