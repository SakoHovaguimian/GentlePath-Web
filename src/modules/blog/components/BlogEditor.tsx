'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Badge,
  Button,
  Field,
  FormActions,
  MarkdownEditor,
  Message,
  Modal,
  Page,
  PageHeader,
  SectionStack,
  SplitSection,
  UiIcon,
} from '@/components/ui';
import {
  gentlePathBlogStrings as copy,
  gentlePathBlogBuilderStrings as builderCopy,
} from '@/strings';
import { BlogContentBuilder } from './builder/BlogContentBuilder';
import { usePresentationService } from '@/presentation/PresentationProvider';
import { useSessionState } from '@/providers/AppProviders';
import { useUnsavedFormGuard } from '@/providers/useUnsavedFormGuard';
import { useGuardedNavigate } from '@/providers/useGuardedNavigate';
import { DomainError } from '@/errors/domainErrors';
import {
  BlogMutationInputSchema,
  type BlogArticle,
  type BlogMutationInput,
} from '../models/blogArticle';
import type { BlogFormErrors } from '../models/blogFormErrors';
import { useBlogMutations } from '../hooks';
import { BlogArticleFields } from './BlogArticleFields';
import { BlogArticleReader } from './BlogArticleReader';
import styles from '../Blog.module.css';
import adminStyles from '../../portal/Admin.module.css';

