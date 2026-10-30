'use client';
import { useRef, useState } from 'react';
import {
  Badge,
  Button,
  Card,
  Field,
  FormSection,
  Input,
  Message,
  Select,
  TextArea,
} from '@/components/ui';
import { usePresentationService } from '@/presentation/PresentationProvider';
import { useUnsavedFormGuard } from '@/providers/useUnsavedFormGuard';
import { MutationError } from '@/modules/portal/components/MutationError';
import { gentlePathCommercialStrings as copy } from '@/strings';
import { useCommercialMutation } from '../hooks';
import { useCommercialDelete } from '../useCommercialDelete';
import type {
  CommercialEntity,
  CommercialRecord,
} from '../models/commercialEntity';
import { DiscountOfferVerificationSchema } from '../models/discountOfferVerification';
import { localDateTime, isoDateTime } from './commercialFormFields';
interface CommercialLifecycleProps {
  entity: CommercialEntity;
  record: CommercialRecord;
  onDeleted: () => void;
}
export function CommercialLifecycle({
  entity,
  record,
  onDeleted,
}: CommercialLifecycleProps) {
  const { showAlert, showToast } = usePresentationService();
  const [notes, setNotes] = useState('');
  const [decision, setDecision] = useState('APPROVED');
  const [invalid, setInvalid] = useState('');
  const notesInput = useRef<HTMLTextAreaElement>(null);
  const dirty = useRef(false);
  const busy = useRef(false);
  useUnsavedFormGuard(dirty, busy);
  const review = useCommercialMutation(
    (service, input: { decision: string; notes: string | null }) =>
      service.review(
        entity as Exclude<CommercialEntity, 'placements'>,
        record.id,
        input.decision,
        input.notes,
      ),
  );
  const enable = useCommercialMutation((service, enabled: boolean) =>
    service.enable(
      entity as 'offers' | 'campaigns' | 'creatives',
      record.id,
      enabled,
    ),
  );
  const remove = useCommercialDelete({
    entity,
    record,
    dirty,
    busy,
    onDeleted,
  });
  const pending = review.isPending || enable.isPending || remove.isPending;
  const status =
    'status' in record
      ? record.status
      : 'review_status' in record
        ? record.review_status
        : undefined;
  const decisions =
    entity === 'sponsors'
      ? status === 'APPROVED'
        ? ['SUSPENDED']
        : status === 'PENDING_REVIEW'
          ? ['APPROVED', 'REJECTED']
          : status === 'SUSPENDED'
            ? ['APPROVED']
            : []
      : status === 'PENDING'
        ? ['APPROVED', 'REJECTED']
        : status === 'APPROVED'
          ? ['REJECTED']
          : [];
  const chosen = decisions.includes(decision) ? decision : decisions[0];
  async function submitReview(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy.current || !chosen) return;
    if (chosen !== 'APPROVED' && !notes.trim()) {
      setInvalid(copy.validation.notes);
      notesInput.current?.focus();
      return;
    }
    if (
      !(await showAlert({
        title: copy.reviewTitle,
        description: copy.reviewDescription,
        confirmLabel: copy.review,
        cancelLabel: copy.cancel,
        tone: chosen === 'APPROVED' ? 'info' : 'warning',
      }))
    )
      return;
    busy.current = true;
    try {
      await review.mutateAsync({
        decision: chosen,
        notes: notes.trim() || null,
      });
      dirty.current = false;
      setNotes('');
      setInvalid('');
      void showToast({ title: copy.reviewedTitle, intent: 'success' });
    } catch {
      /* Inline recovery. */
    } finally {
      busy.current = false;
    }
  }
  async function toggle() {
    if (busy.current || !('is_enabled' in record)) return;
    if (
      !(await showAlert({
        title: copy.enableTitle,
        description: copy.enableDescription,
        confirmLabel: record.is_enabled ? copy.disable : copy.enable,
        cancelLabel: copy.cancel,
        tone: record.is_enabled ? 'danger' : 'info',
      }))
    )
      return;
    busy.current = true;
    try {
      await enable.mutateAsync(!record.is_enabled);
      void showToast({ title: copy.enabledTitle, intent: 'success' });
    } catch {
      /* Inline recovery. */
    } finally {
      busy.current = false;
    }
  }
  return (
    <Card>
      <FormSection
        id="commercial-lifecycle"
        title={copy.lifecycleTitle}
        description={copy.lifecycleHint}
      >
        <div className="flex flex-wrap gap-2">
          {status && <Badge>{copy.statuses[status]}</Badge>}
          {'is_enabled' in record && (
            <Badge intent={record.is_enabled ? 'success' : 'neutral'}>
              {record.is_enabled
                ? copy.statuses.enabled
                : copy.statuses.disabled}
            </Badge>
          )}
          {'verification_status' in record && (
            <Badge>{copy.statuses[record.verification_status]}</Badge>
          )}
        </div>
        {entity !== 'placements' && decisions.length > 0 && (
          <form noValidate onSubmit={submitReview} className="grid gap-4">
            <Field labelText={copy.review_status}>
              <Select
                value={chosen}
                disabled={pending}
                onValueChange={(next) => {
                  dirty.current = true;
                  setDecision(next);
                }}
              >
                {decisions.map((value) => (
                  <option key={value} value={value}>
                    {copy.statuses[value as keyof typeof copy.statuses]}
                  </option>
                ))}
              </Select>
            </Field>
            <Field labelText={copy.review_notes}>
              <TextArea
                id="commercial-review-notes"
                ref={notesInput}
                value={notes}
                maxLength={10000}
                disabled={pending}
                aria-invalid={Boolean(invalid)}
                aria-describedby={
                  invalid ? 'commercial-review-error' : undefined
                }
                onChange={(event) => {
                  dirty.current = true;
                  setNotes(event.target.value);
                  setInvalid('');
                }}
              />
            </Field>
            <p className="m-0 text-sm text-tertiary">{copy.notesHint}</p>
            {invalid && (
              <p
                id="commercial-review-error"
                role="alert"
                className="m-0 text-sm text-error-primary"
              >
                {invalid}
              </p>
            )}
            <Button
              type="submit"
              variant={
                chosen === 'REJECTED' || chosen === 'SUSPENDED'
                  ? 'destructive'
                  : 'primary'
              }
              className="justify-self-start"
              loading={review.isPending}
            >
              {copy.review}
            </Button>
          </form>
        )}
        <MutationError error={review.error ?? enable.error ?? remove.error} />
        {['offers', 'campaigns', 'creatives'].includes(entity) &&
          'is_enabled' in record && (
            <Button
              variant={record.is_enabled ? 'destructive' : 'secondary'}
              className="justify-self-start"
              loading={enable.isPending}
              disabled={pending}
              onClick={() => {
                void toggle();
              }}
            >
              {record.is_enabled ? copy.disable : copy.enable}
            </Button>
          )}
        {'verification_status' in record && (
          <OfferVerification record={record} />
        )}
        <div className="border-t border-secondary pt-4">
          <Button
            variant="destructive"
            disabled={pending}
            loading={remove.isPending}
            onClick={() => {
              void remove.destroy();
            }}
          >
            {copy.delete}
          </Button>
        </div>
      </FormSection>
    </Card>
  );
}
function OfferVerification({
  record,
}: {
  record: Extract<CommercialRecord, { verification_status: unknown }>;
}) {
  const [status, setStatus] = useState(record.verification_status);
  const [source, setSource] = useState(record.verification_source_url ?? '');
  const [until, setUntil] = useState(
    localDateTime(record.verification_valid_until),
  );
  const [invalid, setInvalid] = useState(false);
  const sourceInput = useRef<HTMLInputElement>(null);
  const dirty = useRef(false);
  const busy = useRef(false);
  useUnsavedFormGuard(dirty, busy);
  const { showToast } = usePresentationService();
  const verify = useCommercialMutation(
    (service, input: Parameters<typeof service.verify>[1]) =>
      service.verify(record.id, input),
  );
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy.current) return;
    const parsed = DiscountOfferVerificationSchema.safeParse({
      verification_status: status,
      verification_source_url: source || null,
      verification_valid_until: until ? isoDateTime(until) : null,
    });
    if (
      !parsed.success ||
      (status === 'VERIFIED' &&
        (!parsed.data.verification_valid_until ||
          Date.parse(parsed.data.verification_valid_until) <= Date.now() ||
          Date.parse(parsed.data.verification_valid_until) >
            Date.parse(record.expires_at)))
    ) {
      setInvalid(true);
      sourceInput.current?.focus();
      return;
    }
    setInvalid(false);
    busy.current = true;
    try {
      await verify.mutateAsync(parsed.data);
      dirty.current = false;
      void showToast({ title: copy.verifiedTitle, intent: 'success' });
    } catch {
      /* Inline recovery. */
    } finally {
      busy.current = false;
    }
  }
  return (
    <form
      noValidate
      onSubmit={submit}
      className="grid gap-4 border-t border-secondary pt-5"
    >
      <FormSection
        id="commercial-verification"
        title={copy.verify}
        description={copy.verificationHint}
      >
        <Field labelText={copy.verification_status}>
          <Select
            value={status}
            disabled={verify.isPending}
            onValueChange={(value) => {
              dirty.current = true;
              setStatus(value as typeof status);
            }}
          >
            {(['VERIFIED', 'UNVERIFIED', 'FAILED'] as const).map((value) => (
              <option key={value} value={value}>
                {copy.statuses[value]}
              </option>
            ))}
          </Select>
        </Field>
        <Field labelText={copy.verification_source_url}>
          <Input
            type="url"
            ref={sourceInput}
            value={source}
            disabled={verify.isPending}
            aria-invalid={invalid}
            aria-describedby={invalid ? 'verification-error' : undefined}
            onChange={(event) => {
              dirty.current = true;
              setSource(event.target.value);
            }}
          />
        </Field>
        <Field labelText={copy.verification_valid_until}>
          <Input
            type="datetime-local"
            value={until}
            disabled={verify.isPending}
            aria-invalid={invalid}
            aria-describedby={invalid ? 'verification-error' : undefined}
            onChange={(event) => {
              dirty.current = true;
              setUntil(event.target.value);
            }}
          />
        </Field>
        {invalid && (
          <Message
            id="verification-error"
            title={copy.errorTitle}
            description={copy.validation.verification}
            intent="danger"
          />
        )}
        <MutationError error={verify.error} />
        <Button
          type="submit"
          loading={verify.isPending}
          className="justify-self-start"
        >
          {copy.verify}
        </Button>
      </FormSection>
    </form>
  );
}
