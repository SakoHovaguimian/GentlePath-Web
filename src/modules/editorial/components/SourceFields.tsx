import { Input } from '@/components/ui';
import { gentlePathEditorialStrings as copy } from '@/strings';
import type { SourceDraft } from '../models/sourceDraft';
import type { EditorialFormErrors } from '../models/editorialFormErrors';
import { EditorField } from './EditorField';

interface Props {
  value: SourceDraft;
  prefix: string;
  errors: EditorialFormErrors;
  disabled: boolean;
  onChangeAction: (next: SourceDraft) => void;
}
export function SourceFields({
  value,
  prefix,
  errors,
  disabled,
  onChangeAction,
}: Props) {
  const id = (key: string) => `editorial-${prefix.replaceAll('.', '-')}-${key}`;
  return (
    <div className="grid min-w-0 gap-4">
      <EditorField
        id={id('source_name')}
        label={copy.sourceNameLabel}
        error={errors[`${prefix}.source_name`]}
      >
        <Input
          value={value.sourceName}
          maxLength={300}
          disabled={disabled}
          onChange={(event) =>
            onChangeAction({ ...value, sourceName: event.target.value })
          }
        />
      </EditorField>
      <EditorField
        id={id('source_url')}
        label={copy.sourceUrlLabel}
        error={errors[`${prefix}.source_url`]}
      >
        <Input
          type="url"
          value={value.sourceUrl}
          maxLength={1000}
          disabled={disabled}
          onChange={(event) =>
            onChangeAction({ ...value, sourceUrl: event.target.value })
          }
        />
      </EditorField>
      <EditorField
        id={id('source_published_at')}
        label={copy.sourceDateLabel}
        error={errors[`${prefix}.source_published_at`]}
      >
        <Input
          type="date"
          value={value.sourceDate}
          max={new Date().toISOString().slice(0, 10)}
          disabled={disabled}
          onChange={(event) =>
            onChangeAction({ ...value, sourceDate: event.target.value })
          }
        />
      </EditorField>
    </div>
  );
}
