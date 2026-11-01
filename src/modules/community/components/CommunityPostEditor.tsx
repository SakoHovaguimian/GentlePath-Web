import { useId, useRef, useState, type FormEvent } from 'react';
import {
  BookmarkButton,
  Button,
  Field,
  Input,
  InlineLoading,
  Modal,
  Select,
  TextArea,
  UiIcon,
} from '@/components/ui';
import { useUnsavedFormGuard } from '@/providers/useUnsavedFormGuard';
import { usePresentationService } from '@/presentation/PresentationProvider';
import { MutationError } from '@/modules/portal/components/MutationError';
import {
  addressCountries,
  gentlePathCommunityDiscoveryStrings as discovery,
  gentlePathCommunityStrings as copy,
  strings,
} from '@/strings';
import { useChildren } from '@/modules/portal/hooks';
import { useNotificationSettings } from '@/modules/notification-inbox/hooks';
import { useFamilyPreferences } from '@/modules/onboarding/hooks';
import { MilestoneLinksField } from '@/modules/milestone-admin/components/MilestoneLinksField';
import { useSessionState } from '@/providers/AppProviders';
import { childAgeBand } from '../models/ageBand';
import { PostKindSchema, type PostKind } from '../models/postKind';
import {
  CommunityPostInputSchema,
  type CommunityPost,
} from '../models/communityPost';
import { useSaveCommunityPost } from '../hooks';
import { useCommunityPostActions } from '../useCommunityPostActions';
import type { CommunityAttachment } from '../models/communityAttachment';
import { CommunityAttachmentsEditor } from './CommunityAttachmentsEditor';

const noChildValue = '';

interface CommunityPostEditorProps {
  post?: CommunityPost;
  initialTitle?: string;
  initialChildId?: string;
  initialKind?: PostKind;
  initialMilestoneIds?: string[];
  writable: boolean;
  onClose: () => void;
  onDeleted?: () => void;
}
export function CommunityPostEditor({
  post,
  initialTitle = '',
  initialChildId = '',
  initialKind = 'DISCUSSION',
  initialMilestoneIds = [],
  writable,
  onClose,
  onDeleted,
}: CommunityPostEditorProps) {
  const formId = useId();
  const [title, setTitle] = useState(post?.title ?? initialTitle);
  const [postKind, setPostKind] = useState<PostKind>(
    post?.postKind ?? initialKind,
  );
  const [milestoneIds, setMilestoneIds] = useState(
    post?.milestoneIds ?? initialMilestoneIds,
  );
  const [childId, setChildId] = useState(initialChildId);
  const [contextChanged, setContextChanged] = useState(false);
  const [checkingContext, setCheckingContext] = useState(false);
  const { session } = useSessionState();
  const children = useChildren();
  const preferences = useFamilyPreferences();
  const timezone = useNotificationSettings();
  const child = children.data?.find((item) => item.id === childId);
  const stateCode = post
    ? post.stateCode
    : (preferences.data?.state_code ?? null);
  const ageBand = post
    ? post.ageBand
    : child
      ? childAgeBand(
          child.dateOfBirth,
          timezone.data?.effectiveTimezone ?? 'UTC',
        )
      : null;
  const contextKey = `${preferences.data?.user_id ?? session?.user.id ?? ''}:${stateCode ?? ''}:${ageBand ?? ''}:${childId}:${timezone.data?.effectiveTimezone ?? ''}`;
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
  const pending = mutation.isPending || remove.isPending || checkingContext;
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
      postKind,
      milestoneIds,
      ...(!post && childId ? { childId } : {}),
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
      if (!post) {
        setCheckingContext(true);
        const [freshChildren, freshPreferences, freshTimezone] =
          await Promise.all([
            children.refetch(),
            preferences.refetch(),
            timezone.refetch(),
          ]);
        if (
          freshChildren.error ||
          freshPreferences.error ||
          freshTimezone.error
        )
          return;
        const freshChild = freshChildren.data?.find(
          (item) => item.id === childId,
        );
        const freshKey = `${freshPreferences.data?.user_id ?? ''}:${freshPreferences.data?.state_code ?? ''}:${freshChild ? childAgeBand(freshChild.dateOfBirth, freshTimezone.data?.effectiveTimezone ?? 'UTC') : ''}:${freshChild ? childId : ''}:${freshTimezone.data?.effectiveTimezone ?? ''}`;
        if (freshKey !== contextKey) {
          if (childId && !freshChild) setChildId('');
          setContextChanged(true);
          return;
        }
      }
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
      setCheckingContext(false);
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
            loading={mutation.isPending || checkingContext}
            disabled={
              remove.isPending ||
              !writable ||
              (!post && (!preferences.data || !children.data || !timezone.data))
            }
          >
            {post ? copy.savePost : copy.publish}
          </BookmarkButton>
        </div>
      }
    >
      <form id={formId} noValidate onSubmit={submit} className="grid gap-5">
        <Field labelText={discovery.postKind}>
          <Select
            value={postKind}
            disabled={pending || !writable}
            onValueChange={(value) => {
              dirty.current = true;
              setPostKind(PostKindSchema.parse(value));
            }}
          >
            {PostKindSchema.options.map((kind) => (
              <option key={kind} value={kind}>
                {discovery.kinds[kind]}
              </option>
            ))}
          </Select>
        </Field>
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
        <MilestoneLinksField
          value={milestoneIds}
          disabled={pending || !writable}
          onChange={(value) => {
            dirty.current = true;
            setMilestoneIds(value);
          }}
        />
        {!post && (
          <Field labelText={discovery.child}>
            <Select
              value={childId}
              disabled={pending || !children.data}
              onValueChange={(value) => {
                dirty.current = true;
                setChildId(value);
                setContextChanged(false);
              }}
            >
              <option value={noChildValue}>{discovery.noChild}</option>
              {(children.data ?? []).map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </Select>
          </Field>
        )}
        {post || (children.data && preferences.data && timezone.data) ? (
          <div
            className="grid gap-2 rounded-lg border border-secondary bg-secondary_subtle p-4"
            aria-live="polite"
          >
            <h3 className="m-0 text-sm font-semibold text-primary">
              {discovery.contextTitle}
            </h3>
            <p className="m-0 text-sm text-secondary">
              {post ? discovery.preservedContext : discovery.contextHint}
            </p>
            <p className="m-0 text-sm text-secondary">
              {stateCode
                ? (addressCountries
                    .find((country) => country.code === 'US')
                    ?.regions.find((state) => state.code === stateCode)?.name ??
                  stateCode)
                : discovery.noState}
            </p>
            <p className="m-0 text-sm text-secondary">
              {ageBand ? discovery.ages[ageBand] : discovery.noAge}
            </p>
            {contextChanged && (
              <p role="status" className="m-0 text-sm text-secondary">
                {discovery.contextChanged}
              </p>
            )}
          </div>
        ) : !(children.error || preferences.error || timezone.error) ? (
          <InlineLoading message={discovery.contextLoadingDescription} />
        ) : null}
        <MutationError
          error={children.error ?? preferences.error ?? timezone.error}
        />
        {(children.error || preferences.error || timezone.error) && (
          <Button
            variant="secondary"
            loading={checkingContext}
            onClick={() => {
              setCheckingContext(true);
              void Promise.all([
                children.refetch(),
                preferences.refetch(),
              ]).finally(() => setCheckingContext(false));
            }}
          >
            {strings.ui.queryBoundary.tryAgain}
          </Button>
        )}
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
