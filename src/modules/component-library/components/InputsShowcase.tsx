'use client';

import { useState } from 'react';
import { Field, Input, Select, TextArea, UiIcon } from '@/components/ui';
import { strings } from '@/strings';
import { ShowcaseSection } from './ShowcaseSection';

const copy = strings.componentLibrary;
export function InputsShowcase() {
  const [description, setDescription] = useState<string>(
    copy.sampleDescription,
  );
  const [invalid, setInvalid] = useState('');
  const states = [
    'default',
    'filled',
    'focused',
    'error',
    'disabled',
    'readOnly',
  ] as const;
  return (
    <ShowcaseSection
      id="inputs"
      title={copy.inputs}
      description={copy.inputsHint}
      icon="file"
    >
      <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">
        {states.map((state) => (
          <div key={state}>
            <Field labelText={copy.inputStates[state]}>
              <Input
                id={`example-input-${state}`}
                leadingIcon={<UiIcon name="user" />}
                placeholder={
                  state === 'error' ? copy.invalidInput : copy.enterName
                }
                defaultValue={
                  state === 'filled' || state === 'focused'
                    ? copy.sampleName
                    : undefined
                }
                disabled={state === 'disabled'}
                readOnly={state === 'readOnly'}
                aria-invalid={state === 'error' && !invalid}
                aria-describedby={
                  state === 'error' && !invalid
                    ? 'example-input-error-help'
                    : undefined
                }
                data-preview-state={state}
                onChange={
                  state === 'error'
                    ? (event) => setInvalid(event.target.value)
                    : undefined
                }
              />
            </Field>
            {state === 'error' && !invalid && (
              <p
                id="example-input-error-help"
                className="m-0 mt-1 text-xs text-error-primary"
              >
                {copy.errorHint}
              </p>
            )}
          </div>
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">
        <Field labelText={copy.productName}>
          <Input
            defaultValue={copy.sampleProduct}
            leadingIcon={<UiIcon name="user" />}
          />
        </Field>
        <Field labelText={copy.sku}>
          <Input
            defaultValue={copy.sampleSku}
            leadingIcon={<UiIcon name="code" />}
          />
        </Field>
        <Field labelText={copy.brand}>
          <Input
            defaultValue={copy.sampleBrand}
            leadingIcon={<UiIcon name="bag" />}
          />
        </Field>
        <Field labelText={copy.search}>
          <Input
            type="search"
            placeholder={copy.searchPlaceholder}
            leadingIcon={<UiIcon name="search" />}
          />
        </Field>
        <Field labelText={copy.select}>
          <Select leadingIcon={<UiIcon name="tag" />} defaultValue="indica">
            {(['indica', 'sativa', 'hybrid', 'cbd'] as const).map((value) => (
              <option key={value} value={value}>
                {copy[value]}
              </option>
            ))}
          </Select>
        </Field>
        <Field labelText={copy.payment}>
          <Input
            inputMode="numeric"
            defaultValue={copy.samplePayment}
            leadingIcon={<UiIcon name="card" />}
          />
        </Field>
      </div>
      <div className="grid gap-1">
        <Field labelText={copy.descriptionLabel}>
          <TextArea
            value={description}
            maxLength={500}
            leadingIcon={<UiIcon name="file" />}
            aria-describedby="example-description-count"
            onChange={(event) => setDescription(event.target.value)}
          />
        </Field>
        <p
          id="example-description-count"
          className="m-0 text-right text-xs text-tertiary tabular-nums"
        >
          {copy.characterCount(description.length, 500)}
        </p>
      </div>
    </ShowcaseSection>
  );
}
