import { Button, Modal } from '@/components/ui';
import { gentlePathEditorialStrings as copy } from '@/strings';
import type { GuideDraft } from '../models/guideDraft';
import { EditorialImage } from './EditorialImage';
import { GuideSteps } from './GuideSteps';

export function GuidePreview({
  draft,
  onClose,
}: {
  draft: GuideDraft;
  onClose: () => void;
}) {
  const title = draft.title.trim() || copy.previewUntitled;
  return (
    <Modal
      open
      title={copy.previewTitle}
      description={copy.previewDescription}
      onDismiss={onClose}
      footer={
        <div className="flex justify-end">
          <Button variant="secondary" onClick={onClose}>
            {copy.closePreview}
          </Button>
        </div>
      }
    >
      <div className="grid min-w-0 gap-6">
        <div className="grid gap-3">
          <h2 className="m-0 font-display text-2xl font-normal text-primary wrap-anywhere">
            {title}
          </h2>
          <p className="m-0 whitespace-pre-line text-secondary">
            {draft.description}
          </p>
        </div>
        {draft.imageUrl && <EditorialImage src={draft.imageUrl} alt={title} />}
        <GuideSteps
          steps={draft.items.map((item, position) => ({
            id: item.id,
            position,
            title: item.title || null,
            description: item.description || copy.previewEmptyStep,
            image_url: item.imageUrl || null,
          }))}
        />
      </div>
    </Modal>
  );
}
