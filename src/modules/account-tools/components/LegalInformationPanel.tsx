import {
  Card,
  EmptyState,
  Message,
  PageSection,
  QueryBoundary,
} from '@/components/ui';
import { gentlePathAccountToolsStrings as copy } from '@/strings';
import { useLegalInformation } from '../hooks';
import type { LegalContext } from '../models/legalInformation';
import { AccountToolsLoading } from './AccountToolsLoading';

export function LegalInformationPanel({ context }: { context: LegalContext }) {
  const query = useLegalInformation(context);
  return (
    <QueryBoundary query={query} loadingFallback={<AccountToolsLoading />}>
      {(result) => (
        <div className="grid gap-6">
          {result.illustrative && (
            <Message
              title={copy.help.illustrativeTitle}
              description={copy.help.illustrativeDescription}
              intent="warning"
            />
          )}
          {result.items.length ? (
            result.items.map((item, index) => (
              <PageSection
                key={`${item.title}-${index}`}
                id={`${context}-${index}`}
                title={item.title}
              >
                <Card className="grid gap-4">
                  {item.sections.map((paragraph, paragraphIndex) => (
                    <p
                      key={paragraphIndex}
                      className="m-0 whitespace-pre-line text-sm text-secondary wrap-anywhere"
                    >
                      {paragraph}
                    </p>
                  ))}
                </Card>
              </PageSection>
            ))
          ) : (
            <EmptyState
              title={copy.help.emptyTitle}
              description={copy.help.emptyHint}
            />
          )}
        </div>
      )}
    </QueryBoundary>
  );
}
