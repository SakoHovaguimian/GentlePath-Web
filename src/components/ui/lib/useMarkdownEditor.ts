'use client';

import { useRef, useState, type KeyboardEvent } from 'react';
import type {
  MarkdownAction,
  MarkdownSelection,
} from '../models/markdownAction';
import { applyMarkdownAction } from './markdownCommands';

export function useMarkdownEditor(
  value: string,
  onChange: (value: string) => void,
  maxLength: number,
  disabled: boolean,
) {
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const history = useRef<{
    past: MarkdownSelection[];
    future: MarkdownSelection[];
  }>({ past: [], future: [] });
  const lastTyping = useRef(0);
  const [availability, setAvailability] = useState({
    undo: false,
    redo: false,
  });
  const [limitReached, setLimitReached] = useState(false);
  function current(): MarkdownSelection {
    return {
      value,
      start: inputRef.current?.selectionStart ?? value.length,
      end: inputRef.current?.selectionEnd ?? value.length,
    };
  }
  function announceHistory() {
    setAvailability({
      undo: history.current.past.length > 0,
      redo: history.current.future.length > 0,
    });
  }
  function restore(selection: MarkdownSelection) {
    onChange(selection.value);
    requestAnimationFrame(() => {
      inputRef.current?.focus({ preventScroll: true });
      inputRef.current?.setSelectionRange(selection.start, selection.end);
    });
  }
  function commit(selection: MarkdownSelection, typing = false) {
    if (disabled || selection.value === value) return;
    if (selection.value.length > maxLength) {
      setLimitReached(true);
      return;
    }
    const now = Date.now();
    if (
      !typing ||
      now - lastTyping.current > 800 ||
      !history.current.past.length
    ) {
      history.current.past.push(current());
      if (history.current.past.length > 100) history.current.past.shift();
    }
    lastTyping.current = typing ? now : 0;
    history.current.future = [];
    setLimitReached(false);
    announceHistory();
    if (typing) onChange(selection.value);
    else restore(selection);
  }
  function apply(action: MarkdownAction) {
    commit(applyMarkdownAction(action, current()));
  }
  function moveHistory(direction: 'undo' | 'redo') {
    if (disabled) return;
    const source =
      direction === 'undo' ? history.current.past : history.current.future;
    const destination =
      direction === 'undo' ? history.current.future : history.current.past;
    const previous = source.pop();
    if (!previous) return;
    destination.push(current());
    lastTyping.current = 0;
    setLimitReached(false);
    restore(previous);
    announceHistory();
  }
  function onKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (
      disabled ||
      event.nativeEvent.isComposing ||
      !(event.metaKey || event.ctrlKey) ||
      event.altKey
    )
      return;
    const key = event.key.toLowerCase();
    if (key === 'z' || key === 'y') {
      event.preventDefault();
      moveHistory(key === 'y' || event.shiftKey ? 'redo' : 'undo');
    } else if (key === 'b' || key === 'i' || key === 'k') {
      event.preventDefault();
      apply(key === 'b' ? 'bold' : key === 'i' ? 'italic' : 'link');
    }
  }
  return {
    inputRef,
    availability,
    limitReached,
    apply,
    undo: () => moveHistory('undo'),
    redo: () => moveHistory('redo'),
    onKeyDown,
    write: (next: string) =>
      commit(
        {
          value: next,
          start: inputRef.current?.selectionStart ?? next.length,
          end: inputRef.current?.selectionEnd ?? next.length,
        },
        true,
      ),
  };
}
