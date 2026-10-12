'use client';

import {
  Button as AriaButton,
  ListBox,
  ListBoxItem,
  Popover,
  Select as AriaSelect,
  SelectValue,
} from 'react-aria-components';
import type { AriaAttributes, Ref } from 'react';
import { cn } from '../lib/cn';
import { Button } from './Button';
import { UiIcon } from './UiIcon';

export function MultiSelect<Value extends string>({
  value,
  options,
  onValueChange,
  label,
  placeholder,
  selectionLabel,
  clearLabel,
  className,
  disabled,
  selectAllLabel,
  id,
  ref,
  'aria-labelledby': labelledBy,
  'aria-describedby': describedBy,
  'aria-invalid': invalid,
}: {
  value: readonly Value[];
  options: readonly { value: Value; label: string }[];
  onValueChange: (value: Value[]) => void;
  label: string;
  placeholder: string;
  selectionLabel: (count: number) => string;
  clearLabel: string;
  className?: string;
  disabled?: boolean;
  selectAllLabel?: string;
  id?: string;
  ref?: Ref<HTMLButtonElement>;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
  'aria-invalid'?: AriaAttributes['aria-invalid'];
}) {
  return (
    <AriaSelect
      selectionMode="multiple"
      value={value}
      onChange={(keys) =>
        onValueChange(
          options
            .filter((option) => keys.includes(option.value))
            .map((option) => option.value),
        )
      }
      aria-label={label}
      aria-labelledby={labelledBy}
      aria-describedby={describedBy}
      isInvalid={invalid === true || invalid === 'true'}
      validationBehavior="aria"
      isDisabled={disabled}
      className={cn('ui-select min-w-0 w-full', className)}
    >
      <AriaButton
        id={id}
        ref={ref}
        aria-labelledby={labelledBy}
        aria-describedby={describedBy}
        aria-invalid={invalid}
        className="ui-select-trigger ui-input flex min-h-12 w-full min-w-0 cursor-pointer items-center gap-3 rounded-lg border border-[var(--color-control-border)] bg-primary px-4 py-2.5 text-left text-sm text-primary outline-none focus-visible:ring-4 focus-visible:ring-brand/12 disabled:cursor-not-allowed disabled:bg-disabled_subtle disabled:text-disabled"
      >
        <SelectValue className="min-w-0 flex-1 wrap-anywhere">
          {() =>
            value.length === 0
              ? placeholder
              : value.length === 1
                ? options.find((option) => option.value === value[0])?.label
                : selectionLabel(value.length)
          }
        </SelectValue>
        <UiIcon
          name="chevronDown"
          className="ui-select-chevron size-4 text-tertiary"
        />
      </AriaButton>
      <Popover
        offset={6}
        className="ui-popover ui-select-popover z-[100] flex w-[var(--trigger-width)] max-w-[calc(100vw-1.5rem)] flex-col overflow-hidden rounded-lg border border-[var(--color-control-border)] bg-primary p-1 shadow-[var(--dashboard-shell-shadow-lg)]"
      >
        <ListBox
          items={options}
          className="ui-select-list min-h-0 max-h-[min(22rem,60dvh)] overflow-y-auto overscroll-contain outline-none"
        >
          {(option) => (
            <ListBoxItem
              id={option.value}
              textValue={option.label}
              className="ui-select-option flex min-h-11 cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm text-secondary outline-none data-[focused]:bg-secondary_subtle data-[selected]:bg-brand-primary data-[selected]:text-brand-secondary data-[focus-visible]:outline-2 data-[focus-visible]:-outline-offset-2 data-[focus-visible]:outline-brand"
            >
              {({ isSelected }) => (
                <>
                  <span className="min-w-0 flex-1 wrap-anywhere">
                    {option.label}
                  </span>
                  <UiIcon
                    name="check"
                    className={cn(
                      'ui-option-check size-4',
                      !isSelected && 'opacity-0',
                    )}
                  />
                </>
              )}
            </ListBoxItem>
          )}
        </ListBox>
        <div className="mt-1 grid gap-1 border-t border-secondary p-1">
          {selectAllLabel && (
            <Button
              variant="ghost"
              className="w-full"
              disabled={!options.length || value.length === options.length}
              onClick={() =>
                onValueChange(options.map((option) => option.value))
              }
            >
              {selectAllLabel}
            </Button>
          )}
          <Button
            variant="ghost"
            className="w-full"
            disabled={!value.length}
            onClick={() => onValueChange([])}
          >
            {clearLabel}
          </Button>
        </div>
      </Popover>
    </AriaSelect>
  );
}
