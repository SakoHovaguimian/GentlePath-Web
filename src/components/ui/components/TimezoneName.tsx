import { Fragment } from 'react';

// Prefer IANA path boundaries to breaking timezone names in the middle of a word.
export function TimezoneName({ value }: { value?: string }) {
  if (!value) return null;
  const parts = value.split(/(?<=\/)/);
  return (
    <span>
      {parts.map((part, index) => (
        <Fragment key={index}>
          {part}
          {index < parts.length - 1 && <wbr />}
        </Fragment>
      ))}
    </span>
  );
}
