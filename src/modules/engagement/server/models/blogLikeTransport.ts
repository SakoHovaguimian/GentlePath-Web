import { z } from 'zod';
export const BlogLikeTransportSchema = z.object({ blog_id: z.string().uuid() });
