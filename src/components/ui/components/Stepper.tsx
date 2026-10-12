'use client';

import { useId, type CSSProperties } from 'react';
import { strings } from '@/strings';
import type { StepperOrientation } from '../models/stepperOrientation';
import type { StepperStep } from '../models/stepperStep';
import { Button } from './Button';
import { UiIcon } from './UiIcon';
import { cn } from '../lib/cn';

// Segmented progress for multi-stage flows. Each segment is a button so
// reachable stages can be revisited; unreachable stages stay disabled.
export function Stepper<Key extends string>({
  steps,
  label,
  disabled = false,
  onSelect,
  orientation = 'horizontal',
}: {
  steps: StepperStep<Key>[];
  label: string;
  orientation?: StepperOrientation;
  disabled?: boolean;
  onSelect: (key: Key) => void;
}) {
  const id = useId();
  if (!steps.length) return null;
  return (
    <nav
      aria-label={label}
      className="ui-stepper"
      data-orientation={orientation}
    >
      <ol
        className="ui-stepper-list"
        style={
          {
            '--ui-step-count': steps.length,
          } as CSSProperties
        }
      >
        {steps.map((step, index) => {
          const filled = step.state !== 'upcoming';
          return (
            <li
              key={step.key}
              className="ui-stepper-item"
              data-state={step.state}
            >
              {index < steps.length - 1 && (
                <span aria-hidden="true" className="ui-stepper-connector">
                  <span className="ui-stepper-connector-fill" />
                </span>
              )}
              <Button
                variant="ghost"
                disabled={disabled || step.disabled}
                aria-current={step.state === 'current' ? 'step' : undefined}
                aria-label={strings.ui.stepper.accessibleLabel(
                  step.label,
                  step.stateLabel,
                  index + 1,
                  steps.length,
                )}
                aria-describedby={
                  step.description ? `${id}-${index}-description` : undefined
                }
                onClick={() => onSelect(step.key)}
                className="ui-step h-full min-h-11 w-full min-w-0 gap-3 rounded-lg text-left hover:bg-transparent disabled:cursor-not-allowed disabled:bg-transparent"
              >
                <span
                  aria-hidden="true"
                  data-filled={filled}
                  className="ui-step-bar block h-1.5 w-full overflow-hidden rounded-full bg-quaternary"
                >
                  <span className="ui-step-bar-fill block h-full w-full rounded-full bg-brand-solid" />
                </span>
                <span className="ui-step-identity grid min-w-0 gap-1">
                  <span className="ui-step-heading flex min-w-0 items-center gap-2.5">
                    <span
                      aria-hidden="true"
                      data-complete={step.state === 'complete'}
                      className={cn(
                        'ui-step-marker grid shrink-0 place-items-center rounded-full border text-xs font-semibold',
                        step.state === 'current'
                          ? 'border-brand bg-brand-solid text-[var(--color-text-primary_on-brand)]'
                          : step.state === 'complete'
                            ? 'border-brand bg-brand-primary text-brand-secondary'
                            : 'border-secondary bg-primary text-tertiary',
                      )}
                    >
                      <span className="ui-step-number col-start-1 row-start-1">
                        {index + 1}
                      </span>
                      <span className="ui-step-check col-start-1 row-start-1 flex items-center justify-center">
                        <UiIcon name="check" className="size-4" />
                      </span>
                    </span>
                    <span
                      className={cn(
                        'min-w-0 text-sm font-semibold wrap-anywhere',
                        filled ? 'text-primary' : 'text-tertiary',
                      )}
                    >
                      {step.label}
                    </span>
                  </span>
                  {step.description && (
                    <span
                      id={`${id}-${index}-description`}
                      className="ui-step-description text-xs font-normal text-tertiary wrap-anywhere"
                    >
                      {step.description}
                    </span>
                  )}
                </span>
                <span className="sr-only">{step.stateLabel}</span>
              </Button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
