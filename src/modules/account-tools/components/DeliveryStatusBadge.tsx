import { Badge } from '@/components/ui';
import { gentlePathAccountToolsStrings as copy } from '@/strings';
import type { NotificationDelivery } from '../models/notificationDelivery';

export function DeliveryStatusBadge({
  status,
}: {
  status: NotificationDelivery['status'];
}) {
  return (
    <Badge
      intent={
        status === 'ACCEPTED'
          ? 'success'
          : status === 'FAILED'
            ? 'danger'
            : status === 'UNKNOWN'
              ? 'warning'
              : status === 'PROCESSING'
                ? 'info'
                : 'neutral'
      }
    >
      {copy.deliveries.statuses[status]}
    </Badge>
  );
}
