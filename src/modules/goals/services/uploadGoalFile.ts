import { ApiError } from '@/errors/domainErrors';
import { gentlePathGoalStrings as copy } from '@/strings';
import type { GoalUpload } from '../models/goalUpload';

export function uploadGoalFile(
  file: File,
  upload: GoalUpload,
  signal: AbortSignal,
  progress: (value: number) => void,
): Promise<void> {
  signal.throwIfAborted();
  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();
    const abort = () => request.abort();
    const done = () => signal.removeEventListener('abort', abort);
    request.open('POST', upload.url);
    request.timeout = 10 * 60 * 1000;
    request.upload.onprogress = (event) => {
      if (event.lengthComputable)
        progress(Math.min(99, Math.round((event.loaded / event.total) * 100)));
    };
    request.onload = () => {
      done();
      if (request.status >= 200 && request.status < 300) {
        progress(100);
        resolve();
      } else reject(new ApiError(copy.uploadFailed, request.status));
    };
    request.onerror = () => {
      done();
      reject(new ApiError(copy.uploadFailed));
    };
    request.ontimeout = () => {
      done();
      reject(new ApiError(copy.uploadFailed));
    };
    request.onabort = () => {
      done();
      reject(new DOMException('AbortError', 'AbortError'));
    };
    signal.addEventListener('abort', abort, { once: true });
    const form = new FormData();
    Object.entries(upload.fields).forEach(([key, value]) =>
      form.append(key, value),
    );
    form.append('file', file);
    request.send(form);
  });
}
