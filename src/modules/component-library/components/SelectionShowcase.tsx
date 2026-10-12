'use client';

import { useState } from 'react';
import { Checkbox, Radio, SegmentedTabs, Switch } from '@/components/ui';
import { strings } from '@/strings';
import { ShowcaseSection } from './ShowcaseSection';
const copy = strings.componentLibrary;
const radioValues = { selected: 'selected', unselected: 'unselected' };

export function SelectionShowcase() {
  const [on, setOn] = useState(true);
  const [off, setOff] = useState(false);
  const [checked, setChecked] = useState(true);
  const [unchecked, setUnchecked] = useState(false);
  const [radio, setRadio] = useState('selected');
  const [status, setStatus] = useState('all');
  return (
    <ShowcaseSection
      id="selection"
      title={copy.selection}
      description={copy.selectionHint}
      icon="settings"
    >
      <div className="grid gap-5 sm:grid-cols-3">
        <fieldset className="min-w-0">
          <legend className="mb-2 text-xs font-semibold text-primary">
            {copy.switches}
          </legend>
          <Switch
            label={copy.on}
            checked={on}
            onChange={(event) => setOn(event.target.checked)}
          />
          <Switch
            label={copy.off}
            checked={off}
            onChange={(event) => setOff(event.target.checked)}
          />
          <Switch label={copy.disabled} disabled />
        </fieldset>
        <fieldset className="min-w-0">
          <legend className="mb-2 text-xs font-semibold text-primary">
            {copy.checkboxes}
          </legend>
          <Checkbox
            label={copy.checked}
            checked={checked}
            onChange={(event) => setChecked(event.target.checked)}
          />
          <Checkbox
            label={copy.unchecked}
            checked={unchecked}
            onChange={(event) => setUnchecked(event.target.checked)}
          />
          <Checkbox label={copy.disabled} defaultChecked disabled />
        </fieldset>
        <fieldset className="min-w-0">
          <legend className="mb-2 text-xs font-semibold text-primary">
            {copy.radios}
          </legend>
          <Radio
            name="library-radio"
            label={copy.selected}
            value={radioValues.selected}
            checked={radio === 'selected'}
            onChange={() => setRadio('selected')}
          />
          <Radio
            name="library-radio"
            label={copy.unselected}
            value={radioValues.unselected}
            checked={radio === 'unselected'}
            onChange={() => setRadio('unselected')}
          />
          <Radio name="library-radio-disabled" label={copy.disabled} disabled />
        </fieldset>
      </div>
      <div className="grid gap-3">
        <h4 className="m-0 text-sm font-medium text-primary">
          {copy.segmented}
        </h4>
        <SegmentedTabs
          label={copy.segmentedLabel}
          value={status}
          onValueChange={setStatus}
          tabs={(['all', 'active', 'inactive', 'draft'] as const).map(
            (value) => ({ value, label: copy[value] }),
          )}
        />
      </div>
    </ShowcaseSection>
  );
}
