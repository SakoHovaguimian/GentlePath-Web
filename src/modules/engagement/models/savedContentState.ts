import { z } from 'zod';
export const SavedContentStateSchema = z.object({ saved: z.boolean() });
