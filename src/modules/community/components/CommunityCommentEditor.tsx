import { useId, useRef, useState, type FormEvent } from 'react';
import {
  BookmarkButton,
  Button,
  Card,
  Field,
  Modal,
  TextArea,
  UiIcon,
  SuccessCelebration,
} from '@/components/ui';
import { useUnsavedFormGuard } from '@/providers/useUnsavedFormGuard';
import { usePresentationService } from '@/presentation/PresentationProvider';
import { MutationError } from '@/modules/portal/components/MutationError';
import { gentlePathCommunityStrings as copy } from '@/strings';
import {
  CommunityCommentInputSchema,
  type CommunityComment,
} from '../models/communityComment';
import { useSaveCommunityComment } from '../hooks';
import { useCommunityCommentActions } from '../useCommunityCommentActions';

interface CommunityCommentEditorProps {
  postId: string;
  parentCommentId?: string;
  comment?: CommunityComment;
  onClose?: () => void;
  onSaved: () => void;
  onDeleted?: () => void;
  disabled?: boolean;
}
export function CommunityCommentEditor({
  postId,
  parentCommentId,
  comment,
  onClose,
  onSaved,
  onDeleted,
  disabled = false,
}: CommunityCommentEditorProps) {
  const [body, setBody] = useState(comment?.body ?? '');
  const [validation, setValidation] = useState('');
  const dirty = useRef(false);
  const busy = useRef(false);
  const confirmLeave = useUnsavedFormGuard(dirty, busy);
  const mutation = useSaveCommunityComment();
  const [celebration, setCelebration] = useState(0);
  const remove = useCommunityCommentActions(() => {
    dirty.current = false;
    onDeleted?.();
    onClose?.();
  });
  const pending = mutation.isPending || remove.isPending;
  const { showToast } = usePresentationService();
  const errorId = useId();
  function close() {
    void confirmLeave().then((allowed) => {
      if (!allowed) return;
      dirty.current = false;
      if (onClose) onClose();
      else {
        setBody('');
        setValidation('');
        mutation.reset();
      }
    });
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy.current || disabled || remove.isPending) return;
    const parsed = CommunityCommentInputSchema.safeParse({
      body,
      ...(!comment && parentCommentId ? { parentCommentId } : {}),
    });
    if (!parsed.success) {
      setValidation(copy.validation.comment);
      event.currentTarget.querySelector<HTMLElement>('[name="body"]')?.focus();
      return;
    }
    busy.current = true;
    try {
      await mutation.mutateAsync({
        postId,
        input: parsed.data,
        id: comment?.id,
      });
      dirty.current = false;
      if (!comment) setCelebration((current) => current + 1);
      setBody('');
      void showToast({
        title: comment
          ? copy.updatedComment
          : parentCommentId
            ? copy.replyPosted
            : copy.createdComment,
        intent: 'success',
      });
      onSaved();
      onClose?.();
    } catch {
      /* The comment stays in the form for retry. */
    } finally {
      busy.current = false;
    }
  }
  const formId = `${errorId}-form`;
  const inModal = Boolean(comment || parentCommentId);
  const actions = (
    <div className="flex flex-wrap justify-end gap-3">
      {comment && (
        <Button
          variant="destructive"
          className="mr-auto"
          loading={remove.isPending}
          disabled={mutation.isPending || disabled}
          onClick={() => {
            void remove.deleteComment(comment);
          }}
        >
          <UiIcon name="trash" className="size-4" />
          {copy.deleteComment}
        </Button>
      )}
      {(comment || body || onClose) && (
        <Button variant="secondary" disabled={pending} onClick={close}>
          {copy.cancel}
        </Button>
      )}
      <BookmarkButton
        type="submit"
        form={formId}
        loading={mutation.isPending}
        disabled={disabled || remove.isPending}
      >
        {comment
          ? copy.saveComment
          : parentCommentId
            ? copy.postReply
            : copy.publishComment}
      </BookmarkButton>
    </div>
  );
  const form = (
    <form
      id={formId}
      noValidate
      onSubmit={submit}
      className="relative grid gap-4"
    >
      <SuccessCelebration sequence={celebration} />
      <Field labelText={parentCommentId ? copy.replyLabel : copy.commentLabel}>
        <TextArea
          name="body"
          maxLength={20000}
          value={body}
          placeholder={
            parentCommentId ? copy.replyPlaceholder : copy.commentPlaceholder
          }
          disabled={pending || disabled}
          aria-invalid={Boolean(validation)}
          aria-describedby={validation ? errorId : undefined}
          onChange={(event) => {
            dirty.current = true;
            setBody(event.target.value);
            setValidation('');
          }}
        />
      </Field>
      {validation && (
        <p id={errorId} role="alert" className="m-0 text-sm text-error-primary">
          {validation}
        </p>
      )}
      <MutationError error={mutation.error ?? remove.error} />
      {!inModal && actions}
    </form>
  );
  return comment || parentCommentId ? (
    <Modal
      open
      title={comment ? copy.editComment : copy.reply}
      description={
        parentCommentId && !comment
          ? copy.replyDescription
          : copy.editCommentDescription
      }
      onDismiss={close}
      footer={actions}
    >
      {form}
    </Modal>
  ) : (
    <Card className="p-5 sm:p-6">{form}</Card>
  );
}
