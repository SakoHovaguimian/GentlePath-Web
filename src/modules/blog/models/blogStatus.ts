import { z } from 'zod';

export const BlogStatusSchema = z.enum(['draft', 'published']);
export type BlogStatus = z.infer<typeof BlogStatusSchema>;
