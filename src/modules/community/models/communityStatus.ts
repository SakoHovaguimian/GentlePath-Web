import { z } from 'zod';

export const CommunityStatusSchema = z.object({ enabled: z.boolean() });
