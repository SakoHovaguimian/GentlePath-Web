'use client';

import { useState } from 'react';
import {
  Badge,
  Button,
  DataPanel,
  DataTable,
  DirectoryPagination,
  Field,
  IconTile,
  Input,
  ListGroup,
  ListRow,
  PageHeader,
  SplitSection,
  Stepper,
  UiIcon,
} from '@/components/ui';
import { strings } from '@/strings';
import { ShowcaseSection } from './ShowcaseSection';

const copy = strings.componentLibrary;
const stepKeys = ['details', 'settings', 'review'] as const;
type StepKey = (typeof stepKeys)[number];
const rows = [
  { id: 'flower', name: copy.categoryLabels.flower, live: true },
  { id: 'edibles', name: copy.categoryLabels.edibles, live: true },
  { id: 'topicals', name: copy.categoryLabels.topicals, live: false },
];

// A labeled frame so each pattern reads as a specimen, not live page chrome.
function Specimen({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-w-0 gap-3">
      <div className="grid gap-0.5">
        <h3 className="m-0 text-sm font-semibold text-primary">{title}</h3>
        <p className="m-0 text-sm text-secondary">{description}</p>
      </div>
      <div className="min-w-0 rounded-xl border border-dashed border-secondary bg-secondary_subtle p-4 sm:p-6">
        {children}
      </div>
    </div>
  );
}

export function PatternsShowcase() {
  const [step, setStep] = useState<StepKey>('settings');
  const current = stepKeys.indexOf(step);
  return (
    <ShowcaseSection
      id="patterns"
      title={copy.patterns}
      description={copy.patternsHint}
      icon="layers"
    >
      <Specimen
        title={copy.patternLabels.header}
        description={copy.patternHints.header}
      >
        <PageHeader
          headingLevel="h3"
          title={copy.sampleCatalog}
          description={copy.productInformationHint}
          breadcrumbs={[
            { label: strings.pageLayout.catalogTemplates, href: '#patterns' },
            { label: copy.sampleCatalog },
          ]}
          onNavigate={() => undefined}
          meta={
            <>
              <Badge intent="success" dot>
                {copy.active}
              </Badge>
              <span>{strings.pageLayout.version(2)}</span>
            </>
          }
          action={
            <>
              <Button variant="secondary">
                <UiIcon name="settings" className="size-4" />
                {copy.settings}
              </Button>
              <Button>
                <UiIcon name="plus" className="size-4" />
                {copy.create}
              </Button>
            </>
          }
        />
      </Specimen>
      <Specimen
        title={copy.patternLabels.split}
        description={copy.patternHints.split}
      >
        <SplitSection
          id="pattern-split"
          title={copy.basicDetails}
          description={copy.basicDetailsHint}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Field labelText={copy.productName}>
              <Input defaultValue={copy.sampleProduct} />
            </Field>
            <Field labelText={copy.sku}>
              <Input defaultValue={copy.sampleSku} />
            </Field>
          </div>
        </SplitSection>
      </Specimen>
      <Specimen
        title={copy.patternLabels.panel}
        description={copy.patternHints.panel}
      >
        <DataPanel
          toolbar={
            <div className="max-w-md">
              <label htmlFor="pattern-search" className="sr-only">
                {copy.search}
              </label>
              <Input
                id="pattern-search"
                type="search"
                placeholder={copy.searchPlaceholder}
                leadingIcon={<UiIcon name="search" />}
              />
            </div>
          }
          footer={
            <DirectoryPagination
              page={{ limit: 25, offset: 0, hasMore: false, nextOffset: null }}
              count={rows.length}
              busy={false}
              label={copy.sampleProducts}
              range={strings.designSystem.recordRange}
              onNavigate={() => undefined}
            />
          }
        >
          <DataTable
            embedded
            caption={copy.sampleProducts}
            rows={rows}
            getRowKey={(row) => row.id}
            columns={[
              {
                key: 'name',
                header: copy.productName,
                cellClassName: 'w-full font-semibold text-primary',
                render: (row) => row.name,
              },
              {
                key: 'status',
                header: strings.directory.status,
                cellClassName: 'whitespace-nowrap',
                render: (row) => (
                  <Badge dot intent={row.live ? 'success' : 'neutral'}>
                    {row.live ? copy.active : copy.inactive}
                  </Badge>
                ),
              },
            ]}
          />
        </DataPanel>
      </Specimen>
      <div className="grid min-w-0 gap-6">
        <Specimen
          title={copy.patternLabels.list}
          description={copy.patternHints.list}
        >
          <ListGroup>
            {[
              { label: copy.successTitle, hint: copy.successHint, ok: true },
              { label: copy.warningTitle, hint: copy.warningHint, ok: false },
            ].map((item) => (
              <li key={item.label}>
                <ListRow
                  leading={
                    <IconTile
                      size="sm"
                      intent={item.ok ? 'success' : 'warning'}
                    >
                      <UiIcon
                        name={item.ok ? 'check' : 'warning'}
                        className="size-4"
                      />
                    </IconTile>
                  }
                  title={item.label}
                  description={item.hint}
                  trailing={
                    <Badge dot intent={item.ok ? 'success' : 'warning'}>
                      {item.ok ? copy.active : copy.draft}
                    </Badge>
                  }
                />
              </li>
            ))}
          </ListGroup>
        </Specimen>
        <Specimen
          title={copy.patternLabels.stepper}
          description={copy.patternHints.stepper}
        >
          <div className="grid min-w-0 gap-8">
            <div className="grid min-w-0 gap-3">
              <h4 className="m-0 text-sm font-medium text-secondary">
                {strings.ui.stepper.horizontal}
              </h4>
              <Stepper
                label={copy.patternLabels.stepper}
                onSelect={setStep}
                steps={stepKeys.map((key, index) => ({
                  key,
                  label: copy.sampleSteps[index],
                  description: copy.sampleStepHints[index],
                  state:
                    index < current
                      ? 'complete'
                      : index === current
                        ? 'current'
                        : 'upcoming',
                  stateLabel:
                    index < current
                      ? strings.address.ready
                      : index === current
                        ? strings.address.current
                        : strings.address.notSaved,
                }))}
              />
            </div>
            <div className="grid min-w-0 gap-3">
              <h4 className="m-0 text-sm font-medium text-secondary">
                {strings.ui.stepper.vertical}
              </h4>
              <Stepper
                orientation="vertical"
                label={copy.patternLabels.stepper}
                onSelect={setStep}
                steps={stepKeys.map((key, index) => ({
                  key,
                  label: copy.sampleSteps[index],
                  description: copy.sampleStepHints[index],
                  state:
                    index < current
                      ? 'complete'
                      : index === current
                        ? 'current'
                        : 'upcoming',
                  stateLabel:
                    index < current
                      ? strings.address.ready
                      : index === current
                        ? strings.address.current
                        : strings.address.notSaved,
                }))}
              />
            </div>
          </div>
        </Specimen>
      </div>
    </ShowcaseSection>
  );
}
