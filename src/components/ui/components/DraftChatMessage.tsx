'use client';

import type { ReactNode } from 'react';
import { strings } from '@/strings';
import { UiIcon } from './UiIcon';

export function DraftChatMessage({
  children,
  user = false,
}: {
  children: ReactNode;
  user?: boolean;
}) {
  return (
    <div
      className={`ui-chat-message flex min-w-0 items-start gap-3 ${user ? 'justify-end' : ''}`}
    >
      {!user && (
        <UiIcon
          name="leaf"
          className="mt-3 size-5 shrink-0 text-brand-secondary"
        />
      )}
      <div
        className={`grid min-w-0 max-w-full gap-1 rounded-2xl border p-4 ${user ? 'border-brand/30 bg-brand-primary' : 'border-secondary bg-secondary_subtle'}`}
      >
        <p className="m-0 text-xs font-semibold text-brand-secondary">
          {user
            ? strings.assistantMessages.you
            : strings.assistantMessages.name}
        </p>
        <div className="text-sm whitespace-pre-wrap wrap-anywhere text-primary">
          {children}
        </div>
      </div>
    </div>
  );
}
