'use client';

import { strings } from '@/strings';
import type { MarkdownAction } from '../models/markdownAction';
import type { IconName } from '../models/iconName';
import { IconButton } from './IconButton';
import { UiIcon } from './UiIcon';
import { IconMenu } from './IconMenu';

const groups: MarkdownAction[][] = [
  ['heading1', 'heading2', 'heading3'],
  ['bold', 'italic', 'strike', 'inlineCode'],
  ['bullet', 'numbered', 'task', 'quote'],
  ['link', 'table', 'codeBlock', 'divider', 'footnote'],
];
const icons: Record<MarkdownAction, IconName> = {
  heading1: 'heading1',
  heading2: 'heading2',
  heading3: 'heading3',
  bold: 'bold',
  italic: 'italic',
  strike: 'strikethrough',
  bullet: 'listBullet',
  numbered: 'listNumbered',
  task: 'checklist',
  quote: 'quote',
  link: 'link',
  table: 'table',
  inlineCode: 'inlineCode',
  codeBlock: 'codeBlock',
  divider: 'divider',
  footnote: 'footnote',
};

export function MarkdownToolbar({
  disabled,
  apply,
  undo,
  redo,
  canUndo,
  canRedo,
}: {
  disabled: boolean;
  apply: (action: MarkdownAction) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}) {
  const copy = strings.markdownEditor;
  const menus = [
    { label: copy.heading, icon: icons.heading1 },
    { label: copy.formatting, icon: icons.bold },
    { label: copy.lists, icon: icons.bullet },
    { label: copy.inserts, icon: 'plus' as const },
  ];
  return (
    <div
      role="group"
      aria-label={copy.toolbar}
      className="flex w-fit max-w-full min-w-0 flex-wrap items-center gap-1 rounded-lg border border-secondary bg-secondary_subtle p-2"
    >
      {groups.map((group, index) => (
        <IconMenu
          key={menus[index].label}
          label={menus[index].label}
          icon={menus[index].icon}
          items={group.map((action) => ({
            id: action,
            label: copy.actions[action],
            icon: icons[action],
          }))}
          disabled={disabled}
          onAction={apply}
        />
      ))}
      <div className="flex gap-1 border-s border-secondary ps-2">
        <IconButton
          label={copy.undo}
          variant="ghost"
          disabled={disabled || !canUndo}
          onClick={undo}
        >
          <UiIcon name="undo" />
        </IconButton>
        <IconButton
          label={copy.redo}
          variant="ghost"
          disabled={disabled || !canRedo}
          onClick={redo}
        >
          <UiIcon name="redo" />
        </IconButton>
      </div>
    </div>
  );
}
