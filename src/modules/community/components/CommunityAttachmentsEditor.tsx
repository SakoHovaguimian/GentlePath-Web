import { useId } from 'react';
import {
  Button,
  Field,
  IconButton,
  Input,
  Select,
  TextArea,
  UiIcon,
} from '@/components/ui';
import { gentlePathCommunityStrings as copy } from '@/strings';
import type { CommunityAttachment } from '../models/communityAttachment';
import { CommunityAttachmentKindSchema } from '../models/communityAttachmentKind';

export function CommunityAttachmentsEditor({
  value,
  onChange,
  disabled,
  error,
}: {
  value: CommunityAttachment[];
  onChange: (value: CommunityAttachment[]) => void;
  disabled: boolean;
  error?: string;
}) {
  const id = useId();
  const emptyDescription = '';
  function update(index: number, patch: Partial<CommunityAttachment>) {
    onChange(
      value.map((item, position) =>
        position === index ? { ...item, ...patch } : item,
      ),
    );
  }
  return (
    <fieldset className="gp-community-attachment-editor" disabled={disabled}>
      <legend className="text-base font-semibold text-primary">
        {copy.attachmentsTitle}
      </legend>
      <p id={`${id}-hint`} className="m-0 text-sm text-secondary">
        {copy.attachmentsHint}
      </p>
      {value.map((item, index) => (
        <div
          key={index}
          className="gp-community-attachment-editor__item"
          role="group"
          aria-label={copy.attachmentItem(index + 1)}
        >
          <div className="flex items-end gap-3">
            <Field labelText={copy.attachmentKind} className="min-w-0 flex-1">
              <Select
                value={item.kind}
                disabled={disabled}
                onValueChange={(kind) =>
                  update(index, {
                    kind: CommunityAttachmentKindSchema.parse(kind),
                  })
                }
              >
                {Object.entries(copy.attachmentKinds).map(([kind, label]) => (
                  <option key={kind} value={kind}>
                    {label}
                  </option>
                ))}
              </Select>
            </Field>
            <IconButton
              variant="destructive"
              label={copy.removeAttachment(index + 1)}
              disabled={disabled}
              onClick={() =>
                onChange(value.filter((_, position) => position !== index))
              }
            >
              <UiIcon name="trash" />
            </IconButton>
          </div>
          <Field labelText={copy.attachmentUrl}>
            <Input
              name={`attachment-url-${index}`}
              type="url"
              value={item.url}
              maxLength={1000}
              placeholder={copy.imagePlaceholder}
              disabled={disabled}
              aria-invalid={Boolean(error)}
              aria-describedby={`${id}-hint${error ? ` ${id}-error` : ''}`}
              onChange={(event) => update(index, { url: event.target.value })}
            />
          </Field>
          {item.kind === 'VIDEO' && (
            <p className="m-0 text-xs text-tertiary">
              {copy.videoAttachmentHint}
            </p>
          )}
          <Field labelText={copy.attachmentDescription}>
            <TextArea
              name={`attachment-description-${index}`}
              value={item.description}
              maxLength={500}
              placeholder={copy.attachmentDescriptionPlaceholder}
              disabled={disabled}
              aria-invalid={Boolean(error)}
              aria-describedby={error ? `${id}-error` : undefined}
              onChange={(event) =>
                update(index, { description: event.target.value })
              }
            />
          </Field>
        </div>
      ))}
      {error && (
        <p
          id={`${id}-error`}
          role="alert"
          className="m-0 text-sm text-error-primary"
        >
          {error}
        </p>
      )}
      <Button
        variant="secondary"
        className="justify-self-start"
        disabled={disabled || value.length >= 10}
        onClick={() =>
          onChange([
            ...value,
            { kind: 'IMAGE', url: '', description: emptyDescription },
          ])
        }
      >
        <UiIcon name="plus" />
        {copy.addAttachment}
      </Button>
    </fieldset>
  );
}
