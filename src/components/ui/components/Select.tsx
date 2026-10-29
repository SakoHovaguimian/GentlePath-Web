'use client';

import {
  Button as AriaButton,
  ListBox,
  ListBoxItem,
  Popover,
  Select as AriaSelect,
  SelectValue,
} from 'react-aria-components';
import { cn } from '../lib/cn';
import { selectOptions } from '../lib/selectOptions';
import type { SelectProps } from '../models/selectProps';
import { UiIcon } from './UiIcon';

export function Select({
  children,
  className,
  leadingIcon,
  value,
  defaultValue,
  onValueChange,
  onOpenChange,
  required,
  autoComplete,
  name,
  disabled,
  id,
  'aria-label': ariaLabel,
  'aria-labelledby': labelledBy,
  'aria-describedby': describedBy,
  'aria-invalid': invalid,
  ...props
}: SelectProps) {
  const options = selectOptions(children);
  return (
    <AriaSelect
      id={id}
      className="ui-select min-w-0 w-full"
      name={name}
      autoComplete={autoComplete}
      selectedKey={value === undefined ? undefined : String(value)}
      defaultSelectedKey={String(defaultValue ?? options[0]?.value ?? '')}
      onSelectionChange={(key) => onValueChange?.(String(key ?? ''))}
      onOpenChange={onOpenChange}
      disabledKeys={options
        .filter((option) => option.disabled)
        .map((option) => option.value)}
      isDisabled={disabled}
      isRequired={required}
      isInvalid={invalid === true || invalid === 'true'}
      validationBehavior="aria"
      aria-label={ariaLabel}
      aria-labelledby={labelledBy}
      aria-describedby={describedBy}
    >
      <AriaButton
        {...props}
        id={id}
        aria-invalid={invalid}
        className={cn(
          'ui-select-trigger ui-input flex min-h-12 w-full min-w-0 cursor-pointer items-center gap-3 rounded-lg border border-control-border bg-primary px-4 py-2.5 text-left text-sm text-primary outline-none focus-visible:ring-4 focus-visible:ring-brand/12 aria-invalid:border-error aria-invalid:focus-visible:ring-error/12 disabled:cursor-not-allowed disabled:border-secondary disabled:bg-disabled_subtle disabled:text-disabled',
          className,
        )}
      >
        {leadingIcon && (
          <span aria-hidden="true" className="shrink-0 text-tertiary">
            {leadingIcon}
          </span>
        )}
        <SelectValue className="min-w-0 flex-1 wrap-anywhere">
          {({ selectedText, state }) => (
            <span
              key={String(state.selectedKey)}
              className="ui-select-value block"
            >
              {selectedText}
            </span>
          )}
        </SelectValue>
        <UiIcon
          name="chevronDown"
          className="ui-select-chevron size-4 text-tertiary"
        />
      </AriaButton>
      <Popover
        offset={6}
        className="ui-popover ui-select-popover z-100 flex w-max min-w-(--trigger-width) max-w-[calc(100vw-1.5rem)] flex-col overflow-hidden rounded-lg border border-brand bg-primary p-1 shadow-(--dashboard-shell-shadow-lg)"
      >
        <ListBox
          className="ui-select-list min-h-0 max-h-[min(22rem,60dvh)] shrink overflow-y-auto overscroll-contain outline-none"
          items={options}
        >
          {(option) => (
            <ListBoxItem
              id={option.value}
              textValue={option.label}
              className="ui-select-option flex min-h-11 cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm text-secondary outline-none data-focused:bg-secondary_subtle selected:bg-brand-primary selected:text-brand-secondary data-focus-visible:outline-2 data-focus-visible:-outline-offset-2 data-focus-visible:outline-brand data-disabled:cursor-not-allowed data-disabled:text-disabled"
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
      </Popover>
    </AriaSelect>
  );
}
