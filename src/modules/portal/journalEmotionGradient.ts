import type { JournalEmotion } from './models/journalEmotion';

const emotionColors: Readonly<Record<string, string>> = {
  hopeful: 'var(--gp-sage)',
  calm: 'var(--gp-lilac)',
  tired: 'var(--gp-lilac)',
  overwhelmed: 'var(--gp-clay)',
  grateful: 'var(--gp-sunlight)',
};

export function journalEmotionGradient(emotions: readonly JournalEmotion[]) {
  const selectedEmotions = emotions.length ? emotions : ['hopeful'];
  const colors = selectedEmotions.map((emotion) => {
    const baseColor = Object.hasOwn(emotionColors, emotion)
      ? emotionColors[emotion]
      : 'var(--gp-sage)';
    const color = `color-mix(in srgb, ${baseColor} var(--gp-journal-header-opacity), transparent)`;
    return color;
  });
  if (colors.length === 1) {
    const color = colors[0];
    return `linear-gradient(90deg, ${color}, ${color})`;
  }
  return `linear-gradient(90deg, ${colors.join(', ')})`;
}
