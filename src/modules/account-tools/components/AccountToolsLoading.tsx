import { DataPanelState, InlineLoading } from '@/components/ui';
import { gentlePathAccountToolsStrings as copy } from '@/strings';

export function AccountToolsLoading() {
  return (
    <DataPanelState>
      <InlineLoading message={copy.common.loadingTitle} />
    </DataPanelState>
  );
}
