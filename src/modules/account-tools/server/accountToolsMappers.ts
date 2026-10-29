import type { AccountDeviceTransport } from './models/accountDeviceTransport';
import type { NotificationDeliveryTransport } from './models/notificationDeliveryTransport';
import type { NotificationAttemptTransport } from './models/notificationAttemptTransport';
import type { AIUsageTransport } from './models/aiUsageTransport';
import type { AIUsageEventInput } from '../models/aiUsageEvent';

export function mapAccountDevice(value: AccountDeviceTransport) {
  return {
    id: value.id,
    deviceType: value.device_type,
    createdAt: value.created_at,
    updatedAt: value.updated_at,
  };
}
export function mapNotificationDelivery(value: NotificationDeliveryTransport) {
  return {
    id: value.id,
    notificationId: value.notification_id,
    channel: value.channel,
    status: value.status,
    attemptCount: value.attempt_count,
    nextAttemptAt: value.next_attempt_at,
    acceptedAt: value.accepted_at,
    error: value.error,
    skipReason: value.skip_reason,
    createdAt: value.created_at,
  };
}
export function mapNotificationAttempt(value: NotificationAttemptTransport) {
  return {
    id: value.id,
    attemptNumber: value.attempt_number,
    startedAt: value.started_at,
    finishedAt: value.finished_at,
    outcome: value.outcome,
    retryable: value.retryable,
    error: value.error,
  };
}
export function mapAIUsage(value: AIUsageTransport) {
  return {
    id: value.id,
    userId: value.user_id ?? null,
    context: value.ai_context_type,
    inputTokens: value.input_tokens ?? null,
    outputTokens: value.output_tokens ?? null,
    totalTokens: value.total_tokens ?? null,
    metadata: value.metadata ?? null,
    error: value.error ?? null,
    deleted: value.deleted ?? false,
    createdAt: value.created_at,
    updatedAt: value.updated_at,
  };
}
export function aiUsageInputTransport(input: AIUsageEventInput) {
  return {
    user_id: input.userId,
    ai_context_type: input.context,
    input_tokens: input.inputTokens,
    output_tokens: input.outputTokens,
    total_tokens: input.totalTokens,
    metadata: input.metadata,
    error: input.error,
  };
}
