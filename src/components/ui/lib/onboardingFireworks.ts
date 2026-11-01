import type { CelebrationConfetti } from '../models/celebrationConfetti';
import type { FireworkSpark } from '../models/fireworkSpark';
import { onboardingFireworksSequence } from './onboardingFireworksSequence';
import { prefersReducedMotion } from './motionPreferences';

/** A finite, silent scene. All drawing and listeners end together on cleanup. */
export function playOnboardingFireworks(
  canvas: HTMLCanvasElement,
  duration: number,
  onComplete?: () => void,
) {
  const context = canvas.getContext('2d');
  if (!context || prefersReducedMotion() || document.hidden) {
    onComplete?.();
    return;
  }

  const main = canvas.closest('main');
  const compact = window.innerWidth < 600;
  const sparks: FireworkSpark[][] = onboardingFireworksSequence.map((launch) =>
    Array.from({ length: compact ? 38 : 66 }, (_, index) => ({
      angle: (index / (compact ? 38 : 66)) * Math.PI * 2,
      speed: 110 + Math.random() * 155,
      size: 1.2 + Math.random() * 1.4,
      life: 0.15 + Math.random() * 0.075,
      color: index % 5 === 0 ? (launch.color + 1) % 5 : launch.color,
    })),
  );
  const confetti: CelebrationConfetti[] = Array.from(
    { length: compact ? 64 : 116 },
    (_, index) => ({
      start: 0.42 + Math.random() * 0.35,
      x: Math.random(),
      drift: (Math.random() - 0.5) * 0.2,
      rotation: Math.random() * Math.PI * 2,
      size: 3 + Math.random() * 3,
      color: index % 5,
    }),
  );
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let frame = 0;
  let stopped = false;
  let width = 0;
  let height = 0;
  let ratio = 1;
  let layoutChanged = true;
  let protectedAreas: DOMRect[] = [];
  let colors: string[] = [];

  function readColors() {
    const theme = getComputedStyle(canvas);
    colors = [
      '--color-firework-mint',
      '--color-firework-lilac',
      '--color-firework-sunlight',
      '--color-firework-peach',
      '--color-firework-sky',
    ].map((token) => theme.getPropertyValue(token).trim());
  }

  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    layoutChanged = true;
  }

  function markLayoutChanged() {
    layoutChanged = true;
  }

  function stop(notify = false) {
    if (stopped) return;
    stopped = true;
    cancelAnimationFrame(frame);
    context?.clearRect(0, 0, canvas.width, canvas.height);
    canvas.dataset.celebrationState = 'complete';
    reducedMotion.removeEventListener('change', checkMotion);
    window.removeEventListener('resize', resize);
    window.removeEventListener('scroll', markLayoutChanged, true);
    document.removeEventListener('visibilitychange', checkVisibility);
    themeObserver.disconnect();
    if (notify) onComplete?.();
  }

  function checkMotion() {
    if (prefersReducedMotion()) stop(true);
    else readColors();
  }

  function checkVisibility() {
    if (document.hidden) stop(true);
  }

  const themeObserver = new MutationObserver(checkMotion);
  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-motion', 'class', 'data-accent'],
  });
  reducedMotion.addEventListener('change', checkMotion);
  window.addEventListener('resize', resize);
  window.addEventListener('scroll', markLayoutChanged, true);
  document.addEventListener('visibilitychange', checkVisibility);
  resize();
  readColors();
  canvas.dataset.celebrationState = 'playing';

  const started = performance.now();
  const flight = duration * 0.085;

  function draw(now: number) {
    if (!context || stopped) return;
    const elapsed = now - started;
    if (elapsed >= duration) {
      stop(true);
      return;
    }
    if (layoutChanged) {
      protectedAreas = Array.from(
        main?.querySelectorAll('h1, p, button, a') ?? [],
        (element) => element.getBoundingClientRect(),
      );
      layoutChanged = false;
    }
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    context.clearRect(0, 0, width, height);
    const scale = Math.min(width / 1000, 1);
    const finaleFade = Math.min(1, (duration - elapsed) / (duration * 0.12));

    onboardingFireworksSequence.forEach((launch, launchIndex) => {
      const age = elapsed - launch.start * duration;
      if (age < 0) return;
      const x = width * launch.x;
      const y = height * (compact ? 0.44 + launch.y * 0.3 : launch.y);
      const color = colors[launch.color];
      context.lineCap = 'round';

      if (age < flight) {
        const progress = age / flight;
        const ease = 1 - (1 - progress) ** 2;
        const previous = Math.max(0, progress - 0.12);
        const tailEase = 1 - (1 - previous) ** 2;
        const originX = width * launch.origin;
        const originY = height + 18;
        context.globalAlpha = Math.min(1, progress * 6) * 0.8;
        context.strokeStyle = color;
        context.lineWidth = 2;
        context.beginPath();
        context.moveTo(
          originX + (x - originX) * tailEase,
          originY + (y - originY) * tailEase,
        );
        context.lineTo(
          originX + (x - originX) * ease,
          originY + (y - originY) * ease,
        );
        context.stroke();
        context.fillStyle = color;
        context.beginPath();
        context.arc(
          originX + (x - originX) * ease,
          originY + (y - originY) * ease,
          2.5,
          0,
          Math.PI * 2,
        );
        context.fill();
        return;
      }

      const burstAge = age - flight;
      const seconds = burstAge / 1000;
      const expansion = (1 - Math.exp(-seconds * 1.5)) / 1.5;
      const tail = (1 - Math.exp(-Math.max(0, seconds - 0.045) * 1.5)) / 1.5;
      const spread = launch.scale * (0.65 + scale * 0.55);

      sparks[launchIndex].forEach((spark) => {
        const progress = burstAge / (duration * spark.life);
        if (progress >= 1) return;
        const vx = Math.cos(spark.angle) * spark.speed * spread;
        const vy = Math.sin(spark.angle) * spark.speed * spread;
        const tipX = x + vx * expansion;
        const tipY = y + vy * expansion + 35 * seconds ** 2;
        context.globalAlpha =
          Math.min(1, progress * 14, (1 - progress) * 2.5) * finaleFade;
        context.strokeStyle = colors[spark.color];
        context.shadowColor = colors[spark.color];
        context.shadowBlur = compact ? 0 : 5;
        context.lineWidth = spark.size;
        context.beginPath();
        context.moveTo(
          x + vx * tail,
          y + vy * tail + 35 * Math.max(0, seconds - 0.045) ** 2,
        );
        context.lineTo(tipX, tipY);
        context.stroke();
      });
      context.shadowBlur = 0;
    });

    confetti.forEach((piece) => {
      const progress = (elapsed / duration - piece.start) / 0.5;
      if (progress < 0 || progress > 1) return;
      const x =
        width * (piece.x + piece.drift * progress) +
        Math.sin(progress * 9 + piece.rotation) * 16;
      const y = -18 + progress * (height + 60);
      context.save();
      context.globalAlpha = Math.min(1, progress * 10) * finaleFade * 0.85;
      context.fillStyle = colors[piece.color];
      context.translate(x, y);
      context.rotate(piece.rotation + progress * 5);
      context.scale(Math.cos(progress * 10 + piece.rotation) * 0.6 + 0.8, 1);
      context.fillRect(
        -piece.size / 2,
        -piece.size,
        piece.size,
        piece.size * 2,
      );
      context.restore();
    });

    // Keep every welcome message, navigation control, and action unobscured.
    protectedAreas.forEach((area) => {
      context.clearRect(
        area.left - 8,
        area.top - 6,
        area.width + 16,
        area.height + 12,
      );
    });
    context.globalAlpha = 1;
    frame = requestAnimationFrame(draw);
  }

  frame = requestAnimationFrame(draw);
  return () => stop();
}
