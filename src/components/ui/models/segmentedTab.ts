export type SegmentedTab<T extends string> = {
  value: T;
  label: string;
  meta?: string;
  panelId?: string;
};
