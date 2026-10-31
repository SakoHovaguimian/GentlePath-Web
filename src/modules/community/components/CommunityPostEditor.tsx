import { useId, useRef, useState, type FormEvent } from 'react';
import {
  BookmarkButton,
  Button,
  Field,
  Input,
  Modal,
  TextArea,
  UiIcon,
} from '@/components/ui';
import { useUnsavedFormGuard } from '@/providers/useUnsavedFormGuard';
import { usePresentationService } from '@/presentation/PresentationProvider';
import { MutationError } from '@/modules/portal/components/MutationError';
import { gentlePathCommunityStrings as copy } from '@/strings';
import {
  CommunityPostInputSchema,
  type CommunityPost,
} from '../models/communityPost';
import { useSaveCommunityPost } from '../hooks';
import { useCommunityPostActions } from '../useCommunityPostActions';
import type { CommunityAttachment } from '../models/communityAttachment';
import { CommunityAttachmentsEditor } from './CommunityAttachmentsEditor';

interface CommunityPostEditorProps {
  post?: CommunityPost;
  writable: boolean;
  onClose: () => void;
  onDeleted?: () => void;
}
export function CommunityPostEditor({
  post,
  writable,
  onClose,
  onDeleted,
}: CommunityPostEditorProps) {
  const formId = useId();
  const [title, setTitle] = useState(post?.title ?? '');
  const [body, setBody] = useState(post?.body ?? '');
  const [tags, setTags] = useState(post?.tags.join(', ') ?? '');
  const [attachments, setAttachments] = useState<CommunityAttachment[]>(
    post?.attachments ?? [],
  );
  const [validation, setValidation] = useState<Record<string, string>>({});
  const dirty = useRef(false);
  const busy = useRef(false);
  const confirmLeave = useUnsavedFormGuard(dirty, busy);
  const mutation = useSaveCommunityPost();
  const remove = useCommunityPostActions(() => {
    dirty.current = false;
    onClose();
    onDeleted?.();
  });
  const pending = mutation.isPending || remove.isPending;
  const { showToast } = usePresentationService();
  function change(key: string, update: (value: string) => void, value: string) {
    dirty.current = true;
    update(value);
    setValidation((current) => ({ ...current, [key]: '' }));
  }
  function close() {
    void confirmLeave().then((allowed) => {
      if (allowed) onClose();
    });
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy.current || !writable || remove.isPending) return;
    const parsed = CommunityPostInputSchema.safeParse({
      title,
      body,
      tags: tags
        .split(',')
        .map((value) => value.trim())
        .filter(Boolean),
      imageUrl: attachments.find((item) => item.kind === 'IMAGE')?.url ?? null,
      attachments,
    });
    if (!parsed.success) {
      setValidation(
        Object.fromEntries(
          parsed.error.issues.map((issue) => [
            String(issue.path[0]),
            issue.message,
          ]),
        ),
      );
      const path = parsed.error.issues[0].path;
      const name =
        path[0] === 'attachments'
          ? `attachment-${path[2] === 'description' ? 'description' : 'url'}-${typeof path[1] === 'number' ? path[1] : 0}`
          : String(path[0]);
      event.currentTarget
        .querySelector<HTMLElement>(`[name="${name}"]`)
        ?.focus();
      return;
    }
    busy.current = true;
    try {
      await mutation.mutateAsync({ input: parsed.data, id: post?.id });
      dirty.current = false;
      void showToast({
        title: post ? copy.updatedPost : copy.createdPost,
        intent: 'success',
      });
      onClose();
    } catch {
      /* The draft remains in the form. */
    } finally {
      busy.current = false;
    }
  }
  return (
    <Modal
      open
      title={post ? copy.editPost : copy.newPostTitle}
      description={copy.postFormDescription}
      onDismiss={close}

      footer={
        <div className="flex flex-wrap justify-end gap-3">
          {post && (
            <Button
              variant="destructive"
              className="mr-auto"
              loading={remove.isPending}
              disabled={mutation.isPending || !writable}
              onClick={() => {
                void remove.deletePost(post);
              }}
            >
              <UiIcon name="trash" className="size-4" />
              {copy.deletePost}
            </Button>
          )}
          <Button variant="secondary" disabled={pending} onClick={close}>
            {copy.cancel}
          </Button>
          <BookmarkButton
            type="submit"
            form={formId}
            loading={mutation.isPending}
            disabled={remove.isPending || !writable}
          >
            {post ? copy.savePost : copy.publish}
          </BookmarkButton>
        </div>
      }
    >
      <form id={formId} noValidate onSubmit={submit} className="grid gap-5">
        <Field labelText={copy.titleLabel}>
          <Input
            name="title"
            value={title}
            maxLength={500}
            placeholder={copy.titlePlaceholder}
            disabled={pending || !writable}
            aria-invalid={Boolean(validation.title)}
            aria-describedby={
              validation.title ? 'community-post-validation' : undefined
            }
            onChange={(event) => change('title', setTitle, event.target.value)}
          />
        </Field>
        <Field labelText={copy.bodyLabel}>
          <TextArea
            name="body"
            value={body}
            maxLength={20000}
            placeholder={copy.bodyPlaceholder}
            disabled={pending || !writable}
            aria-invalid={Boolean(validation.body)}
            aria-describedby={
              validation.body ? 'community-post-validation' : undefined
            }
            onChange={(event) => change('body', setBody, event.target.value)}
          />
        </Field>
        <div className="grid gap-2">
          <Field labelText={copy.tagsLabel}>
            <Input
              name="tags"
              value={tags}
              maxLength={3030}
              placeholder={copy.tagsPlaceholder}
              disabled={pending || !writable}
              aria-invalid={Boolean(validation.tags)}
              aria-describedby={
                validation.tags
                  ? 'community-post-validation community-tags-hint'
                  : 'community-tags-hint'
              }
              onChange={(event) => change('tags', setTags, event.target.value)}
            />
          </Field>
          <p id="community-tags-hint" className="m-0 text-xs text-tertiary">
            {copy.tagsHint}
          </p>
        </div>
        <CommunityAttachmentsEditor
          value={attachments}
          disabled={pending || !writable}
          error={validation.attachments}
          onChange={(value) => {
            dirty.current = true;
            setAttachments(value);
            setValidation((current) => ({ ...current, attachments: '' }));
          }}
        />
        {Object.values(validation).some(Boolean) && (
          <p
            id="community-post-validation"
            role="alert"
            className="m-0 text-sm text-error-primary"
          >
            {Object.values(validation).filter(Boolean).join(' ')}
          </p>
        )}
        <MutationError error={mutation.error ?? remove.error} />
      </form>
    </Modal>
  );
}
