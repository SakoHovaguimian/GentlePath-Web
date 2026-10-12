import { useId } from 'react';
import { strings } from '@/strings';
import { cn } from '../lib/cn';
import { useSegmentedIndicator } from '../lib/useSegmentedIndicator';
import type { SegmentedTabsProps } from '../models/segmentedTabsProps';

export function SegmentedChoices<T extends string>({
  tabs,
  value,
  onValueChange,
  label = strings.componentLibrary.segmentedLabel,
  disabled = false,
}: SegmentedTabsProps<T>) {
  const id = useId();
  const { groupRef, indicatorRef } = useSegmentedIndicator(value);
  return (
    <fieldset
      disabled={disabled}
      className="m-0 min-w-0 w-fit max-w-full border-0 p-0"
    >
      <legend className="sr-only">{label}</legend>
      <div ref={groupRef} className="ui-segmented">
        <span aria-hidden="true" className="ui-segmented-track" />
        <span
          ref={indicatorRef}
          aria-hidden="true"
          className="ui-segmented-indicator shadow-xs"
        />
        {tabs.map((tab) => {
          const active = tab.value === value;
          return (
            <label
              key={tab.value}
              className={cn(
                'ui-segment text-sm has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-50 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-brand',
                active
                  ? 'text-(--color-text-primary_on-brand)'
                  : disabled
                    ? 'text-secondary'
                    : 'text-secondary hover:text-primary',
              )}
            >
              <input
                type="radio"
                name={id}
                value={tab.value}
                checked={active}
                aria-controls={tab.panelId}
                onChange={() => onValueChange(tab.value)}
                className="ui-segment-input"
              />
              {active && (
                <span aria-hidden="true" className="ui-segment-fallback" />
              )}
              <span className="relative z-10 block font-semibold">
                {tab.label}
              </span>
              {tab.meta ? (
                <span
                  className={cn(
                    'relative z-10 mt-0.5 block text-xs',
                    active
                      ? 'text-(--color-text-primary_on-brand)'
                      : 'text-tertiary',
                  )}
                >
                  {tab.meta}
                </span>
              ) : null}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
