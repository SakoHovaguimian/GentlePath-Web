'use client';

import { strings } from '@/strings';
import { useCompactSectionNavigation } from '../lib/useCompactSectionNavigation';
import type { SegmentedTabsProps } from '../models/segmentedTabsProps';
import { SegmentedChoices } from './SegmentedChoices';
import { Select } from './Select';
import { UiIcon } from './UiIcon';
export type { SegmentedTab } from '../models/segmentedTab';

export function SegmentedTabs<T extends string>({
  tabs,
  value,
  onValueChange,
  label = strings.componentLibrary.segmentedLabel,
  disabled = false,
}: SegmentedTabsProps<T>) {
  const compact = useCompactSectionNavigation();
  const choices = (
    <SegmentedChoices
      tabs={tabs}
      value={value}
      onValueChange={onValueChange}
      label={label}
      disabled={disabled}
    />
  );

  if (tabs.length <= 2) return choices;

  return (
    <div className="ui-section-navigation">
      {compact && (
        <div className="ui-section-navigation-compact">
          <Select
            aria-label={label}
            aria-controls={tabs.find((tab) => tab.value === value)?.panelId}
            leadingIcon={<UiIcon name="menu" className="size-5" />}
            value={value}
            disabled={disabled}
            onValueChange={(next) => {
              const tab = tabs.find((tab) => tab.value === next);
              if (tab) onValueChange(tab.value);
            }}
          >
            {tabs.map((tab) => (
              <option key={tab.value} value={tab.value}>
                {tab.label}
              </option>
            ))}
          </Select>
        </div>
      )}
      <div className="ui-section-navigation-wide">{choices}</div>
    </div>
  );
}
