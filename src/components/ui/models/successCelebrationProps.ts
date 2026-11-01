export interface SuccessCelebrationProps {
  sequence?: number;
  active?: boolean;
  ready?: boolean;
  variant?: 'burst' | 'onboarding';
  onComplete?: () => void;
  className?: string;
}
