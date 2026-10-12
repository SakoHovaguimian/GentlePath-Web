export type ReviewedDraftAssistantField = {
  key: string;
  label: string;
  maxLength: number;
  rows?: number;
  validate?: (value: string) => boolean;
  validationMessage?: string;
  options?: { value: string; label: string }[];
};
