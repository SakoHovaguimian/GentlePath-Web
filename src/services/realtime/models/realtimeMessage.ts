import { z } from 'zod';

const ChangeHintSchema = z
  .object({
    entity_type: z.enum([
      'POST',
      'POLL',
      'POST_COMMENT',
      'POLL_COMMENT',
      'CHAT_MESSAGE',
    ]),
    entity_id: z.string().uuid(),
    parent_id: z.string().uuid().optional(),
    action: z.enum([
      'CREATED',
      'UPDATED',
      'DELETED',
      'REACTION_CHANGED',
      'VOTE_CHANGED',
    ]),
  })
  .strict();
const BaseSchema = z.object({
  event_id: z.string().uuid(),
  type: z.literal('EVENT'),
  timestamp: z.string().datetime(),
});
export const RealtimeMessageSchema = z.discriminatedUnion('channel', [
  BaseSchema.extend({
    channel: z.literal('community'),
    payload: ChangeHintSchema,
  }),
  BaseSchema.extend({ channel: z.literal('chat'), payload: ChangeHintSchema }),
  BaseSchema.extend({
    channel: z.literal('notifications'),
    payload: z
      .object({
        reason: z.enum([
          'PUBLISHED',
          'READ_STATE_CHANGED',
          'ARCHIVED',
          'EXPIRED',
        ]),
        notification_ids: z.array(z.string().uuid()).max(100).optional(),
      })
      .strict(),
  }),
]);
export type RealtimeMessage = z.infer<typeof RealtimeMessageSchema>;
