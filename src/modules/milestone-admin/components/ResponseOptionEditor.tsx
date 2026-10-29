'use client';
import {
  Button,
  EmptyState,
  Field,
  Input,
  ReorderableList,
  UiIcon,
} from '@/components/ui';
import { usePresentationService } from '@/presentation/PresentationProvider';
import { gentlePathMilestoneAdminStrings as copy } from '@/strings';
import type { ResponseOptionDraft } from '../models/responseOptionDraft';
const emptyOptionDraft = '';
interface ResponseOptionEditorProps {
  options: ResponseOptionDraft[];
  disabled: boolean;
  validation: Record<string, string>;
  onChange: (options: ResponseOptionDraft[]) => void;
}
export function ResponseOptionEditor({
  options,
  disabled,
  validation,
  onChange,
}: ResponseOptionEditorProps) {
  const { showAlert } = usePresentationService();
  async function remove(option: ResponseOptionDraft) {
    if (
      option.existing &&
      !(await showAlert({
        title: copy.removeOptionTitle,
        description: copy.removeOptionDescription(option.label),
        tone: 'warning',
        confirmLabel: copy.removeOption,
        cancelLabel: copy.cancel,
      }))
    )
      return;
    onChange(options.filter((item) => item.id !== option.id));
  }
  function move(id: string, targetId: string) {
    const next = [...options],
      from = next.findIndex((option) => option.id === id),
      to = next.findIndex((option) => option.id === targetId);
    if (from < 0 || to < 0) return;
    next.splice(to, 0, next.splice(from, 1)[0]);
    onChange(next);
  }
  return (
    <div className="grid gap-4">
      {options.length ? (
        <ReorderableList
          items={options}
          disabled={disabled}
          label={copy.optionsTitle}
          handleLabel={(option) =>
            copy.optionHandle(option.label || copy.newOptionLabel)
          }
          upLabel={(option) =>
            copy.optionUp(option.label || copy.newOptionLabel)
          }
          downLabel={(option) =>
            copy.optionDown(option.label || copy.newOptionLabel)
          }
          onMove={move}
          renderItem={(option, index, controls, handle) => (
            <div className="grid min-w-0 gap-4 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2">
                  {handle}
                  <span className="text-sm font-medium text-primary">
                    {copy.optionNumber(index + 1)}
                  </span>
                </div>
                {controls}
              </div>
              <div className="grid min-w-0 gap-4 sm:grid-cols-2">
                <Field labelText={copy.valueLabel}>
                  <Input
                    name={`response_options.${index}.value`}
                    value={option.value}
                    maxLength={500}
                    readOnly={option.existing}
                    disabled={disabled}
                    aria-invalid={Boolean(
                      validation[`response_options.${index}.value`] ||
                      validation.response_options,
                    )}
                    aria-describedby={
                      validation[`response_options.${index}.value`] ||
                      validation.response_options
                        ? 'milestone-validation'
                        : 'response-option-history'
                    }
                    onChange={(event) =>
                      onChange(
                        options.map((item) =>
                          item.id === option.id
                            ? { ...item, value: event.target.value }
                            : item,
                        ),
                      )
                    }
                  />
                </Field>
                <Field labelText={copy.labelLabel}>
                  <Input
                    name={`response_options.${index}.label`}
                    value={option.label}
                    maxLength={500}
                    disabled={disabled}
                    aria-invalid={Boolean(
                      validation[`response_options.${index}.label`],
                    )}
                    aria-describedby={
                      validation[`response_options.${index}.label`]
                        ? 'milestone-validation'
                        : 'response-option-history'
                    }
                    onChange={(event) =>
                      onChange(
                        options.map((item) =>
                          item.id === option.id
                            ? { ...item, label: event.target.value }
                            : item,
                        ),
                      )
                    }
                  />
                </Field>
              </div>
              <div className="flex justify-end">
                <Button
                  variant="destructive"
                  disabled={disabled}
                  onClick={() => void remove(option)}
                >
                  <UiIcon name="trash" />
                  {copy.removeOption}
                </Button>
              </div>
            </div>
          )}
        />
      ) : (
        <EmptyState
          variant="plain"
          title={copy.noOptionsTitle}
          description={copy.noOptionsDescription}
        />
      )}
      <Button
        className="justify-self-start"
        variant="secondary"
        disabled={disabled || options.length >= 100}
        onClick={() =>
          onChange([
            ...options,
            {
              id: crypto.randomUUID(),
              value: emptyOptionDraft,
              label: emptyOptionDraft,
              existing: false,
            },
          ])
        }
      >
        <UiIcon name="plus" />
        {copy.addOption}
      </Button>
    </div>
  );
}
