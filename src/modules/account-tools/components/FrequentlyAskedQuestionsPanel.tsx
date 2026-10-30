import {
  Accordion,
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
                <Accordion
                  tone="plum"
                  items={section.sections.map((faq, faqIndex) => ({
                    id: `faq-${index}-${faqIndex}`,
                    title: faq.question,
                    content: (
                      <p className="m-0 whitespace-pre-line leading-relaxed wrap-anywhere">
                        {faq.answer}
                      </p>
                    ),
                  }))}
                />
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
