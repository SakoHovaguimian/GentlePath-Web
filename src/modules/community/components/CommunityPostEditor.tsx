import { useRef, useState, type FormEvent } from 'react';
import { Button, Field, Input, Modal, TextArea } from '@/components/ui';
import { useUnsavedFormGuard } from '@/providers/useUnsavedFormGuard';
import { usePresentationService } from '@/presentation/PresentationProvider';
import { MutationError } from '@/modules/portal/components/MutationError';
import { gentlePathCommunityStrings as copy } from '@/strings';
import {
  CommunityPostInputSchema,
  type CommunityPost,
} from '../models/communityPost';
import { useSaveCommunityPost } from '../hooks';

interface CommunityPostEditorProps {
  post?: CommunityPost;
  onClose: () => void;
}
export function CommunityPostEditor({
  post,
  onClose,
}: CommunityPostEditorProps) {
  const [title, setTitle] = useState(post?.title ?? '');
  const [body, setBody] = useState(post?.body ?? '');
  const [tags, setTags] = useState(post?.tags.join(', ') ?? '');
  const [imageUrl, setImageUrl] = useState(post?.imageUrl ?? '');
  const [validation, setValidation] = useState<Record<string, string>>({});
  const dirty = useRef(false);
  const busy = useRef(false);
  const confirmLeave = useUnsavedFormGuard(dirty, busy);
  const mutation = useSaveCommunityPost();
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
    if (busy.current) return;
    const parsed = CommunityPostInputSchema.safeParse({
      title,
      body,
      tags: tags
        .split(',')
        .map((value) => value.trim())
        .filter(Boolean),
      imageUrl: imageUrl.trim() || null,
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
      event.currentTarget
        .querySelector<HTMLElement>(
          `[name="${String(parsed.error.issues[0].path[0])}"]`,
        )
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
    >
      <form noValidate onSubmit={submit} className="grid gap-5">
        <Field labelText={copy.titleLabel}>
          <Input
            name="title"
            value={title}
            maxLength={500}
            placeholder={copy.titlePlaceholder}
            disabled={mutation.isPending}
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
            rows={8}
            value={body}
            maxLength={20000}
            placeholder={copy.bodyPlaceholder}
            disabled={mutation.isPending}
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
              disabled={mutation.isPending}
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
        <div className="grid gap-2">
          <Field labelText={copy.imageLabel}>
            <Input
              name="imageUrl"
              type="url"
              value={imageUrl}
              maxLength={1000}
              placeholder={copy.imagePlaceholder}
              disabled={mutation.isPending}
              aria-invalid={Boolean(validation.imageUrl)}
              aria-describedby={
                validation.imageUrl
                  ? 'community-post-validation community-image-hint'
                  : 'community-image-hint'
              }
              onChange={(event) =>
                change('imageUrl', setImageUrl, event.target.value)
              }
            />
          </Field>
          <p id="community-image-hint" className="m-0 text-xs text-tertiary">
            {copy.imageHint}
          </p>
        </div>
        {Object.values(validation).some(Boolean) && (
          <p
            id="community-post-validation"
            role="alert"
            className="m-0 text-sm text-error-primary"
          >
            {Object.values(validation).filter(Boolean).join(' ')}
          </p>
        )}
        <MutationError error={mutation.error} />
        <div className="flex flex-wrap justify-end gap-3 border-t border-secondary pt-5">
          <Button
            variant="secondary"
            disabled={mutation.isPending}
            onClick={close}
          >
            {copy.cancel}
          </Button>
          <Button type="submit" loading={mutation.isPending}>
            {post ? copy.savePost : copy.publish}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
