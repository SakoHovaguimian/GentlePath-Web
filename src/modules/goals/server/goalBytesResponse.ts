import 'server-only';
import type { GoalMedia } from '../models/goalMedia';

const byteRangeUnit = 'bytes';

export function goalBytesResponse(
  request: Request,
  media: GoalMedia,
  bytes: Buffer,
  download: boolean,
): Response {
  const filename = media.original_file_name.replace(/[^\x20-\x7e]|["\\]/g, '_');
  const headers = new Headers({
    'cache-control': 'private, no-store',
    'content-type': media.mime_type,
    'content-disposition': `${download ? 'attachment' : 'inline'}; filename="${filename}"`,
    'x-content-type-options': 'nosniff',
    'content-security-policy': "default-src 'none'; sandbox; base-uri 'none'",
    'cross-origin-resource-policy': 'same-origin',
    'referrer-policy': 'no-referrer',
    'accept-ranges': 'bytes',
  });
  const range = request.headers.get('range');
  if (range && !request.headers.has('if-range')) {
    const match = /^bytes=(\d*)-(\d*)$/.exec(range);
    const suffix = match?.[1] === '';
    const start = suffix
      ? Math.max(0, bytes.length - Number(match?.[2]))
      : Number(match?.[1]);
    const end = suffix
      ? bytes.length - 1
      : Math.min(
          bytes.length - 1,
          match?.[2] ? Number(match[2]) : bytes.length - 1,
        );
    if (
      !match ||
      (!match[1] && !match[2]) ||
      (suffix && Number(match[2]) === 0) ||
      !Number.isSafeInteger(start) ||
      !Number.isSafeInteger(end) ||
      start > end ||
      start >= bytes.length
    ) {
      headers.set('content-range', `${byteRangeUnit} */${bytes.length}`);
      return new Response(null, { status: 416, headers });
    }
    headers.set(
      'content-range',
      `${byteRangeUnit} ${start}-${end}/${bytes.length}`,
    );
    headers.set('content-length', String(end - start + 1));
    return new Response(Buffer.from(bytes.subarray(start, end + 1)), {
      status: 206,
      headers,
    });
  }
  headers.set('content-length', String(bytes.length));
  return new Response(Buffer.from(bytes), { headers });
}
