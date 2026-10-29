import {
  Card,
  EmptyState,
  Message,
  PageSection,
  QueryBoundary,
} from '@/components/ui';
import { gentlePathAccountToolsStrings as copy } from '@/strings';
import { useFrequentlyAskedQuestions } from '../hooks';
import { AccountToolsLoading } from './AccountToolsLoading';

export function FrequentlyAskedQuestionsPanel() {
  const query = useFrequentlyAskedQuestions();
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
          {result.sections.length ? (
            result.sections.map((section, index) => (
              <PageSection
                key={`${section.title}-${index}`}
                id={`faq-${index}`}
                title={section.title}
              >
                <Card className="divide-y divide-secondary py-0 sm:py-0">
                  {section.sections.map((faq, faqIndex) => (
                    <article key={faqIndex} className="grid gap-2 py-5">
                      <h3 className="m-0 text-base font-semibold text-primary wrap-anywhere">
                        {faq.question}
                      </h3>
                      <p className="m-0 whitespace-pre-line text-sm text-secondary wrap-anywhere">
                        {faq.answer}
                      </p>
                    </article>
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
