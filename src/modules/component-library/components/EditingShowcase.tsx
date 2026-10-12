'use client';

import { useState } from 'react';
import {
  AddressSelect,
  ColorInput,
  Field,
  MarkdownEditor,
  MoneyInput,
  TimezoneSelect,
} from '@/components/ui';
import { strings } from '@/strings';
import { ShowcaseSection } from './ShowcaseSection';
const copy = strings.designSystem;

export function EditingShowcase() {
  const [notes, setNotes] = useState<string>(copy.notesSample);
  const [amount, setAmount] = useState('29.00');
  const [country, setCountry] = useState('US');
  const [timezone, setTimezone] = useState('America/Los_Angeles');
  const [color, setColor] = useState('');
  return (
    <ShowcaseSection
      id="editing"
      title={copy.advanced}
      description={copy.advancedHint}
      icon="file"
    >
      <div className="grid min-w-0 gap-4 sm:grid-cols-2">
        <Field labelText={copy.amount}>
          <MoneyInput
            value={amount}
            onValueChange={setAmount}
            currencyCode="USD"
          />
        </Field>
        <Field labelText={copy.country}>
          <AddressSelect
            kind="country"
            value={country}
            onValueChange={setCountry}
          />
        </Field>
        <Field labelText={copy.timeZone}>
          <TimezoneSelect value={timezone} onValueChange={setTimezone} />
        </Field>
        <Field labelText={copy.color}>
          <ColorInput label={copy.color} value={color} onChange={setColor} />
        </Field>
      </div>
      <Field labelText={copy.notes}>
        <MarkdownEditor value={notes} onValueChange={setNotes} />
      </Field>
    </ShowcaseSection>
  );
}
