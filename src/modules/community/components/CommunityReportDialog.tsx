import { useId, useRef, useState, type FormEvent } from 'react';
import { Button, Field, Modal, TextArea } from '@/components/ui';
import { useUnsavedFormGuard } from '@/providers/useUnsavedFormGuard';
import { usePresentationService } from '@/presentation/PresentationProvider';
import { MutationError } from '@/modules/portal/components/MutationError';
import { gentlePathCommunityStrings as copy } from '@/strings';
import { CommunityReportInputSchema } from '../models/communityReport';
import type { CommunityReportTarget } from '../models/communityReportTarget';
import { useSubmitCommunityReport } from '../hooks';

interface CommunityReportDialogProps {
  target: CommunityReportTarget;
  onClose: () => void;
}
export function CommunityReportDialog({
  target,
  onClose,
}: CommunityReportDialogProps) {
  const formId = useId();
  const [reason, setReason] = useState('');
  const [validation, setValidation] = useState('');
  const dirty = useRef(false);
  const busy = useRef(false);
  const confirmLeave = useUnsavedFormGuard(dirty, busy);
  const mutation = useSubmitCommunityReport();
  const { showToast } = usePresentationService();
  function close() {
    void confirmLeave().then((allowed) => {
      if (allowed) onClose();
    });
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy.current) return;
    const parsed = CommunityReportInputSchema.safeParse({
      targetId: target.id,
      targetType: target.targetType,
      reason,
    });
    if (!parsed.success) {
      setValidation(copy.validation.reason);
      event.currentTarget
        .querySelector<HTMLElement>('[name="reason"]')
        ?.focus();
      return;
    }
    busy.current = true;
    try {
      await mutation.mutateAsync(parsed.data);
      dirty.current = false;
      void showToast({ title: copy.reported, intent: 'success' });
      onClose();
    } catch {
      /* The reason remains available for retry. */
    } finally {
      busy.current = false;
    }
  }
  return (
    <Modal
      open
      title={copy.reportTitle}
      description={copy.reportDescription}
      onDismiss={close}

      footer={
        <div className="flex flex-wrap justify-end gap-3">
          <Button
            variant="secondary"
            disabled={mutation.isPending}
            onClick={close}
          >
            {copy.cancel}
          </Button>
          <Button type="submit" form={formId} loading={mutation.isPending}>
            {copy.submitReport}
          </Button>
        </div>
      }
    >
      <form id={formId} noValidate className="grid gap-5" onSubmit={submit}>
        <p className="m-0 rounded-xl bg-secondary_subtle p-4 text-sm font-semibold text-primary wrap-anywhere">
          {target.title}
        </p>
        <Field labelText={copy.reasonLabel}>
          <TextArea
            name="reason"
            rows={6}
            maxLength={10000}
            value={reason}
            placeholder={copy.reasonPlaceholder}
            disabled={mutation.isPending}
            aria-invalid={Boolean(validation)}
            aria-describedby={
              validation ? 'community-report-validation' : undefined
            }
            onChange={(event) => {
              dirty.current = true;
              setReason(event.target.value);
              setValidation('');
            }}
          />
        </Field>
        {validation && (
          <p
            id="community-report-validation"
            role="alert"
            className="m-0 text-sm text-error-primary"
          >
            {validation}
          </p>
        )}
        <MutationError error={mutation.error} />
      </form>
    </Modal>
  );
}
