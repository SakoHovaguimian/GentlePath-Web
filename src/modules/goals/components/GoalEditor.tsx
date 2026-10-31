'use client';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import type { Route } from 'next';
import {
  buttonClassName,
  Button,
  Card,
  Field,
  FileInput,
  Input,
  NavigationLink,
  ReorderableList,
  Select,
  TextArea,
} from '@/components/ui';
import { useUnsavedFormGuard } from '@/providers/useUnsavedFormGuard';
import { usePresentationService } from '@/presentation/PresentationProvider';
import { gentlePathGoalStrings as copy } from '@/strings';
import { ValidationError } from '@/errors/domainErrors';
import { MutationError } from '@/modules/portal/components/MutationError';
import type { ChildProfile } from '@/modules/portal/models/childProfile';
import { GoalInputSchema, type Goal, type GoalInput } from '../models/goal';
import { GoalStatusSchema } from '../models/goalStatus';
import { useGoalActions } from '../hooks';
import { goalStatusLabel } from '../services/goalStatusLabel';
import { useGoalAttachments } from './useGoalAttachments';

const noSelection = '';

export function GoalEditor({
  goal,
  childrenProfiles,
}: {
  goal?: Goal;
  childrenProfiles: ChildProfile[];
}) {
  const router = useRouter();
  const actions = useGoalActions();
  const dirty = useRef(false);
  const busy = useRef(false);
  const confirmLeave = useUnsavedFormGuard(dirty, busy);
  const files = useRef<HTMLInputElement>(null);
  const titleRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<unknown>(null);
  const [input, setInput] = useState<GoalInput>(() => ({
    child_id: goal?.child_id ?? childrenProfiles[0]?.id ?? '',
    title: goal?.title ?? '',
    description: goal?.description ?? '',
    status: goal?.status ?? 'ACTIVE',
    media_ids: goal?.media.map((media) => media.id) ?? [],
    cover_media_id: goal?.cover_media_id ?? null,
  }));
  const media = useGoalAttachments(goal?.media ?? [], dirty);
  const { showToast } = usePresentationService();
  const isBusy = actions.save.isPending || media.busy;
  useEffect(() => {
    busy.current = isBusy;
  }, [isBusy]);
  function change<Key extends keyof GoalInput>(
    key: Key,
    value: GoalInput[Key],
  ) {
    dirty.current = true;
    setInput((current) => ({ ...current, [key]: value }));
    setError(null);
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy.current) return;
    if (media.rows.some((row) => !row.media || row.status !== 'ready')) {
      setError(new ValidationError(copy.uploadFailed));
      return;
    }
    const ids = media.rows.map((row) => row.media!.id);
    const parsed = GoalInputSchema.safeParse({
      ...input,
      media_ids: ids,
      cover_media_id:
        input.cover_media_id && ids.includes(input.cover_media_id)
          ? input.cover_media_id
          : null,
    });
    if (!parsed.success) {
      setError(new ValidationError(copy.invalidGoal));
      titleRef.current?.focus();
      return;
    }
    busy.current = true;
    try {
      const result = await actions.save.mutateAsync({
        input: parsed.data,
        id: goal?.id,
      });
      dirty.current = false;
      void showToast({ title: copy.saved, intent: 'success' });
      router.replace(`/goals/${result.id}` as Route);
    } catch (failure) {
      setError(failure);
    } finally {
      busy.current = false;
    }
  }
  return (
    <Card>
      <form
        noValidate
        onSubmit={(event) => void submit(event)}
        className="grid gap-6"
      >
        <Field labelText={copy.child}>
          <Select
            name="child_id"
            value={input.child_id}
            disabled={isBusy || media.rows.length > 0}
            onValueChange={(value) => change('child_id', value)}
          >
            <option value={noSelection}>{copy.chooseChild}</option>
            {childrenProfiles.map((child) => (
              <option key={child.id} value={child.id}>
                {child.name}
              </option>
            ))}
          </Select>
        </Field>
        {media.rows.length > 0 && (
          <p className="m-0 text-sm text-tertiary">{copy.childLocked}</p>
        )}
        <Field labelText={copy.titleLabel}>
          <Input
            ref={titleRef}
            name="title"
            value={input.title}
            maxLength={160}
            required
            disabled={actions.save.isPending}
            onChange={(event) => change('title', event.target.value)}
          />
        </Field>
        <Field labelText={copy.descriptionLabel}>
          <TextArea
            name="description"
            value={input.description}
            maxLength={20000}
            disabled={actions.save.isPending}
            onChange={(event) => change('description', event.target.value)}
          />
        </Field>
        <Field labelText={copy.status}>
          <Select
            name="status"
            value={input.status}
            disabled={actions.save.isPending}
            onValueChange={(value) =>
              change('status', GoalStatusSchema.parse(value))
            }
          >
            {GoalStatusSchema.options.map((status) => (
              <option key={status} value={status}>
                {goalStatusLabel(status)}
              </option>
            ))}
          </Select>
        </Field>
        <section className="grid gap-4" aria-label={copy.attachments}>
          <div>
            <h2 className="font-display text-xl">{copy.attachments}</h2>
            <p className="text-sm text-secondary">{copy.attachmentHelp}</p>
          </div>
          <FileInput
            ref={files}
            multiple
            accept=".jpg,.jpeg,.png,.webp,.pdf,.mp4,.mov,image/jpeg,image/png,image/webp,application/pdf,video/mp4,video/quicktime"
            disabled={isBusy || !input.child_id || media.rows.length >= 10}
            onChange={(event) => {
              const selected = Array.from(event.target.files ?? []);
              event.target.value = '';
              void media.add(selected, input.child_id);
            }}
          />
          <Button
            type="button"
            variant="secondary"
            disabled={isBusy || !input.child_id || media.rows.length >= 10}
            onClick={() => files.current?.click()}
          >
            {copy.addFiles}
          </Button>
          <MutationError error={media.error} />
          {media.rows.length > 0 && (
            <ReorderableList
              items={media.rows}
              disabled={isBusy}
              label={copy.attachments}
              handleLabel={() => copy.reorder}
              upLabel={() => copy.moveUp}
              downLabel={() => copy.moveDown}
              onMove={media.move}
              renderItem={(row, _index, controls, handle) => (
                <div className="flex flex-wrap items-center gap-3 p-3">
                  {handle}
                  <div className="min-w-0 flex-1">
                    <p className="m-0 wrap-anywhere text-sm">
                      {row.media?.original_file_name ?? row.file?.name}
                    </p>
                    <p className="m-0 text-xs text-tertiary">
                      {copy.fileSize(
                        row.media?.size_bytes ?? row.file?.size ?? 0,
                      )}
                    </p>
                    {row.status === 'uploading' && (
                      <div role="status" aria-live="polite">
                        <progress
                          value={row.progress}
                          max={100}
                          className="w-full"
                          aria-label={copy.uploading}
                        />
                        <span className="text-xs">
                          {row.progress === 100
                            ? copy.verifying
                            : copy.progress(row.progress)}
                        </span>
                      </div>
                    )}
                    {row.status === 'failed' && (
                      <p role="alert" className="text-sm text-error-primary">
                        {copy.uploadFailed}
                      </p>
                    )}
                  </div>
                  {controls}
                  {row.status === 'uploading' && (
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => media.cancel(row.id)}
                    >
                      {copy.cancelUpload}
                    </Button>
                  )}
                  {row.status === 'failed' && (
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => void media.upload(row, input.child_id)}
                      disabled={media.busy}
                    >
                      {copy.retryUpload}
                    </Button>
                  )}
                  <Button
                    type="button"
                    variant="destructive"
                    disabled={actions.save.isPending}
                    onClick={() => {
                      if (row.media?.id === input.cover_media_id)
                        change('cover_media_id', null);
                      media.remove(row);
                    }}
                  >
                    {copy.removeFile}
                  </Button>
                </div>
              )}
            />
          )}
          <Field labelText={copy.cover}>
            <Select
              value={input.cover_media_id ?? ''}
              disabled={isBusy}
              onValueChange={(value) => change('cover_media_id', value || null)}
            >
              <option value={noSelection}>{copy.noCover}</option>
              {media.rows
                .filter((row) => row.media?.mime_type.startsWith('image/'))
                .map((row) => (
                  <option key={row.media!.id} value={row.media!.id}>
                    {row.media!.original_file_name}
                  </option>
                ))}
            </Select>
          </Field>
        </section>
        <MutationError error={error} />
        <div className="flex flex-wrap items-center justify-end gap-3">
          <NavigationLink
            href={goal ? `/goals/${goal.id}` : '/goals'}
            beforeNavigate={() => confirmLeave()}
            className={buttonClassName('secondary')}
          >
            {copy.cancel}
          </NavigationLink>
          <Button
            type="submit"
            loading={actions.save.isPending}
            disabled={
              media.busy || media.rows.some((row) => row.status === 'failed')
            }
          >
            {copy.save}
          </Button>
        </div>
      </form>
    </Card>
  );
}
