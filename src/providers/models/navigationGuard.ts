export type NavigationGuard = () => boolean | Promise<boolean>;

export type NavigationGuardService = {
  register: (guard: NavigationGuard) => () => void;
  confirmNavigation: NavigationGuard;
};
