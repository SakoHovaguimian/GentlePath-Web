import { useState } from 'react';
import { Button, Field, Modal, Select, TextArea } from '@/components/ui';
import { usePresentationService } from '@/presentation/PresentationProvider';
import { gentlePathPortalStrings as copy } from '@/strings';
import {
  ReportResolutionSchema,
  type ModerationReport,
  type ReportResolution,
} from '../models/moderationReport';
import { useResolveReport } from '../adminHooks';
import { MutationError } from './MutationError';
import styles from '../Admin.module.css';

export function ReportReview({
  report,
  onClose,
}: {
  report: ModerationReport;
  onClose: () => void;
}) {
  const [input, setInput] = useState<ReportResolution>({
    status: 'resolved',
    resolutionNote: report.resolutionNote,
  });
  const [validation, setValidation] = useState('');
  const mutation = useResolveReport();
  const { showToast } = usePresentationService();
  return (
    <Modal
      open
      title={copy.moderation.reviewTitle}
      description={report.contentTitle}
      onDismiss={() => {
        if (!mutation.isPending) onClose();
      }}
    >
      <form
        noValidate
        className="grid gap-5"
        onSubmit={async (event) => {
          event.preventDefault();
          if (mutation.isPending) return;
          const parsed = ReportResolutionSchema.safeParse(input);
          if (!parsed.success) {
            setValidation(copy.validation.resolution);
            event.currentTarget
              .querySelector<HTMLElement>('[name="resolutionNote"]')
              ?.focus();
            return;
          }
          try {
            await mutation.mutateAsync({ id: report.id, input: parsed.data });
            void showToast({
              title: copy.moderation.updated,
              intent: 'success',
            });
            onClose();
          } catch {
            /* Inline recovery. */
          }
        }}
      >
        <div className={styles.reviewReason}>
          <p className="m-0 text-xs font-medium text-tertiary">
            {copy.moderation.reason}
          </p>
          <p className="mt-2 mb-0 text-sm text-secondary">{report.reason}</p>
        </div>
        <Field labelText={copy.moderation.noteLabel}>
          <TextArea
            name="resolutionNote"
            value={input.resolutionNote}
            rows={4}
            maxLength={2000}
            placeholder={copy.moderation.notePlaceholder}
            aria-invalid={Boolean(validation)}
            aria-describedby={validation ? 'review-validation' : undefined}
            disabled={mutation.isPending}
            onChange={(event) => {
              setInput((current) => ({
                ...current,
                resolutionNote: event.target.value,
              }));
              setValidation('');
            }}
          />
        </Field>
        <Field labelText={copy.moderation.decisionLabel}>
          <Select
            value={input.status}
            disabled={mutation.isPending}
            onValueChange={(value) =>
              setInput((current) => ({
                ...current,
                status: value === 'dismissed' ? 'dismissed' : 'resolved',
              }))
            }
          >
            {ReportResolutionSchema.shape.status.options.map((status) => (
              <option key={status} value={status}>
                {status === 'resolved'
                  ? copy.moderation.resolve
                  : copy.moderation.dismiss}
              </option>
            ))}
          </Select>
        </Field>
        {validation && (
          <p
            id="review-validation"
            role="alert"
            className="text-sm text-error-primary"
          >
            {validation}
          </p>
        )}
        <MutationError error={mutation.error} />
        <div className="flex justify-end gap-3 border-t border-secondary pt-5">
          <Button
            variant="secondary"
            disabled={mutation.isPending}
            onClick={onClose}
          >
            {copy.common.cancel}
          </Button>
          <Button type="submit" loading={mutation.isPending}>
            {copy.moderation.save}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
