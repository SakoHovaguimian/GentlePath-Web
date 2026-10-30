import type { ReactNode } from 'react';
import { Page, PageHeader, SegmentedTabs } from '@/components/ui';
import { useGuardedNavigate } from '@/providers/useGuardedNavigate';
import { gentlePathCommunityStrings as copy } from '@/strings';
import type { CommunityView } from '../models/communityView';

interface CommunityHubProps {
  activeView: CommunityView;
  action: ReactNode;
  children: ReactNode;
}

const communityViews = { posts: 'posts', polls: 'polls' } as const;

export function CommunityHub({
  activeView,
  action,
  children,
}: CommunityHubProps) {
  const navigate = useGuardedNavigate();
  return (
    <Page
      className={`gp-portal-page ${activeView === 'polls' ? 'gp-polls' : 'gp-community'}`}
    >
      <PageHeader
        title={copy.title}
        description={copy.description}
        eyebrow={copy.eyebrow}
        action={action}
      />
      <SegmentedTabs
        label={copy.contentViewLabel}
        value={activeView}
        tabs={[
          { value: communityViews.posts, label: copy.postsTitle },
          { value: communityViews.polls, label: copy.pollsTitle },
        ]}
        onValueChange={(view) => {
          if (view !== activeView)
            void navigate(view === 'polls' ? '/polls' : '/community');
        }}
      />
      {children}
    </Page>
  );
}
