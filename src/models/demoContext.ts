import { z } from 'zod';

export const DemoContextSchema = z.object({
  scenario: z
    .enum(['populated', 'loading', 'empty', 'error'])
    .default('populated'),
  latencyMs: z.number().int().min(0).max(5000).default(350),
});
export type DemoContext = z.infer<typeof DemoContextSchema>;
