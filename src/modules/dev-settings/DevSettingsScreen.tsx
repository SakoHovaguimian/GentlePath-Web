'use client';

import { useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  Button,
  Field,
  FormActions,
  InlineLoading,
  Message,
  Page,
  PageHeader,
  QueryBoundary,
  SectionStack,
  Select,
  SplitSection,
  Switch,
} from '@/components/ui';
import type { DemoSettings } from '@/models/demoSettings';
import { DemoContextSchema } from '@/models/demoContext';
import { UserRoleSchema } from '@/models/userRole';
import { gentlePathDemoStrings as copy } from '@/strings';
import { usePresentationService } from '@/presentation/PresentationProvider';
import { useUnsavedFormGuard } from '@/providers/useUnsavedFormGuard';
import { useDevSettings, useDevSettingsCommand } from './hooks';
import type { DevSettingsCommand } from './models/devSettingsCommand';

export function DevSettingsScreen() {
  const query = useDevSettings();
  return (
    <Page>
      <PageHeader title={copy.title} description={copy.description} />
      <QueryBoundary query={query} loadingFallback={<InlineLoading />}>
        {(settings) => (
          <DevSettingsForm
            key={`${settings.demoMode}-${settings.scenario}-${settings.latencyMs}-${settings.role}`}
            settings={settings}
          />
        )}
      </QueryBoundary>
    </Page>
  );
}

function DevSettingsForm({ settings }: { settings: DemoSettings }) {
  const [demoMode, setDemoMode] = useState(settings.demoMode);
  const [scenario, setScenario] = useState(settings.scenario);
  const [latencyMs, setLatencyMs] = useState(settings.latencyMs);
  const [role, setRole] = useState(settings.role);
  const mutation = useDevSettingsCommand();
  const presentation = usePresentationService();
  const queryClient = useQueryClient();
  const dirty =
    demoMode !== settings.demoMode ||
    scenario !== settings.scenario ||
    latencyMs !== settings.latencyMs;
  const dirtyRef = useRef(false);
  const busyRef = useRef(false);
  useEffect(() => {
    dirtyRef.current = dirty;
    busyRef.current = mutation.isPending;
  }, [dirty, mutation.isPending]);
  useUnsavedFormGuard(dirtyRef, busyRef);

  async function run(command: DevSettingsCommand) {
    if (mutation.isPending) return;
    if (command.kind === 'role' || command.kind === 'reset') {
      const confirmed = await presentation.showAlert({
        title:
          command.kind === 'role'
            ? copy.roleConfirmationTitle
            : copy.resetConfirmationTitle,
        description:
          command.kind === 'role'
            ? copy.roleConfirmationDescription
            : copy.resetConfirmationDescription,
        confirmLabel:
          command.kind === 'role' ? copy.switchAction : copy.resetAction,
        cancelLabel: copy.cancelAction,
        tone: command.kind === 'reset' ? 'danger' : 'warning',
      });
      if (!confirmed) return;
    }
    try {
      const result = await mutation.mutateAsync(command);
      dirtyRef.current = false;
      busyRef.current = false;
      if (result.reload) {
        queryClient.clear();
        window.location.assign(
          command.kind === 'update' ? '/login' : '/dev-settings',
        );
        return;
      }
      await queryClient.invalidateQueries();
      void presentation.showToast({
        title: copy.savedTitle,
        description: copy.savedDescription,
        intent: 'success',
      });
    } catch {
      // The shared inline message retains the selected values for retry.
    }
  }

  return (
    <div className="grid gap-6">
      <Message
        title={settings.demoMode ? copy.demoModeStatus : copy.liveModeStatus}
        description={copy.demoModeDescription}
        intent={settings.demoMode ? 'info' : 'warning'}
      />
      <form
        noValidate
        className="grid gap-8"
        onSubmit={(event) => {
          event.preventDefault();
          void run({
            kind: 'update',
            input: { demoMode, scenario, latencyMs },
          });
        }}
      >
        <SectionStack>
          <SplitSection
            id="demo-runtime"
            title={copy.runtimeTitle}
            description={copy.runtimeDescription}
          >
            <Switch
              label={copy.demoModeLabel}
              description={copy.demoModeDescription}
              checked={demoMode}
              disabled={mutation.isPending}
              onChange={(event) => setDemoMode(event.target.checked)}
            />
          </SplitSection>
          <SplitSection
            id="demo-simulation"
            title={copy.scenarioTitle}
            description={copy.scenarioDescription}
          >
            <Field labelText={copy.scenarioLabel}>
              <Select
                value={scenario}
                disabled={!demoMode || mutation.isPending}
                onValueChange={(value) =>
                  setScenario(DemoContextSchema.shape.scenario.parse(value))
                }
              >
                {Object.entries(copy.scenarios).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </Select>
            </Field>
            <Field labelText={copy.latencyLabel}>
              <Select
                value={String(latencyMs)}
                disabled={!demoMode || mutation.isPending}
                onValueChange={(value) => setLatencyMs(Number(value))}
              >
                <option value={0}>{copy.latencyOptions.instant}</option>
                <option value={350}>{copy.latencyOptions.normal}</option>
                <option value={1000}>{copy.latencyOptions.slow}</option>
                <option value={3000}>{copy.latencyOptions.slower}</option>
                <option value={5000}>{copy.latencyOptions.maximum}</option>
              </Select>
            </Field>
          </SplitSection>
        </SectionStack>
        <FormActions sticky={false}>
          <Button
            type="submit"
            disabled={!dirty || mutation.isPending}
            loading={
              mutation.isPending && mutation.variables?.kind === 'update'
            }
          >
            {copy.applyAction}
          </Button>
        </FormActions>
      </form>
      {mutation.isError && (
        <Message
          title={copy.errorTitle}
          description={mutation.error.message || copy.errorDescription}
          intent="danger"
        />
      )}
      <SectionStack>
        <SplitSection
          id="demo-role"
          title={copy.roleTitle}
          description={
            settings.demoMode
              ? copy.roleDescription
              : copy.roleUnavailableDescription
          }
        >
          <Field labelText={copy.roleLabel}>
            <Select
              value={role}
              disabled={!settings.demoMode || mutation.isPending}
              onValueChange={(value) => setRole(UserRoleSchema.parse(value))}
            >
              {Object.entries(copy.roles).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </Field>
          <p className="m-0 break-all text-sm text-secondary">
            {copy.accounts[role].email}
          </p>
          <div>
            <Button
              variant="secondary"
              disabled={
                !settings.demoMode ||
                role === settings.role ||
                mutation.isPending
              }
              loading={
                mutation.isPending && mutation.variables?.kind === 'role'
              }
              onClick={() => void run({ kind: 'role', role })}
            >
              {copy.switchAction}
            </Button>
          </div>
        </SplitSection>
        <SplitSection
          id="demo-reset"
          title={copy.resetTitle}
          description={copy.resetDescription}
        >
          <div>
            <Button
              variant="destructive"
              disabled={!settings.demoMode || mutation.isPending}
              loading={
                mutation.isPending && mutation.variables?.kind === 'reset'
              }
              onClick={() => void run({ kind: 'reset' })}
            >
              {copy.resetAction}
            </Button>
          </div>
        </SplitSection>
      </SectionStack>
    </div>
  );
}