const empty = '';
const articleInput = (article: BlogArticle): BlogMutationInput => ({
  title: article.title,
  slug: article.slug,
  description: article.description,
  body: article.body,
  content: article.content,
  category: article.category,
  cover: article.cover,
  author: article.author,
  revision: article.revision,
});
export function BlogEditor({
  initialArticle,
}: {
  initialArticle?: BlogArticle;
}) {
  const router = useRouter();
  const navigate = useGuardedNavigate();
  const presentation = usePresentationService();
  const { session } = useSessionState();
  const mutations = useBlogMutations();
  const [article, setArticle] = useState(initialArticle);
  const [form, setForm] = useState<BlogMutationInput>(() =>
    initialArticle
      ? articleInput(initialArticle)
      : {
          title: empty,
          slug: '',
          description: empty,
          body: '',
          content: [],
          author: session?.user.firstName
            ? `${session.user.firstName} ${session.user.lastName}`.trim()
            : copy.defaultAuthor,
          category: 'family',
          cover: 'family',
        },
  );
  const [baseline, setBaseline] = useState(() => JSON.stringify(form));
  const [errors, setErrors] = useState<BlogFormErrors>({});
  const [failure, setFailure] = useState('');
  const [notice, setNotice] = useState('');
  const [previewOpen, setPreviewOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [uploading, setUploading] = useState(false);
  const dirty = JSON.stringify(form) !== baseline;
  const dirtyRef = useRef(dirty);
  const busyRef = useRef(false);
  const busy = mutations.isPending || confirming || uploading;
  useEffect(() => {
    dirtyRef.current = dirty;
    busyRef.current = busy;
  }, [dirty, busy]);
  useUnsavedFormGuard(dirtyRef, busyRef, copy.discardDescription);

  const updateForm = (next: BlogMutationInput) => {
    dirtyRef.current = JSON.stringify(next) !== baseline;
    setForm(next);
    setNotice('');
  };
  const acceptArticle = (saved: BlogArticle) => {
    const next = articleInput(saved);
    setArticle(saved);
    setForm(next);
    setBaseline(JSON.stringify(next));
    dirtyRef.current = false;
    setErrors({});
    setFailure('');
  };
  const validate = () => {
    const result = BlogMutationInputSchema.safeParse(form);
    if (result.success) {
      setErrors({});
      return result.data;
    }
    const next: BlogFormErrors = {};
    for (const issue of result.error.issues) {
      const key = issue.path[0] as keyof BlogMutationInput;
      next[key] = issue.message;
    }
    setErrors(next);
    setFailure('');
    queueMicrotask(() => {
      const first = result.error.issues[0];
      const block =
        first?.path[0] === 'content' && typeof first.path[1] === 'number'
          ? form.content[first.path[1]]
          : undefined;
      const target = document.getElementById(
        block ? `blog-block-${block.id}` : `blog-${Object.keys(next)[0]}`,
      );
      (
        (target?.querySelector(
          'input, textarea, button',
        ) as HTMLElement | null) || target
      )?.focus();
    });
    return null;
  };
  const displayError = (error: unknown) =>
    setFailure(
      error instanceof DomainError
        ? error.message
        : copy.mutationErrorDescription,
    );
  const persist = async (): Promise<BlogArticle | null> => {
    const input = validate();
    if (!input) return null;
    setFailure('');
    setNotice('');
    try {
      const saved = await mutations.save.mutateAsync({
        id: article?.id,
        input,
      });
      acceptArticle(saved);
      return saved;
    } catch (error) {
      displayError(error);
      return null;
    }
  };
  const save = async () => {
    if (busy) return;
    const saved = await persist();
    if (!saved) return;
    setNotice(copy.savedDescription);
    void presentation.showToast({
      title: copy.savedTitle,
      description: copy.savedDescription,
      intent: 'success',
    });
    if (!article) router.replace(`/admin/blog/${saved.id}`);
  };
  const changePublication = async () => {
    if (busy || !validate()) return;
    const publishing = article?.status !== 'published';
    setConfirming(true);
    try {
      const confirmed = await presentation.showAlert({
        title: publishing
          ? copy.publishConfirmTitle
          : copy.unpublishConfirmTitle,
        description: publishing
          ? copy.publishConfirmDescription(form.title)
          : copy.unpublishConfirmDescription(form.title),
        confirmLabel: publishing ? copy.publish : copy.unpublish,
        cancelLabel: copy.keepWriting,
        tone: publishing ? 'info' : 'warning',
      });
      if (!confirmed) return;
      const saved = dirty || !article ? await persist() : article;
      if (!saved) return;
      const updated = await mutations.publication.mutateAsync({
        id: saved.id,
        revision: saved.revision,
        published: publishing,
      });
      acceptArticle(updated);
      setNotice(
        publishing ? copy.publishedDescription : copy.unpublishedDescription,
      );
      void presentation.showToast({
        title: publishing ? copy.publishedTitle : copy.unpublishedTitle,
        description: publishing
          ? copy.publishedDescription
          : copy.unpublishedDescription,
        intent: 'success',
      });
      if (!article) router.replace(`/admin/blog/${updated.id}`);
    } catch (error) {
      displayError(error);
    } finally {
      setConfirming(false);
    }
  };
  const remove = async () => {
    if (busy || !article) return;
    setConfirming(true);
    try {
      const confirmed = await presentation.showAlert({
        title: copy.deleteConfirmTitle,
        description: copy.deleteConfirmDescription(article.title),
        confirmLabel: copy.delete,
        cancelLabel: copy.cancel,
        tone: 'danger',
      });
      if (!confirmed) return;
      await mutations.remove.mutateAsync({
        id: article.id,
        revision: article.revision,
      });
      dirtyRef.current = false;
      busyRef.current = false;
      void presentation.showToast({
        title: copy.deletedTitle,
        description: copy.deletedDescription,
        intent: 'success',
      });
      router.push('/admin/blog');
    } catch (error) {
      displayError(error);
    } finally {
      setConfirming(false);
    }
  };
  const previewArticle: BlogArticle = {
    ...form,
    id: article?.id || '00000000-0000-4000-8000-000000000000',
    createdAt: article?.createdAt || new Date().toISOString(),
    updatedAt: article?.updatedAt || new Date().toISOString(),
    publishedAt: article?.publishedAt || null,
    status: article?.status || 'draft',
    revision: article?.revision || 1,
  };
  return (
    <Page aria-busy={busy} className={adminStyles.editor}>
      <div className={adminStyles.intro} data-tone="lilac">
        <PageHeader
          title={article ? copy.editTitle : copy.newTitle}
          description={copy.formDescription}
          icon={
            <span className={adminStyles.roundIcon} data-tone="lilac">
              <UiIcon name="file" />
            </span>
          }
          onNavigate={(href) => void navigate(href)}
          breadcrumbs={[
            { label: copy.adminTitle, href: '/admin/blog' },
            { label: article ? copy.editTitle : copy.newTitle },
          ]}
          meta={
            <Badge
              intent={article?.status === 'published' ? 'success' : 'neutral'}
              dot
            >
              {copy.statuses[article?.status || 'draft']}
            </Badge>
          }
          action={
            <Button
              variant="secondary"
              disabled={busy}
              onClick={() => setPreviewOpen(true)}
            >
              <UiIcon name="file" />
              {copy.preview}
            </Button>
          }
        />
      </div>
      <form
        noValidate
        className="grid min-w-0 gap-8"
        onSubmit={(event) => {
          event.preventDefault();
          void save();
        }}
      >
        <SectionStack>
          <BlogArticleFields
            form={form}
            errors={errors}
            disabled={busy}
            onChangeAction={updateForm}
          />
          <SplitSection
            id="blog-story"
            title={builderCopy.title}
            description={builderCopy.description}
          >
            {form.content.length === 0 && form.body.trim() ? (
              <div className="grid gap-4">
                <Message
                  title={builderCopy.legacyTitle}
                  description={builderCopy.legacyDescription}
                />
                <Field labelText={copy.contentLabel}>
                  <MarkdownEditor
                    id="blog-body"
                    value={form.body}
                    maxLength={50000}
                    disabled={busy}
                    onValueChange={(body) => updateForm({ ...form, body })}
                  />
                </Field>
                <Button
                  variant="secondary"
                  disabled={busy}
                  onClick={() =>
                    updateForm({
                      ...form,
                      body: '',
                      content: [
                        {
                          id: crypto.randomUUID(),
                          contentType: 'section',
                          metaData: {
                            title: empty,
                            body: form.body,
                            format: 'markdown',
                          },
                        },
                      ],
                    })
                  }
                >
                  <UiIcon name="layers" />
                  {builderCopy.convert}
                </Button>
              </div>
            ) : (
              <BlogContentBuilder
                content={form.content}
                disabled={busy}
                showErrors={Boolean(errors.content)}
                onUploadStateChangeAction={setUploading}
                onChangeAction={(content) => updateForm({ ...form, content })}
              />
            )}
            {errors.content && (
              <p
                id="blog-content-error"
                role="alert"
                className="m-0 text-sm text-error-primary"
              >
                {errors.content}
              </p>
            )}
          </SplitSection>
        </SectionStack>
        {Object.keys(errors).length > 0 && (
          <Message title={copy.validationTitle} intent="danger" />
        )}
        {failure && (
          <Message
            title={copy.mutationErrorTitle}
            description={failure}
            intent="danger"
          />
        )}
        {notice && (
          <Message
            title={copy.savedTitle}
            description={notice}
            intent="success"
          />
        )}
        <FormActions
          description={
            dirty
              ? copy.unsavedHint
              : article?.status === 'published'
                ? copy.publishedHint
                : copy.draftHint
          }
          live
        >
          <Button
            variant="secondary"
            disabled={busy}
            onClick={() => void navigate('/admin/blog')}
          >
            {copy.backToArticles}
          </Button>
          <Button
            type="submit"
            variant="secondary"
            loading={mutations.save.isPending}
            disabled={busy}
          >
            {article?.status === 'published'
              ? copy.saveChanges
              : copy.saveDraft}
          </Button>
          <Button
            loading={mutations.publication.isPending}
            disabled={busy}
            onClick={() => void changePublication()}
          >
            {article?.status === 'published' ? copy.unpublish : copy.publish}
          </Button>
        </FormActions>
        {article && (
          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-secondary pt-5">
            <Button
              variant="destructive"
              loading={mutations.remove.isPending}
              disabled={busy}
              onClick={() => void remove()}
            >
              <UiIcon name="trash" />
              {copy.delete}
            </Button>
            {article.status === 'published' && (
              <Button
                variant="ghost"
                disabled={busy}
                onClick={() => void navigate(`/blog/${article.slug}`)}
              >
                {copy.openPublic}
                <UiIcon name="arrowRight" />
              </Button>
            )}
          </div>
        )}
      </form>
      <Modal
        open={previewOpen}
        title={copy.previewTitle}
        description={copy.previewDescription}
        onDismiss={() => setPreviewOpen(false)}
      >
        <div className={`gp-public ${styles.preview}`}>
          <BlogArticleReader article={previewArticle} preview />
        </div>
        <Button variant="secondary" onClick={() => setPreviewOpen(false)}>
          {copy.closePreview}
        </Button>
      </Modal>
    </Page>
  );
}
