import type { ApiClientInterface } from '@/services/api/apiClientInterface';
import { validateInput } from '@/utils/validateInput';
import { ValidationError } from '@/errors/domainErrors';
import { gentlePathGoalStrings as copy } from '@/strings';
import { GoalSchema, GoalInputSchema, type GoalInput } from '../models/goal';
import { GoalQuerySchema, type GoalQuery } from '../models/goalQuery';
import { GoalPageSchema } from '../models/goalPage';
import { GoalStatusSchema, type GoalStatus } from '../models/goalStatus';
import {
  GoalNoteSchema,
  GoalNoteInputSchema,
  type GoalNoteInput,
} from '../models/goalNote';
import { GoalUploadInputSchema } from '../models/goalUploadInput';
import { GoalUploadSchema } from '../models/goalUpload';
import { GoalMediaSchema } from '../models/goalMedia';
import { GoalDownloadSchema } from '../models/goalDownload';
import { uploadGoalFile } from './uploadGoalFile';

const base = '/portal/goals';
export class GoalService {
  constructor(private readonly api: ApiClientInterface) {}
  async list(input: GoalQuery, signal?: AbortSignal) {
    const query = validateInput(GoalQuerySchema, input);
    const params = new URLSearchParams({
      limit: String(query.limit),
      offset: String(query.offset),
    });
    if (query.query) params.set('query', query.query);
    if (query.child_id) params.set('child_id', query.child_id);
    if (query.status) params.set('status', query.status);
    return GoalPageSchema.parse(
      await this.api.request(`${base}?${params}`, { signal }),
    );
  }
  async get(id: string, signal?: AbortSignal) {
    return GoalSchema.parse(
      await this.api.request(`${base}/${encodeURIComponent(id)}`, { signal }),
    );
  }
  async save(input: GoalInput, id?: string) {
    return GoalSchema.parse(
      await this.api.request(
        `${base}${id ? `/${encodeURIComponent(id)}` : ''}`,
        {
          method: id ? 'PUT' : 'POST',
          body: validateInput(GoalInputSchema, input),
        },
      ),
    );
  }
  async status(id: string, status: GoalStatus) {
    return GoalSchema.parse(
      await this.api.request(`${base}/${encodeURIComponent(id)}/status`, {
        method: 'PATCH',
        body: { status: GoalStatusSchema.parse(status) },
      }),
    );
  }
  async remove(id: string) {
    await this.api.request(`${base}/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
  }
  async saveNote(id: string, input: GoalNoteInput, noteId?: string) {
    return GoalNoteSchema.parse(
      await this.api.request(
        `${base}/${encodeURIComponent(id)}/notes${noteId ? `/${encodeURIComponent(noteId)}` : ''}`,
        {
          method: noteId ? 'PUT' : 'POST',
          body: validateInput(GoalNoteInputSchema, input),
        },
      ),
    );
  }
  async removeNote(id: string, noteId: string) {
    await this.api.request(
      `${base}/${encodeURIComponent(id)}/notes/${encodeURIComponent(noteId)}`,
      { method: 'DELETE' },
    );
  }
  async download(
    id: string,
    mediaId: string,
    download = true,
    signal?: AbortSignal,
  ) {
    return GoalDownloadSchema.parse(
      await this.api.request(
        `${base}/${encodeURIComponent(id)}/media/${encodeURIComponent(mediaId)}/download?download=${download}`,
        { signal },
      ),
    );
  }
  async upload(
    file: File,
    childId: string,
    signal: AbortSignal,
    progress: (value: number) => void,
  ) {
    const parsed = GoalUploadInputSchema.safeParse({
      child_id: childId,
      original_file_name: file.name,
      mime_type: file.type,
      size_bytes: file.size,
    });
    if (!parsed.success) throw new ValidationError(copy.invalidFile);
    const session = GoalUploadSchema.parse(
      await this.api.request(`${base}/uploads`, {
        method: 'POST',
        body: parsed.data,
        signal,
      }),
    );
    try {
      await uploadGoalFile(file, session, signal, progress);
      return GoalMediaSchema.parse(
        await this.api.request(`${base}/uploads/${session.id}/complete`, {
          method: 'POST',
          signal,
        }),
      );
    } catch (error) {
      // Cancellation can race completion; only unattached drafts can be cancelled.
      await this.cancelUpload(session.id).catch(() => undefined);
      throw error;
    }
  }
  async cancelUpload(id: string) {
    await this.api.request(`${base}/uploads/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
  }
}
