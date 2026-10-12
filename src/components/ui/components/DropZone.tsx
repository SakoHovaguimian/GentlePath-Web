'use client';

import { useState, type ReactNode } from 'react';
import { cn } from '../lib/cn';

interface DropZoneProps {
  children: ReactNode;
  disabled?: boolean;
  onFiles: (files: FileList) => void;
}

export function DropZone({ children, disabled, onFiles }: DropZoneProps) {
  const [dragging, setDragging] = useState(false);
  return (
    <div
      data-dragging={dragging || undefined}
      onDragOver={(event) => {
        event.preventDefault();
        if (!disabled) setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(event) => {
        event.preventDefault();
        setDragging(false);
        if (!disabled) onFiles(event.dataTransfer.files);
      }}
      className={cn(
        'ui-drop-zone flex min-h-32 flex-wrap items-center gap-4 rounded-xl border border-dashed p-4 transition focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-brand',
        dragging
          ? 'border-brand bg-brand-primary'
          : 'border-secondary bg-secondary_subtle',
      )}
    >
      {children}
    </div>
  );
}
