import type { NavigationGuard } from './models/navigationGuard';

export function confirmNavigationGuards(
  guards: NavigationGuard[],
  start = 0,
): boolean | Promise<boolean> {
  for (let index = start; index < guards.length; index++) {
    const allowed = guards[index]();
    if (typeof allowed !== 'boolean') {
      return allowed.then((confirmed) =>
        confirmed ? confirmNavigationGuards(guards, index + 1) : false,
      );
    }
    if (!allowed) return false;
  }
  return true;
}
