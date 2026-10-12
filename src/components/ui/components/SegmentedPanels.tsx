'use client';

import { useId } from 'react';
import type { SegmentedPanel } from '../models/segmentedPanel';
import { ResponsiveSectionNavigation } from './ResponsiveSectionNavigation';

interface SegmentedPanelsProps<T extends string> {
  panels: Array<SegmentedPanel<T>>;
  value: T;
  onValueChange: (value: T) => void;
  label: string;
  disabled?: boolean;
}

export function SegmentedPanels<T extends string>({
  panels,
  value,
  onValueChange,
  label,
  disabled = false,
}: SegmentedPanelsProps<T>) {
  const id = useId();
  return (
    <div className="grid min-w-0 gap-8">
      <ResponsiveSectionNavigation
        tabs={panels.map(({ value, label, meta }) => ({
          value,
          label,
          meta,
          panelId: `${id}-${value}`,
        }))}
        value={value}
        onValueChange={onValueChange}
        label={label}
        disabled={disabled}
      />
      {panels.map((panel) => (
        <div
          key={panel.value}
          id={`${id}-${panel.value}`}
          role="group"
          aria-label={panel.label}
          hidden={value !== panel.value}
          inert={value !== panel.value}
          className="min-w-0"
        >
          {panel.content}
        </div>
      ))}
    </div>
  );
}
