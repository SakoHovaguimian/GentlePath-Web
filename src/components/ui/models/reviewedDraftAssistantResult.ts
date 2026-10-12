export type ReviewedDraftAssistantResult = {
  suggestions: Record<string, string | null>;
  questions?: string[];
  warnings?: string[];
};
