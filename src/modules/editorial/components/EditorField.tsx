import { cloneElement, type ReactElement } from 'react';
import { Field } from '@/components/ui';

interface Props {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  children: ReactElement<{
    id?: string;
    'aria-invalid'?: boolean;
    'aria-describedby'?: string;
  }>;
}
export function EditorField({ id, label, error, hint, children }: Props) {
  const describedBy =
    [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(' ') ||
    undefined;
  return (
    <div className="grid min-w-0 gap-1.5">
      <Field labelText={label}>
        {cloneElement(children, {
          id,
          'aria-invalid': Boolean(error),
          'aria-describedby': describedBy,
        })}
      </Field>
      {hint && (
        <p id={`${id}-hint`} className="m-0 text-xs font-normal text-tertiary">
          {hint}
        </p>
      )}
      {error && (
        <p
          id={`${id}-error`}
          role="alert"
          className="m-0 text-sm text-error-primary"
        >
          {error}
        </p>
      )}
    </div>
  );
}
