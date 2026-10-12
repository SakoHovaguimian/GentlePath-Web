'use client';

import { createContext, useContext } from 'react';
import { strings } from '@/strings';
import type { FloatingAssistantEntry } from '../models/floatingAssistantEntry';

export const FloatingAssistantContext = createContext<{
  activeId: string | null;
  register: (entry: FloatingAssistantEntry) => void;
  unregister: (id: string) => void;
  close: () => void;
  focusLauncher: () => void;
} | null>(null);

export function useFloatingAssistantContext() {
  const context = useContext(FloatingAssistantContext);
  if (!context) throw new Error(strings.errors.provider);
  return context;
}
