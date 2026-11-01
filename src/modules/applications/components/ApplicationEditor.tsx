import { useRef, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import type { Route } from 'next';
import { useQuery } from '@tanstack/react-query';
import {
  Button,
  Field,
  Input,
  TextArea,
  Select,
  Card,
  DatePicker,
  NavigationLink,
} from '@/components/ui';
import { useServiceContainer } from '@/providers/AppProviders';
import { useUnsavedFormGuard } from '@/providers/useUnsavedFormGuard';
import { usePresentationService } from '@/presentation/PresentationProvider';
import { useChildren } from '@/modules/portal/hooks';
import { MutationError } from '@/modules/portal/components/MutationError';
import { DomainError } from '@/errors/domainErrors';
import { gentlePathApplicationStrings as copy } from '@/strings';
import {
  ServiceApplicationCreateSchema,
  type ServiceApplication,
  type ServiceApplicationCreate,
} from '../models/serviceApplication';
import { ServiceApplicationStatusSchema } from '../models/serviceApplicationStatus';
import { useApplicationMutations } from '../hooks';
import { ApplicationDateSchema } from '../models/applicationDate';
import '../styles/applications.css';

const emptyAssociation = '';

export function ApplicationEditor({
  application,
  programKey,
  onReload,
}: {
  application?: ServiceApplication;
  programKey?: string;
  onReload?: () => Promise<void>;
}) {
  const router = useRouter();
  const children = useChildren();
  const { stateBenefitsService } = useServiceContainer();
  const program = useQuery({
    queryKey: ['state-benefits', 'program', programKey],
    queryFn: ({ signal }) => stateBenefitsService.program(programKey!, signal),
    enabled: Boolean(programKey),
  });
  const [input, setInput] = useState<ServiceApplicationCreate>(() => ({
    child_id: application?.child_id ?? null,
    title: application?.title ?? '',
    provider: application?.provider ?? '',
    status: application?.status ?? 'DRAFT',
    benefit_program_key: application?.benefit_program_key ?? programKey ?? null,
    benefit_program_name: application?.benefit_program_name ?? null,
    benefit_program_url: application?.benefit_program_url ?? null,
    notes: application?.notes ?? '',
    applied_on: application?.applied_on ?? null,
    reference: application?.reference ?? '',
  }));
  const initial = useRef(input);
  const [followUpDueOn, setFollowUpDueOn] = useState('');
  const [createdApplication, setCreatedApplication] =
    useState<ServiceApplication>();
  const version = useRef(application?.updated_at);
  const dirty = useRef(false);
  const busy = useRef(false);
  const confirmLeave = useUnsavedFormGuard(dirty, busy);
  const [validation, setValidation] = useState<Record<string, string>>({});
  const mutations = useApplicationMutations();
  const mutation = application ? mutations.update : mutations.create;
  const { showToast, showAlert } = usePresentationService();
  const [deleteError, setDeleteError] = useState<unknown>();
  function change<Key extends keyof ServiceApplicationCreate>(
    key: Key,
    value: ServiceApplicationCreate[Key],
  ) {
    const next = { ...input, [key]: value };
    dirty.current =
      Boolean(followUpDueOn) ||
      JSON.stringify(next) !== JSON.stringify(initial.current);
    setInput(next);
    setValidation((current) => ({ ...current, [key]: '' }));
    mutation.reset();
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy.current) return;
    const parsed = ServiceApplicationCreateSchema.safeParse(input);
    const dueDate =
      !application && followUpDueOn
        ? ApplicationDateSchema.safeParse(followUpDueOn)
        : undefined;
    if (!parsed.success || (dueDate && !dueDate.success)) {
      const issues: Record<string, string> = {};
      if (!parsed.success) {
        for (const issue of parsed.error.issues)
          issues[String(issue.path[0])] = issue.message;
      }
      if (dueDate && !dueDate.success) issues.due_on = copy.validation.date;
      setValidation(issues);
      const firstField = Object.keys(issues)[0];
      event.currentTarget
        .querySelector<HTMLElement>(
          firstField === 'applied_on' || firstField === 'due_on'
            ? `[data-field-name="${firstField}"] [role="spinbutton"]`
            : `[name="${firstField}"]`,
        )
        ?.focus();
      return;
    }
    busy.current = true;
    try {
      const result = application
        ? await mutations.update.mutateAsync({
            id: application.id,
            input: { ...parsed.data, expected_updated_at: version.current! },
          })
        : (createdApplication ??
          (await mutations.create.mutateAsync(parsed.data)));
      if (!application && !createdApplication) setCreatedApplication(result);
      if (!application && dueDate?.success) {
        await mutations.createFollowUp.mutateAsync({
          id: result.id,
          input: { due_on: dueDate.data, notes: '' },
        });
      }
      dirty.current = false;
      void showToast({ title: copy.savedTitle, intent: 'success' });
      router.push(`/applications/${result.id}` as Route);
    } catch {
      // Preserve the private draft in memory for correction or retry.
    } finally {
      busy.current = false;
    }
  }
  async function remove() {
    if (!application || busy.current) return;
    busy.current = true;
    try {
      if (
        !(await showAlert({
          title: copy.deleteTitle,
          description: copy.deleteDescription(application.title),
          tone: 'danger',
          confirmLabel: copy.deleteAction,
          cancelLabel: copy.cancelAction,
        }))
      )
        return;
      await mutations.remove.mutateAsync(application.id);
      dirty.current = false;
      void showToast({ title: copy.deletedTitle, intent: 'success' });
      router.push('/applications');
    } catch (error) {
      setDeleteError(error);
    } finally {
      busy.current = false;
    }
  }
  const pending =
    mutation.isPending ||
    mutations.remove.isPending ||
    mutations.createFollowUp.isPending;
  const detailsDisabled = pending || Boolean(createdApplication);
  return (
    <Card>
      <form noValidate onSubmit={submit} className="grid gap-5">
        <p className="m-0 text-sm text-secondary">{copy.formDescription}</p>
        <Field labelText={copy.titleLabel}>
          <Input
            name="title"
            value={input.title}
            maxLength={300}
            disabled={detailsDisabled}
            onChange={(event) => change('title', event.target.value)}
            aria-invalid={Boolean(validation.title)}
            aria-describedby={
              validation.title ? 'application-validation' : undefined
            }
          />
        </Field>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field labelText={copy.providerLabel}>
            <Input
              name="provider"
              value={input.provider}
              maxLength={300}
              disabled={detailsDisabled}
              onChange={(event) => change('provider', event.target.value)}
            />
          </Field>
          <Field labelText={copy.statusLabel}>
            <Select
              name="status"
              value={input.status}
              disabled={detailsDisabled}
              onValueChange={(value) =>
                change('status', ServiceApplicationStatusSchema.parse(value))
              }
            >
              {ServiceApplicationStatusSchema.options.map((status) => (
                <option key={status} value={status}>
                  {copy.statuses[status]}
                </option>
              ))}
            </Select>
          </Field>
          <Field labelText={copy.childLabel}>
            <Select
              name="child_id"
              value={input.child_id ?? ''}
              disabled={detailsDisabled || children.isPending}
              onValueChange={(value) => change('child_id', value || null)}
            >
              <option value={emptyAssociation}>{copy.personalOption}</option>
              {(children.data ?? []).map((child) => (
                <option key={child.id} value={child.id}>
                  {child.name}
                </option>
              ))}
            </Select>
          </Field>
          <DatePicker
            label={copy.appliedLabel}
            name="applied_on"
            value={input.applied_on ?? ''}
            disabled={detailsDisabled}
            onValueChange={(value) => change('applied_on', value || null)}
            invalid={Boolean(validation.applied_on)}
            describedBy={
              validation.applied_on ? 'application-validation' : undefined
            }
          />
        </div>
        {(input.benefit_program_key || programKey) && (
          <Field labelText={copy.programLabel}>
            <Select
              value={input.benefit_program_key ?? ''}
              disabled={detailsDisabled}
              onValueChange={(value) =>
                change('benefit_program_key', value || null)
              }
            >
              <option value={emptyAssociation}>{copy.noProgram}</option>
              <option value={application?.benefit_program_key ?? programKey!}>
                {application?.benefit_program_name ??
                  program.data?.name ??
                  copy.programLabel}
              </option>
            </Select>
          </Field>
        )}
        <Field labelText={copy.referenceLabel}>
          <Input
            name="reference"
            value={input.reference}
            maxLength={300}
            disabled={detailsDisabled}
            onChange={(event) => change('reference', event.target.value)}
          />
        </Field>
        <Field labelText={copy.notesLabel}>
          <TextArea
            name="notes"
            value={input.notes}
            maxLength={20000}
            disabled={detailsDisabled}
            onChange={(event) => change('notes', event.target.value)}
          />
        </Field>
        {!application && (
          <div className="gp-application-follow-up-field">
            <DatePicker
              label={copy.optionalFollowUpLabel}
              name="due_on"
              value={followUpDueOn}
              disabled={pending}
              onValueChange={(value) => {
                setFollowUpDueOn(value);
                dirty.current =
                  Boolean(createdApplication || value) ||
                  JSON.stringify(input) !== JSON.stringify(initial.current);
                setValidation((current) => ({ ...current, due_on: '' }));
                mutations.createFollowUp.reset();
              }}
              invalid={Boolean(validation.due_on)}
              describedBy={
                validation.due_on
                  ? 'application-validation'
                  : 'application-follow-up-hint'
              }
            />
            <p id="application-follow-up-hint">{copy.optionalFollowUpHint}</p>
          </div>
        )}
        {Object.values(validation).some(Boolean) && (
          <p
            id="application-validation"
            role="alert"
            className="text-sm text-error-primary"
          >
            {Object.values(validation).filter(Boolean).join(' ')}
          </p>
        )}
        <MutationError error={mutation.error} />
        {createdApplication &&
          followUpDueOn &&
          !pending &&
          !mutations.createFollowUp.isSuccess && (
            <p role="status" className="m-0 text-sm text-secondary">
              {copy.followUpPartialDescription}
            </p>
          )}
        <MutationError error={mutations.createFollowUp.error} />
        <MutationError error={deleteError} />
        <MutationError error={children.error} />
        <MutationError
          error={
            input.benefit_program_key === programKey ? program.error : null
          }
        />
        {mutation.error instanceof DomainError &&
          mutation.error.status === 409 &&
          onReload && (
            <Button
              variant="secondary"
              onClick={async () => {
                if (await confirmLeave()) await onReload();
              }}
            >
              {copy.reloadAction}
            </Button>
          )}
        <div className="flex flex-wrap justify-end gap-3">
          {application && (
            <Button
              variant="destructive"
              className="me-auto"
              loading={mutations.remove.isPending}
              disabled={mutation.isPending}
              onClick={() => void remove()}
            >
              {copy.deleteAction}
            </Button>
          )}
          <Button asChild variant="secondary" disabled={pending}>
            <NavigationLink
              href={
                application || createdApplication
                  ? `/applications/${(application ?? createdApplication)!.id}`
                  : '/applications'
              }
              beforeNavigate={confirmLeave}
            >
              {copy.cancelAction}
            </NavigationLink>
          </Button>
          <Button
            type="submit"
            loading={mutation.isPending || mutations.createFollowUp.isPending}
            disabled={
              mutations.remove.isPending ||
              Boolean(
                input.benefit_program_key === programKey &&
                programKey &&
                (program.isPending || program.isError),
              )
            }
          >
            {createdApplication
              ? followUpDueOn
                ? copy.followUpRetry
                : copy.continueAction
              : copy.saveAction}
          </Button>
        </div>
      </form>
    </Card>
  );
}
