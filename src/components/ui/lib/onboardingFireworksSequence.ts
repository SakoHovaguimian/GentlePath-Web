import type { FireworkLaunch } from '../models/fireworkLaunch';

/** Normalized timing and positions scale with the shared scene duration. */
export const onboardingFireworksSequence: FireworkLaunch[] = [
  { start: 0, x: 0.17, y: 0.32, origin: 0.06, scale: 1, color: 0 },
  { start: 0.025, x: 0.83, y: 0.26, origin: 0.94, scale: 1.1, color: 1 },
  { start: 0.14, x: 0.3, y: 0.17, origin: 0.18, scale: 0.85, color: 2 },
  { start: 0.21, x: 0.91, y: 0.53, origin: 0.98, scale: 0.85, color: 3 },
  { start: 0.27, x: 0.08, y: 0.52, origin: 0.02, scale: 0.9, color: 4 },
  { start: 0.35, x: 0.76, y: 0.15, origin: 0.88, scale: 1.15, color: 2 },
  { start: 0.4, x: 0.2, y: 0.24, origin: 0.08, scale: 1.15, color: 3 },
  { start: 0.49, x: 0.87, y: 0.38, origin: 0.97, scale: 1, color: 4 },
  { start: 0.55, x: 0.11, y: 0.4, origin: 0.03, scale: 1, color: 2 },
  { start: 0.64, x: 0.23, y: 0.2, origin: 0.12, scale: 1.25, color: 1 },
  { start: 0.67, x: 0.77, y: 0.22, origin: 0.9, scale: 1.25, color: 0 },
  { start: 0.73, x: 0.5, y: 0.12, origin: 0.5, scale: 1.1, color: 2 },
];
