'use client';
import { useEffect, useRef, useState, type RefObject } from 'react';
import { ValidationError } from '@/errors/domainErrors';
import { gentlePathGoalStrings as copy } from '@/strings';
import { useGoalActions } from '../hooks';
import type { GoalMedia } from '../models/goalMedia';
import type { GoalAttachmentDraft } from '../models/goalAttachmentDraft';
import { GoalUploadInputSchema } from '../models/goalUploadInput';

export function useGoalAttachments(
  initial: GoalMedia[],
  dirtyRef: RefObject<boolean>,
) {
  const [rows, setRows] = useState<GoalAttachmentDraft[]>(() =>
    initial.map((media) => ({
      id: media.id,
      media,
      progress: 100,
      status: 'ready',
    })),
  );
  const [error, setError] = useState<unknown>(null);
  const controllers = useRef(new Map<string, AbortController>());
  const removed = useRef(new Set<string>());
  const actions = useGoalActions();
  useEffect(
    () => () => controllers.current.forEach((controller) => controller.abort()),
    [],
  );
  function change(id: string, value: Partial<GoalAttachmentDraft>) {
    setRows((current) =>
      current.map((row) => (row.id === id ? { ...row, ...value } : row)),
    );
  }
  async function upload(row: GoalAttachmentDraft, childId: string) {
    if (!row.file || removed.current.has(row.id)) return;
    const controller = controllers.current.get(row.id) ?? new AbortController();
    controllers.current.set(row.id, controller);
    change(row.id, { status: 'uploading', progress: 0 });
    try {
      const media = await actions.upload.mutateAsync({
        file: row.file,
        childId,
        signal: controller.signal,
        progress: (value) => change(row.id, { progress: value }),
      });
      if (removed.current.has(row.id)) {
        void actions.cancelUpload
          .mutateAsync(media.upload_session_id)
          .catch(() => undefined);
        return;
      }
      change(row.id, { media, progress: 100, status: 'ready' });
    } catch {
      if (!removed.current.has(row.id)) change(row.id, { status: 'failed' });
    } finally {
      controllers.current.delete(row.id);
    }
  }
  async function add(files: File[], childId: string) {
    if (rows.length + files.length > 10) {
      setError(new ValidationError(copy.attachmentLimit));
      return;
    }
    if (!childId) {
      setError(new ValidationError(copy.invalidGoal));
      return;
    }
    const typedFiles = files.map((file) => {
      const extensions: Record<string, string> = {
        jpg: 'image/jpeg',
        jpeg: 'image/jpeg',
        png: 'image/png',
        webp: 'image/webp',
        pdf: 'application/pdf',
        mp4: 'video/mp4',
        mov: 'video/quicktime',
      };
      const mimeType =
        file.type ||
        extensions[file.name.split('.').pop()?.toLowerCase() ?? ''] ||
        '';
      return new File([file], file.name, { type: mimeType });
    });
    if (
      typedFiles.some(
        (file) =>
          !GoalUploadInputSchema.safeParse({
            child_id: childId,
            original_file_name: file.name,
            mime_type: file.type,
            size_bytes: file.size,
          }).success,
      )
    ) {
      setError(new ValidationError(copy.invalidFile));
      return;
    }
    setError(null);
    dirtyRef.current = true;
    const pending = typedFiles.map((file): GoalAttachmentDraft => ({
      id: crypto.randomUUID(),
      file,
      progress: 0,
      status: 'uploading',
    }));
    pending.forEach((row) =>
      controllers.current.set(row.id, new AbortController()),
    );
    setRows((current) => [...current, ...pending]);
    for (const row of pending) await upload(row, childId);
  }
  function remove(row: GoalAttachmentDraft) {
    removed.current.add(row.id);
    controllers.current.get(row.id)?.abort();
    if (row.media && !row.media.goal_id)
      void actions.cancelUpload
        .mutateAsync(row.media.upload_session_id)
        .catch(() => undefined);
    dirtyRef.current = true;
    setRows((current) => current.filter((item) => item.id !== row.id));
  }
  function move(id: string, targetId: string) {
    dirtyRef.current = true;
    setRows((current) => {
      const next = [...current];
      const from = next.findIndex((row) => row.id === id);
      const to = next.findIndex((row) => row.id === targetId);
      if (from >= 0 && to >= 0) next.splice(to, 0, next.splice(from, 1)[0]);
      return next;
    });
  }
  return {
    rows,
    error,
    add,
    upload,
    remove,
    move,
    cancel: (id: string) => controllers.current.get(id)?.abort(),
    busy: rows.some((row) => row.status === 'uploading'),
  };
}
