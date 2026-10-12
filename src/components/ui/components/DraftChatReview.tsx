import { strings } from '@/strings';
import type { useReviewedDraftAssistant } from '../useReviewedDraftAssistant';
import type { ReviewedDraftAssistantField } from '../models/reviewedDraftAssistant';
import { Button } from './Button';
import { Checkbox } from './Checkbox';
import { TextArea } from './TextArea';
import { Message } from './Message';
import { Select } from './Select';

export function DraftChatReview({
  resultRef,
  review,
  selected,
  setReview,
  setSelected,
  result,
  stale,
  canApply,
  apply,
  fields,
  blocked,
  onDecline,
}: Pick<
  ReturnType<typeof useReviewedDraftAssistant>,
  | 'resultRef'
  | 'review'
  | 'selected'
  | 'setReview'
  | 'setSelected'
  | 'result'
  | 'stale'
  | 'canApply'
  | 'apply'
> & {
  fields: ReviewedDraftAssistantField[];
  blocked: boolean;
  onDecline: () => void;
}) {
  const copy = strings.assistantMessages;
  return (
    <div
      ref={resultRef}
      tabIndex={-1}
      className="grid min-w-0 gap-4 rounded-xl border border-secondary p-4 focus-visible:outline-2 focus-visible:outline-brand"
    >
      <p className="m-0 text-sm font-semibold text-primary">{copy.preview}</p>
      <p className="m-0 text-xs text-secondary">{copy.previewHint}</p>
      {fields
        .filter((field) => field.key in review)
        .map((field) => {
          const invalid = Boolean(
            selected[field.key] &&
            field.validate &&
            !field.validate(review[field.key]?.trim() ?? ''),
          );
          const errorId = `draft-chat-${field.key}-error`;
          return (
            <div key={field.key} className="grid min-w-0 gap-2">
              <Checkbox
                label={field.label}
                checked={Boolean(selected[field.key])}
                disabled={blocked || stale}
                onChange={(event) =>
                  setSelected((current) => ({
                    ...current,
                    [field.key]: event.target.checked,
                  }))
                }
              />
              {field.options ? (
                <Select
                  aria-label={field.label}
                  aria-invalid={invalid}
                  aria-describedby={invalid ? errorId : undefined}
                  value={review[field.key]}
                  disabled={blocked || stale}
                  onValueChange={(value) =>
                    setReview((current) => ({
                      ...current,
                      [field.key]: value,
                    }))
                  }
                >
                  {field.options.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              ) : (
                <TextArea
                  aria-label={field.label}
                  aria-invalid={invalid}
                  aria-describedby={invalid ? errorId : undefined}
                  value={review[field.key]}
                  maxLength={field.maxLength}
                  rows={field.rows ?? 1}
                  className="min-h-12 resize-none"
                  disabled={blocked || stale}
                  onChange={(event) =>
                    setReview((current) => ({
                      ...current,
                      [field.key]: event.target.value,
                    }))
                  }
                />
              )}
              {invalid && (
                <Message
                  id={errorId}
                  intent="danger"
                  title={
                    field.validationMessage ??
                    strings.assistantMessages.invalidValue
                  }
                />
              )}
            </div>
          );
        })}
      {!Object.keys(review).length && (
        <Message intent="info" title={strings.draftAssistant.noSuggestions} />
      )}
      {!!result?.questions?.length && (
        <Message
          intent="info"
          title={copy.missing}
          description={result.questions.join(' ')}
        />
      )}
      {!!result?.warnings?.length && (
        <Message
          intent="warning"
          title={copy.notes}
          description={result.warnings.join(' ')}
        />
      )}
      {stale && (
        <Message intent="warning" title={strings.draftAssistant.changed} />
      )}
      <div className="flex flex-wrap gap-3">
        <Button
          disabled={blocked || stale || !canApply}
          onClick={() => apply()}
        >
          {copy.accept}
        </Button>
        <Button variant="secondary" disabled={blocked} onClick={onDecline}>
          {copy.decline}
        </Button>
      </div>
    </div>
  );
}
