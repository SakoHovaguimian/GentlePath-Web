'use client';

import { useRef, type ReactNode } from 'react';
import { useReorderDrag } from '../useReorderDrag';
import { ListGroup } from './ListRow';
import { IconButton } from './IconButton';
import { UiIcon } from './UiIcon';
import { useListMotion } from '../lib/useListMotion';

interface ReorderableListProps<T extends { id: string }> {
  items: T[];
  disabled: boolean;
  label: string;
  handleLabel: (item: T) => string;
  upLabel: (item: T) => string;
  downLabel: (item: T) => string;
  onMove: (id: string, targetId: string) => void;
  renderItem: (
    item: T,
    index: number,
    controls: ReactNode,
    handle: ReactNode,
  ) => ReactNode;
}

// Pointer handles support mouse, pen, and touch; arrows provide a keyboard alternative.
export function ReorderableList<T extends { id: string }>({
  items,
  disabled,
  label,
  handleLabel,
  upLabel,
  downLabel,
  onMove,
  renderItem,
}: ReorderableListProps<T>) {
  const skipMotion = useRef(false);
  const listRef = useListMotion(skipMotion);
  const reorder = useReorderDrag(listRef, (id, targetId) => {
    skipMotion.current = true;
    onMove(id, targetId);
  });
  return (
    <ListGroup ordered label={label} listRef={listRef}>
      {items.map((item, index) => (
        <li
          key={item.id}
          data-motion-key={item.id}
          data-reordering={Boolean(reorder.drag) || undefined}
          data-dragging={reorder.drag?.id === item.id || undefined}
          className="ui-reorder-row relative"
          style={{ translate: `0 ${reorder.offset(item.id)}px` }}
        >
          {renderItem(
            item,
            index,
            <div className="flex shrink-0 gap-1">
              <IconButton
                variant="ghost"
                label={upLabel(item)}
                disabled={disabled || index === 0}
                onClick={() => onMove(item.id, items[index - 1].id)}
              >
                <UiIcon name="arrowUp" />
              </IconButton>
              <IconButton
                variant="ghost"
                label={downLabel(item)}
                disabled={disabled || index === items.length - 1}
                onClick={() => onMove(item.id, items[index + 1].id)}
              >
                <UiIcon name="arrowUp" className="rotate-180" />
              </IconButton>
            </div>,
            <IconButton
              variant="ghost"
              label={handleLabel(item)}
              disabled={disabled || items.length < 2}
              className="touch-none cursor-grab active:cursor-grabbing"
              onPointerDown={(event) => {
                if (disabled || event.button !== 0 || items.length < 2) return;
                event.preventDefault();
                event.currentTarget.focus();
                event.currentTarget.setPointerCapture(event.pointerId);
                reorder.start(item.id, event.clientY);
              }}
              onPointerMove={(event) => reorder.move(event.clientY)}
              onPointerUp={(event) => {
                if (!disabled) reorder.drop(event.clientY);
                else reorder.cancel();
              }}
              onPointerCancel={reorder.cancel}
              onLostPointerCapture={reorder.cancel}
              onKeyDown={(event) => {
                if (event.key === 'Escape') reorder.cancel();
                if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown')
                  return;
                event.preventDefault();
                const next = items[index + (event.key === 'ArrowUp' ? -1 : 1)];
                if (!disabled && next) onMove(item.id, next.id);
              }}
            >
              <UiIcon name="grip" />
            </IconButton>,
          )}
        </li>
      ))}
    </ListGroup>
  );
}
