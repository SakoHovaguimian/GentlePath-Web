'use client';

import { useCallback, useMemo, useRef, useState, type ReactNode } from 'react';
import { strings } from '@/strings';
import { FloatingAssistantContext } from '../lib/floatingAssistantContext';
import type { FloatingAssistantEntry } from '../models/floatingAssistantEntry';
import { useFloatingAssistantOffset } from '../useFloatingAssistantOffset';
import { Button } from './Button';
import { FloatingAssistantDialog } from './FloatingAssistantDialog';
import { UiIcon } from './UiIcon';

export function FloatingAssistantProvider({
  children,
  hideLauncher = false,
}: {
  // A render callback places the same registered-tool launcher in a page header.
  children: ReactNode | ((launcher: ReactNode) => ReactNode);
  hideLauncher?: boolean;
}) {
  const [entries, setEntries] = useState<FloatingAssistantEntry[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [choosing, setChoosing] = useState(false);
  const transferring = useRef(false);
  const launcher = useRef<HTMLButtonElement>(null);
  const inline = typeof children === 'function';
  const offset = useFloatingAssistantOffset(
    !inline && !hideLauncher && entries.length > 0,
  );
  const register = useCallback((entry: FloatingAssistantEntry) => {
    setEntries((current) =>
      current.some((item) => item.id === entry.id)
        ? current.map((item) => (item.id === entry.id ? entry : item))
        : [...current, entry],
    );
  }, []);
  const unregister = useCallback((id: string) => {
    setEntries((current) => current.filter((item) => item.id !== id));
    setActiveId((current) => (current === id ? null : current));
  }, []);
  const close = useCallback(() => setActiveId(null), []);
  const focusLauncher = useCallback(() => launcher.current?.focus(), []);
  const context = useMemo(
    () => ({ activeId, register, unregister, close, focusLauncher }),
    [activeId, register, unregister, close, focusLauncher],
  );
  const copy = strings.floatingAssistant;
  function open(entry: FloatingAssistantEntry) {
    if (entry.disabled) return;
    if (entry.onOpen) entry.onOpen();
    else setActiveId(entry.id);
  }
  const trigger = !hideLauncher && entries.length > 0 && (
    <Button
      ref={launcher}
      className={
        inline
          ? undefined
          : 'max-w-[calc(100vw-2rem)] rounded-full px-5 py-3 shadow-(--dashboard-shell-shadow-lg)'
      }
      disabled={entries.every((entry) => entry.disabled)}
      aria-haspopup="dialog"
      onClick={() => {
        if (entries.length === 1) open(entries[0]);
        else {
          transferring.current = false;
          setChoosing(true);
        }
      }}
    >
      <UiIcon name="sparkles" className="size-5" />
      {inline || entries.length > 1 ? copy.open : entries[0].title}
    </Button>
  );
  return (
    <FloatingAssistantContext.Provider value={context}>
      {typeof children === 'function' ? children(trigger) : children}
      {!inline && trigger && (
        <div ref={offset} className="ui-floating-assistant fixed z-40">
          {trigger}
        </div>
      )}
      <FloatingAssistantDialog
        open={choosing && entries.length > 0}
        title={copy.open}
        description={copy.description}
        onClose={() => setChoosing(false)}
        onReturnFocus={() => {
          if (!transferring.current) focusLauncher();
        }}
      >
        {entries.map((entry) => (
          <Button
            key={entry.id}
            variant="secondary"
            className="justify-start gap-4 rounded-xl p-4 text-start"
            disabled={entry.disabled}
            onClick={() => {
              transferring.current = true;
              setChoosing(false);
              // Let the chooser release its focus trap before the selected tool opens.
              requestAnimationFrame(() => open(entry));
            }}
          >
            <UiIcon name="sparkles" className="size-6 text-brand-secondary" />
            <span className="grid min-w-0 gap-1">
              <span>{entry.title}</span>
              <span className="text-sm font-normal text-tertiary">
                {entry.description}
              </span>
            </span>
          </Button>
        ))}
      </FloatingAssistantDialog>
    </FloatingAssistantContext.Provider>
  );
}
