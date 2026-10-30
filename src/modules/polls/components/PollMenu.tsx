import { SavedContentButton } from '@/modules/engagement/components/SavedContentButton';
import { gentlePathPollStrings as copy } from '@/strings';

export function PollMenu({
  contentId,
  own,
  writable,
  busy,
  onOpen,
  onEdit,
  onDelete,
}: {
  contentId: string;
  own: boolean;
  writable: boolean;
  busy: boolean;
  onOpen: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <SavedContentButton
      contentType="POLL"
      contentId={contentId}
      variant="menu"
      menuLabel={copy.pollActions}
      menuItems={[
        { id: 'open', icon: 'chat', label: copy.viewDiscussion },
        ...(own
          ? [
              {
                id: 'edit',
                icon: 'file' as const,
                label: copy.editPoll,
                disabled: !writable || busy,
              },
              {
                id: 'delete',
                icon: 'trash' as const,
                label: copy.deletePoll,
                variant: 'destructive' as const,
                disabled: !writable || busy,
              },
            ]
          : []),
      ]}
      onMenuAction={(action) => {
        if (action === 'open') onOpen();
        else if (action === 'edit') onEdit();
        else if (action === 'delete') onDelete();
      }}
    />
  );
}
