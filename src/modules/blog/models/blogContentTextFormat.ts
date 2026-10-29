import { z } from 'zod';

export const BlogContentTextFormatSchema = z.enum(['plain', 'markdown']);
export type BlogContentTextFormat = z.infer<typeof BlogContentTextFormatSchema>;
