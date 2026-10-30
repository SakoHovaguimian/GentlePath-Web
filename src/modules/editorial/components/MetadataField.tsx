import { TextArea } from '@/components/ui';
import { gentlePathEditorialStrings as copy } from '@/strings';
import { EditorField } from './EditorField';

interface Props {
  id: string;
  value: string;
  error?: string;
  disabled: boolean;
  onChangeAction: (value: string) => void;
}
export function MetadataField({
  id,
  value,
  error,
  disabled,
  onChangeAction,
}: Props) {
  return (
    <details
      open={error ? true : undefined}
      className="grid min-w-0 rounded-lg border border-secondary p-4"
    >
      <summary className="cursor-pointer text-sm font-medium text-secondary outline-none focus-visible:ring-4 focus-visible:ring-brand/12">
        {copy.metadataDisclosure}
      </summary>
      <div className="mt-4">
        <EditorField
          id={id}
          label={copy.metadataLabel}
          hint={copy.metadataHint}
          error={error}
        >
          <TextArea
            value={value}
            maxLength={20000}
            disabled={disabled}
            className="font-mono"
            onChange={(event) => onChangeAction(event.target.value)}
          />
        </EditorField>
      </div>
    </details>
  );
}
