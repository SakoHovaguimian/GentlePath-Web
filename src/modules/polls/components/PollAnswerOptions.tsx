import type { CSSProperties } from 'react';
import { Checkbox, Radio } from '@/components/ui';
import { gentlePathPollStrings as copy } from '@/strings';
import type { Poll } from '../models/poll';

export function PollAnswerOptions({
  poll,
  selectedIds,
  recordedIds,
  name,
  disabled,
  invalid,
  describedBy,
  onSelect,
}: {
  poll: Poll;
  selectedIds: string[];
  recordedIds: string[];
  name: string;
  disabled: boolean;
  invalid: boolean;
  describedBy: string;
  onSelect: (optionId: string) => void;
}) {
  return (
    <fieldset
      disabled={disabled}
      aria-describedby={describedBy}
      className="gp-poll-answers"
    >
      <legend className="sr-only">{copy.optionsTitle}</legend>
      {poll.options.map((option) => {
        const percent = poll.participantsCount
          ? Math.round((option.selectionsCount / poll.participantsCount) * 100)
          : 0;
        const selected = selectedIds.includes(option.id);
        const recorded = recordedIds.includes(option.id);
        const content = (
          <>
            <span className="gp-poll-answer__label">
              <span>{option.text}</span>
              {recorded && (
                <span className="gp-poll-answer__choice">{copy.selected}</span>
              )}
            </span>
            <span className="gp-poll-answer__result">
              <span className="gp-poll-answer__percent">
                {copy.resultPercentage(percent)}
              </span>
              <span className="gp-poll-answer__count">
                {copy.optionVotes(option.selectionsCount)}
              </span>
            </span>
          </>
        );
        const props = {
          name,
          value: option.id,
          checked: selected,
          disabled,
          'aria-invalid': invalid,
          className: `gp-poll-answer${selected ? ' gp-poll-answer--selected' : ''}`,
          onChange: () => onSelect(option.id),
          label: (
            <span
              className="gp-poll-answer__content"
              style={
                {
                  '--poll-answer-percent': `${Math.min(percent, 100)}%`,
                } as CSSProperties
              }
            >
              <span aria-hidden="true" className="gp-poll-answer__fill" />
              {content}
              {selected && (
                <span aria-hidden="true" className="gp-poll-answer__contrast">
                  {content}
                </span>
              )}
            </span>
          ),
        };
        return poll.selectionMode === 'SINGLE' ? (
          <Radio key={option.id} {...props} />
        ) : (
          <Checkbox key={option.id} {...props} />
        );
      })}
    </fieldset>
  );
}
