import { Accordion } from '@/components/ui';
import { gentlePathLandingStrings as copy } from '@/strings';

export function LandingQuestions() {
  return (
    <section
      className="gp-questions gp-container"
      aria-labelledby="gentlepath-questions-title"
    >
      <div className="gp-section-heading">
        <p className="gp-eyebrow">{copy.questions.eyebrowLabel}</p>
        <h2 id="gentlepath-questions-title">{copy.questions.title}</h2>
      </div>
      <Accordion
        className="gp-question-list"
        itemClassName="gp-question"
        allowsMultipleExpanded
        items={copy.questions.items.map((question, index) => ({
          id: `landing-question-${index}`,
          title: question.title,
          content: <p>{question.description}</p>,
        }))}
      />
    </section>
  );
}
