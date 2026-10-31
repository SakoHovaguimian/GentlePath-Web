import {
  Button,
  Card,
  DescriptionList,
  EmptyState,
  Modal,
  QueryBoundary,
} from '@/components/ui';
import { gentlePathAccountToolsStrings as copy } from '@/strings';
import type { NotificationDelivery } from '../models/notificationDelivery';
import { useDeliveryAttempts } from '../hooks';
import { formatAccountToolsDate } from '../formatAccountToolsDate';
import { AccountToolsLoading } from './AccountToolsLoading';
import { AccountToolsPagination } from './AccountToolsPagination';
import { DeliveryStatusBadge } from './DeliveryStatusBadge';

export function DeliveryAttemptsDialog({
  delivery,
  offset,
  onNavigate,
  onClose,
}: {
  delivery: NotificationDelivery;
  offset: number;
  onNavigate: (offset: number) => void;
  onClose: () => void;
}) {
  const query = useDeliveryAttempts(delivery.id, { limit: 10, offset });
  return (
    <Modal
      open
      title={copy.deliveries.attemptsTitle}
      description={copy.deliveries.attemptsDescription}
      onDismiss={onClose}

      footer={
        <div className="flex justify-end">
          <Button variant="secondary" onClick={onClose}>
            {copy.common.closeAction}
          </Button>
        </div>
      }
    >
      <div className="grid gap-5">
        <DeliveryStatusBadge status={delivery.status} />
        <DescriptionList
          items={[
            {
              label: copy.deliveries.notificationColumn,
              value: delivery.notificationId,
              fullWidth: true,
            },
            {
              label: copy.deliveries.acceptedLabel,
              value: formatAccountToolsDate(delivery.acceptedAt),
            },
            {
              label: copy.deliveries.nextAttemptLabel,
              value: formatAccountToolsDate(delivery.nextAttemptAt),
            },
            ...(delivery.error
              ? [
                  {
                    label: copy.deliveries.errorLabel,
                    value: delivery.error,
                    fullWidth: true,
                  },
                ]
              : []),
            ...(delivery.skipReason
              ? [
                  {
                    label: copy.deliveries.skipReasonLabel,
                    value: delivery.skipReason,
                    fullWidth: true,
                  },
                ]
              : []),
          ]}
        />
        <QueryBoundary query={query} loadingFallback={<AccountToolsLoading />}>
          {(result) => (
            <>
              {result.data.length ? (
                <div className="grid gap-3">
                  {result.data.map((attempt) => (
                    <Card key={attempt.id} className="grid gap-4 p-4">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <h3 className="m-0 text-base font-semibold">
                          {copy.deliveries.attemptLabel(attempt.attemptNumber)}
                        </h3>
                        <DeliveryStatusBadge status={attempt.outcome} />
                      </div>
                      <DescriptionList
                        items={[
                          {
                            label: copy.deliveries.startedLabel,
                            value: formatAccountToolsDate(attempt.startedAt),
                          },
                          {
                            label: copy.deliveries.finishedLabel,
                            value: formatAccountToolsDate(attempt.finishedAt),
                          },
                          {
                            label: copy.deliveries.retryableLabel,
                            value:
                              attempt.retryable === null
                                ? copy.common.notRecorded
                                : attempt.retryable
                                  ? copy.deliveries.yesStatus
                                  : copy.deliveries.noStatus,
                          },
                          ...(attempt.error
                            ? [
                                {
                                  label: copy.deliveries.errorLabel,
                                  value: attempt.error,
                                  fullWidth: true,
                                },
                              ]
                            : []),
                        ]}
                      />
                    </Card>
                  ))}
                </div>
              ) : (
                <EmptyState
                  title={copy.deliveries.noAttemptsTitle}
                  description={copy.deliveries.noAttemptsHint}
                />
              )}
              <AccountToolsPagination
                page={result.page}
                count={result.data.length}
                busy={query.isFetching}
                onNavigate={onNavigate}
              />
            </>
          )}
        </QueryBoundary>
      </div>
    </Modal>
  );
}
