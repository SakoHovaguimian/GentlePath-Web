import { z } from 'zod';

export const NotificationChannelSchema = z.enum(['IN_APP', 'PUSH', 'EMAIL']);
export type NotificationChannel = z.infer<typeof NotificationChannelSchema>;
