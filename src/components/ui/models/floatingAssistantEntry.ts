export type FloatingAssistantEntry = {
  id: string;
  title: string;
  description: string;
  disabled: boolean;
  onOpen?: () => void;
};
