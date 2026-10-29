'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Route } from 'next';
import {
  Button,
  Message,
  Page,
  PageHeader,
  QueryBoundary,
} from '@/components/ui';
import { useNavigationGuard } from '@/providers/NavigationGuardProvider';
import { useGuardedNavigate } from '@/providers/useGuardedNavigate';
import { gentlePathCommercialStrings as copy } from '@/strings';
import type { CommercialEntity } from './models/commercialEntity';
import { useCommercialDetail } from './hooks';
import { CommercialContentForm } from './components/CommercialContentForm';
import { CommercialLifecycle } from './components/CommercialLifecycle';
import { CommercialRecordDetails } from './components/CommercialRecordDetails';
import { PlacementItemsEditor } from './components/PlacementItemsEditor';
import { commercialName } from './components/commercialFormFields';
interface CommercialEditorScreenProps {
  entity: CommercialEntity;
  id?: string;
}
export function CommercialEditorScreen({
  entity,
  id,
}: CommercialEditorScreenProps) {
  const query = useCommercialDetail(entity, id ?? '');
  const [editing, setEditing] = useState(false);
  const navigate = useGuardedNavigate();
  const router = useRouter();
  const { confirmNavigation } = useNavigationGuard();
  const breadcrumb = [
    { label: copy.title, href: '/admin/commercial' },
    { label: copy[entity], href: `/admin/commercial?tab=${entity}` },
    { label: id ? copy.edit : copy.create },
  ];
  if (!id)
    return (
      <Page>
        <PageHeader
          title={entity === 'offers' ? copy.createOffer : copy.create}
          eyebrow={copy[entity]}
          breadcrumbs={breadcrumb}
          onNavigate={(href) => {
            void navigate(href);
          }}
        />
        {entity === 'offers' && (
          <Message
            title={copy.offerAuthoringTitle}
            description={copy.offerAuthoringHint}
            intent="neutral"
          />
        )}
        <CommercialContentForm entity={entity} />
      </Page>
    );
  return (
    <Page>
      <QueryBoundary query={query}>
        {(record) => (
          <>
            <PageHeader
              title={commercialName(record)}
              eyebrow={copy[entity]}
              breadcrumbs={breadcrumb}
              onNavigate={(href) => {
                void navigate(href);
              }}
              action={
                !editing ? (
                  <Button
                    onClick={async () => {
                      if (await confirmNavigation()) setEditing(true);
                    }}
                  >
                    {copy.edit}
                  </Button>
                ) : undefined
              }
            />
            {editing ? (
              <CommercialContentForm
                key={record.id}
                entity={entity}
                record={record}
                onSaved={() => setEditing(false)}
              />
            ) : (
              <>
                <CommercialRecordDetails entity={entity} record={record} />
                <CommercialLifecycle
                  entity={entity}
                  record={record}
                  onDeleted={() => {
                    router.push(`/admin/commercial?tab=${entity}` as Route);
                  }}
                />
                {entity === 'placements' && 'max_items' in record && (
                  <PlacementItemsEditor placement={record} />
                )}
              </>
            )}
            <Button
              variant="secondary"
              className="justify-self-start"
              onClick={() => {
                void navigate(`/admin/commercial?tab=${entity}`);
              }}
            >
              {copy.back}
            </Button>
          </>
        )}
      </QueryBoundary>
    </Page>
  );
}
