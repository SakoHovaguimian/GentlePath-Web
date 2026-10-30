'use client';

import { useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Button,
  DirectoryFilters,
  DirectoryPagination,
  EmptyState,
  Field,
  InlineLoading,
  Page,
  PageHeader,
  QueryBoundary,
  Select,
  UiIcon,
} from '@/components/ui';
import { usePresentationService } from '@/presentation/PresentationProvider';
import { gentlePathDocumentStrings as copy } from '@/strings';
import { useChildren } from '@/modules/portal/hooks';
import { usePortalDirectory } from '@/modules/portal/usePortalDirectory';
import { MutationError } from '@/modules/portal/components/MutationError';
import { useDeleteDocument, useDocuments, useDownloadDocument } from './hooks';
import { DocumentTypeSchema } from './models/documentType';
import type { CareDocument } from './models/careDocument';
import { DocumentEditor } from './components/DocumentEditor';
import { DocumentCard } from './components/DocumentCard';
import { startDocumentDownload } from './components/startDocumentDownload';
import { startDocumentPreview } from './components/startDocumentPreview';
import '@/modules/portal/styles/portal.css';

const allChildren = '';
const personalFilter = 'personal';

export function DocumentVaultScreen() {
  const directory = usePortalDirectory();
  const params = useSearchParams();
  const childFilter = params.get('child') ?? '';
  const category = DocumentTypeSchema.safeParse(directory.status);
  const query = useDocuments({
    query: directory.query,
    documentType: category.success ? category.data : undefined,
    childId:
      childFilter && childFilter !== personalFilter ? childFilter : undefined,
    personalOnly: childFilter === personalFilter,
    limit: 9,
    offset: directory.offset,
  });
  const children = useChildren();
  const remove = useDeleteDocument();
  const download = useDownloadDocument();
  const [editor, setEditor] = useState<CareDocument | 'new' | null>(null);
  const [downloadError, setDownloadError] = useState<unknown>(null);
  const deleteBusy = useRef(false);
  const downloadBusy = useRef(false);
  const { showAlert, showToast } = usePresentationService();
  const filtered = Boolean(directory.query || directory.status || childFilter);

  function clearFilters() {
    directory.update({
      query: undefined,
      status: undefined,
      child: undefined,
      offset: undefined,
    });
  }
  async function deleteDocument(document: CareDocument) {
    if (deleteBusy.current) return false;
    deleteBusy.current = true;
    try {
      const confirmed = await showAlert({
        title: copy.deleteTitle,
        description: copy.deleteDescription(document.title),
        tone: 'danger',
        confirmLabel: copy.deleteAction,
        cancelLabel: copy.cancelAction,
      });
      if (!confirmed) return false;
      await remove.mutateAsync(document.id);
      // Removing a final record cannot strand the directory on an empty page.
      if (query.data?.data.length === 1 && directory.offset > 0)
        directory.setOffset(Math.max(0, directory.offset - 9));
      void showToast({ title: copy.deletedTitle, intent: 'success' });
      if (editor !== 'new' && editor?.id === document.id) setEditor(null);
      return true;
    } catch {
      // The shared inline error keeps the document available for another try.
      return false;
    } finally {
      deleteBusy.current = false;
    }
  }
  async function downloadDocument(document: CareDocument) {
    if (downloadBusy.current) return;
    downloadBusy.current = true;
    setDownloadError(null);
    try {
      const result = await download.mutateAsync(document.id);
      startDocumentDownload(result);
      void showToast({ title: copy.downloadStartedTitle, intent: 'success' });
    } catch (error) {
      setDownloadError(error);
    } finally {
      downloadBusy.current = false;
    }
  }

  return (
    <Page className="gp-portal-page">
      <PageHeader
        title={copy.title}
        description={copy.description}
        action={
          <Button onClick={() => setEditor('new')}>
            <UiIcon name="plus" />
            {copy.uploadAction}
          </Button>
        }
      />
      <div className="grid gap-4">
        <DirectoryFilters
          id="document-search"
          value={{
            query: directory.query,
            status: category.success ? category.data : undefined,
          }}
          onChange={(value) =>
            directory.update({
              query: value.query,
              status: value.status,
              offset: undefined,
            })
          }
          statuses={DocumentTypeSchema.options.map((value) => ({
            value,
            label: copy.categories[value],
          }))}
          layout="stackedSearch"
          copy={{
            search: copy.searchLabel,
            placeholder: copy.searchPlaceholder,
            clear: copy.clearAction,
            status: copy.categoryLabel,
            allStatuses: copy.allCategories,
          }}
          additionalFilters={
            <Field labelText={copy.childLabel}>
              <Select
                value={childFilter}
                onValueChange={(value) =>
                  directory.update({ child: value, offset: undefined })
                }
              >
                <option value={allChildren}>{copy.allChildren}</option>
                <option value={personalFilter}>{copy.personalOption}</option>
                {(children.data ?? []).map((child) => (
                  <option key={child.id} value={child.id}>
                    {child.name}
                  </option>
                ))}
              </Select>
            </Field>
          }
        />
        {filtered && (
          <div>
            <Button variant="ghost" onClick={clearFilters}>
              {copy.clearFiltersAction}
            </Button>
          </div>
        )}
      </div>
      <MutationError error={remove.error} />
      <MutationError error={downloadError} />
      {query.isFetching && !query.isPending && <InlineLoading />}
      <QueryBoundary query={query}>
        {(result) => (
          <div className="grid gap-6">
            {result.data.length ? (
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 2xl:grid-cols-3">
                {result.data.map((document) => (
                  <DocumentCard
                    key={document.id}
                    document={document}
                    childName={
                      children.data?.find(
                        (child) => child.id === document.childId,
                      )?.name
                    }
                    downloading={
                      download.isPending && download.variables === document.id
                    }
                    deleting={remove.isPending}
                    onDownload={() => {
                      void downloadDocument(document);
                    }}
                    onPreview={() => startDocumentPreview(document.id)}
                    onEdit={() => setEditor(document)}
                    onDelete={() => {
                      void deleteDocument(document);
                    }}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                icon="file"
                title={filtered ? copy.noResultsTitle : copy.emptyTitle}
                description={filtered ? copy.noResultsHint : copy.emptyHint}
                action={
                  <Button
                    variant={filtered ? 'secondary' : 'primary'}
                    onClick={() =>
                      filtered ? clearFilters() : setEditor('new')
                    }
                  >
                    {filtered ? copy.clearFiltersAction : copy.uploadAction}
                  </Button>
                }
              />
            )}
            <DirectoryPagination
              page={result.page}
              count={result.data.length}
              busy={query.isFetching}
              label={copy.paginationLabel}
              range={copy.rangeDescription}
              onNavigate={directory.setOffset}
            />
          </div>
        )}
      </QueryBoundary>
      <p className="m-0 text-sm text-tertiary">{copy.privacyDescription}</p>
      {editor && (
        <DocumentEditor
          key={editor === 'new' ? 'new' : editor.id}
          document={editor === 'new' ? undefined : editor}
          childrenProfiles={children.data ?? []}
          childrenError={children.error}
          deleting={remove.isPending}
          deleteError={remove.error}
          onDelete={editor === 'new' ? undefined : () => deleteDocument(editor)}
          onClose={() => setEditor(null)}
        />
      )}
    </Page>
  );
}
