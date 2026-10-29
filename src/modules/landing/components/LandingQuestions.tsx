import { UiIcon } from '@/components/ui';
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
      <div className="gp-question-list">
        {copy.questions.items.map((question) => (
          <details key={question.title} className="gp-question">
            <summary>
              <span>{question.title}</span>
              <UiIcon name="plus" />
            </summary>
            <p>{question.description}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
