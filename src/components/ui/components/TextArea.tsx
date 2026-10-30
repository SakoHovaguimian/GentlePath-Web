'use client';

import { useImperativeHandle, useLayoutEffect, useRef } from 'react';
import { cn } from '../lib/cn';
import type { TextAreaProps } from '../models/textAreaProps';

export function TextArea({
  className,
  leadingIcon,
  autoGrow = true,
  rows = 1,
  ref,
  value,
  onInput,
  ...props
}: TextAreaProps) {
  const input = useRef<HTMLTextAreaElement>(null);
  useImperativeHandle(ref, () => input.current!, []);
  useLayoutEffect(() => {
    const element = input.current;
    if (!autoGrow || !element) return;
    const resize = () => {
      element.style.height = 'auto';
      element.style.height = `${element.scrollHeight + element.offsetHeight - element.clientHeight}px`;
    };
    resize();
    let width = element.clientWidth;
    const observer = new ResizeObserver(() => {
      if (element.clientWidth !== width) {
        width = element.clientWidth;
        resize();
      }
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [autoGrow, rows, value]);
  return (
    <div className="relative min-w-0">
      {leadingIcon && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-s-4 top-3 text-tertiary"
        >
          {leadingIcon}
        </span>
      )}
      <textarea
        ref={input}
        rows={rows}
        value={value}
        className={cn(
          'ui-input block w-full resize-none rounded-lg border border-control-border bg-primary px-4 py-3 text-sm text-primary outline-none transition placeholder:text-placeholder focus:border-brand focus:ring-4 focus:ring-brand/12 aria-invalid:border-error aria-invalid:focus:ring-error/12 read-only:bg-secondary_subtle disabled:cursor-not-allowed disabled:bg-disabled_subtle disabled:text-disabled',
          autoGrow ? 'min-h-0 overflow-hidden' : 'min-h-28',
          leadingIcon && 'ps-11',
          className,
        )}
        onInput={(event) => {
          if (autoGrow) {
            const element = event.currentTarget;
            element.style.height = 'auto';
            element.style.height = `${element.scrollHeight + element.offsetHeight - element.clientHeight}px`;
          }
          onInput?.(event);
        }}
        {...props}
      />
    </div>
  );
}
