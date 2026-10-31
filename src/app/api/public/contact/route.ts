import { getContainer } from '@/container';
import {
  ApiError,
  OwnershipError,
  ValidationError,
} from '@/errors/domainErrors';
import { ContactRequestSchema } from '@/modules/contact/models/contactRequest';
import { getDemoContext } from '@/services/demo/demoRuntime';
import { errorResponse, trustedMutation } from '@/services/api/routeSafety';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    if (!trustedMutation(request)) throw new OwnershipError();
    const reader = request.body?.getReader();
    if (!reader) throw new ValidationError();
    const chunks: Uint8Array[] = [];
    let size = 0;
    try {
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        size += value.byteLength;
        if (size > 32768) {
          await reader.cancel();
          throw new ValidationError();
        }
        chunks.push(value);
      }
    } finally {
      reader.releaseLock();
    }
    const raw = Buffer.concat(chunks).toString('utf8');
    const input = ContactRequestSchema.parse(JSON.parse(raw));
    const container = await getContainer();
    if (container.demoMode) {
      const context = await getDemoContext();
      const latency =
        context.latencyMs || (context.scenario === 'loading' ? 1500 : 0);
      if (latency) await new Promise((resolve) => setTimeout(resolve, latency));
      if (context.scenario === 'error') throw new ApiError(undefined, 503);
      return Response.json(
        { sent: true, demo: true },
        { headers: { 'cache-control': 'no-store' } },
      );
    }
    return await container.apiClient.proxy(
      new Request(request.url, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(input),
        signal: request.signal,
      }),
      '/support',
      '',
    );
  } catch (error) {
    return errorResponse(error);
  }
}
