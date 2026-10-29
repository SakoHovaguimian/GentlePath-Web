import { InlineLoading, Page } from '@/components/ui';

export default function PortalLoading() {
  return (
    <Page>
      <div className="flex min-h-48 items-center justify-center" role="status">
        <InlineLoading />
      </div>
    </Page>
  );
}
