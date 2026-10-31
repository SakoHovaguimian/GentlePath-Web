import { useId, useRef, useState, type FormEvent } from 'react';
import {
  BookmarkButton,
  Button,
  Card,
  Field,
  Modal,
  TextArea,
  SuccessCelebration,
  UiIcon,
} from '@/components/ui';
import { useUnsavedFormGuard } from '@/providers/useUnsavedFormGuard';
import { usePresentationService } from '@/presentation/PresentationProvider';
import { MutationError } from '@/modules/portal/components/MutationError';
import {
  gentlePathPollStrings as copy,
  gentlePathCommunityStrings as communityCopy,
} from '@/strings';
import {
  PollCommentInputSchema,
  type PollComment,
} from '../models/pollComment';
import { useSavePollComment } from '../hooks';
import { usePollCommentActions } from '../usePollCommentActions';

export function PollCommentEditor({
  pollId,
  parentCommentId,
  comment,
  writable,
  onClose,
  onSaved,
  onDeleted,
}: {
  pollId: string;
  parentCommentId?: string;
  comment?: PollComment;
  writable: boolean;
  onClose?: () => void;
  onSaved: () => void;
  onDeleted?: () => void;
}) {
  const [body, setBody] = useState(comment?.body ?? '');
  const [validation, setValidation] = useState('');
  const dirty = useRef(false);
  const busy = useRef(false);
  const confirmLeave = useUnsavedFormGuard(dirty, busy);
  const mutation = useSavePollComment();
  const [celebration, setCelebration] = useState(0);
  const remove = usePollCommentActions(() => {
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
    if (busy.current || !writable || remove.isPending) return;
    const input = PollCommentInputSchema.safeParse({
      body,
      ...(!comment && parentCommentId ? { parentCommentId } : {}),
    });
    if (!input.success) {
      setValidation(copy.validation.commentDescription);
      event.currentTarget.querySelector<HTMLElement>('[name="body"]')?.focus();
      return;
    }
    busy.current = true;
    try {
      await mutation.mutateAsync({
        pollId,
        input: input.data,
        id: comment?.id,
      });
      dirty.current = false;
      if (!comment) setCelebration((current) => current + 1);
      setBody('');
      void showToast({
        title:
          parentCommentId && !comment
            ? communityCopy.replyPosted
            : copy.commentSaved,
        intent: 'success',
      });
      onSaved();
      onClose?.();
    } catch {
      /* Keep the comment draft. */
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
          disabled={mutation.isPending || !writable}
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
        disabled={!writable || remove.isPending}
      >
        {comment
          ? copy.save
          : parentCommentId
            ? communityCopy.postReply
            : copy.postComment}
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
      <Field
        labelText={
          parentCommentId ? communityCopy.replyLabel : copy.commentLabel
        }
      >
        <TextArea
          name="body"
          maxLength={20000}
          value={body}
          placeholder={
            parentCommentId
              ? communityCopy.replyPlaceholder
              : copy.commentPlaceholder
          }
          disabled={pending || !writable}
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
      title={comment ? copy.editComment : communityCopy.reply}
      description={
        parentCommentId && !comment
          ? communityCopy.replyDescription
          : copy.discussionDescription
      }
      onDismiss={close}
      footer={actions}
    >
      {form}
    </Modal>
  ) : (
    <Card>{form}</Card>
  );
}
