export type StepperStep<Key extends string = string> = {
  key: Key;
  label: string;
  description?: string;
  state: 'complete' | 'current' | 'upcoming';
  // Announced after the label, e.g. "Current Step" or "Ready".
  stateLabel: string;
  disabled?: boolean;
};
