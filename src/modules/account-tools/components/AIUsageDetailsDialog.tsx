import {
  Badge,
  Button,
  DescriptionList,
  Modal,
  PageSection,
} from '@/components/ui';
import { gentlePathAccountToolsStrings as copy } from '@/strings';
import type { AIUsageEvent } from '../models/aiUsageEvent';
import {
  formatAccountToolsDate,
  formatTokenCount,
} from '../formatAccountToolsDate';

export function AIUsageDetailsDialog({
  record,
  onClose,
}: {
  record: AIUsageEvent;
  onClose: () => void;
}) {
  return (
    <Modal
      open
      title={copy.aiUsage.recordTitle}
      description={copy.aiUsage.detailsDescription}
      onDismiss={onClose}
    >
      <div className="grid gap-6">
        <Badge intent={record.deleted ? 'neutral' : 'success'}>
          {record.deleted
            ? copy.common.deletedStatus
            : copy.common.activeStatus}
        </Badge>
        <DescriptionList
          items={[
            {
              label: copy.aiUsage.contextLabel,
              value: record.context,
              fullWidth: true,
            },
            {
              label: copy.aiUsage.userLabel,
              value: record.userId ?? copy.common.systemUser,
              fullWidth: true,
            },
            {
              label: copy.aiUsage.inputLabel,
              value: formatTokenCount(record.inputTokens),
            },
            {
              label: copy.aiUsage.outputLabel,
              value: formatTokenCount(record.outputTokens),
            },
            {
              label: copy.aiUsage.totalLabel,
              value: formatTokenCount(record.totalTokens),
            },
            {
              label: copy.common.createdColumn,
              value: formatAccountToolsDate(record.createdAt),
            },
            {
              label: copy.common.updatedColumn,
              value: formatAccountToolsDate(record.updatedAt),
            },
            {
              label: copy.aiUsage.errorLabel,
              value: record.error ?? copy.common.notRecorded,
              fullWidth: true,
            },
          ]}
        />
        <PageSection id="usage-metadata" title={copy.aiUsage.metadataLabel}>
          <pre className="m-0 max-h-72 overflow-auto whitespace-pre-wrap rounded-xl border border-secondary bg-secondary_subtle p-4 font-mono text-xs text-secondary wrap-anywhere">
            {record.metadata
              ? JSON.stringify(record.metadata, null, 2)
              : copy.common.notRecorded}
          </pre>
        </PageSection>
        {record.deleted && (
          <p className="m-0 text-sm text-secondary">
            {copy.aiUsage.deletedHint}
          </p>
        )}
        <div className="flex justify-end border-t border-secondary pt-5">
          <Button variant="secondary" onClick={onClose}>
            {copy.common.closeAction}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
