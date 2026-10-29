import 'server-only';
import { z } from 'zod';
import { ChildProfileSchema } from '@/modules/portal/models/childProfile';
import { ChildProfileTransportSchema } from './models/childProfileTransport';
import type { BackendForward } from './models/backendForward';

const ChildrenPageSchema = z.object({
  data: z.array(ChildProfileTransportSchema),
  page: z.object({
    hasMore: z.boolean(),
    nextOffset: z.number().int().nonnegative().nullable(),
  }),
});

/** Owner-scoped family choices shared by uploads and milestone workflows. */
export async function portalFamilyReads(
  request: Request,
  path: string,
  forward: BackendForward,
): Promise<Response | null> {
  if (request.method !== 'GET' || path !== '/portal/children') return null;
  const children = [];
  let offset = 0;
  for (;;) {
    const response = await forward(
      request,
      `/child-profiles?limit=100&offset=${offset}`,
    );
    if (!response.ok) return response;
    const page = ChildrenPageSchema.parse(await response.json());
    children.push(
      ...page.data.map((child) =>
        ChildProfileSchema.parse({
          id: child.id,
          userId: child.user_id,
          name: child.name,
          dateOfBirth: child.date_of_birth,
          supportNotes: '',
        }),
      ),
    );
    if (
      !page.page.hasMore ||
      page.page.nextOffset === null ||
      page.page.nextOffset <= offset
    )
      break;
    offset = page.page.nextOffset;
  }
  return Response.json(children, { headers: { 'cache-control': 'no-store' } });
}
