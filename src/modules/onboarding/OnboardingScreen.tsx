'use client';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from 'react';
import { useRouter } from 'next/navigation';
import {
  Button,
  InitialsAvatar,
  QueryBoundary,
  Stepper,
  SuccessCelebration,
  UiIcon,
} from '@/components/ui';
import { addressRegions } from '@/components/ui/lib/addressChoices';
import { formatChildBirthDate } from '@/modules/portal/formatChildAge';
import { FamilyPreferencesBoundary } from './components/FamilyPreferencesBoundary';
import { OnboardingHeader } from './components/OnboardingHeader';
import { OnboardingStory } from './components/OnboardingStory';
import { OnboardingWelcome } from './components/OnboardingWelcome';
import './styles/onboarding.css';
import {
  gentlePathOnboardingStrings as copy,
  gentlePathPortalStrings as portalCopy,
} from '@/strings';
import { useChildren } from '@/modules/portal/hooks';
import { ChildProfileEditor } from '@/modules/portal/components/ChildProfileEditor';
import { MutationError } from '@/modules/portal/components/MutationError';
import { resolveAuthRedirect } from '@/modules/auth/sessionClient';
import { useUnsavedFormGuard } from '@/providers/useUnsavedFormGuard';
import { useFamilyPreferences, useSaveOnboardingStep } from './hooks';
import { DiscoveryPreferencesFields } from './components/DiscoveryPreferencesFields';
import { StateField } from './components/StateField';
import type { FamilyPreferences } from './models/familyPreferences';
import {
  OnboardingUpdateSchema,
  type OnboardingUpdate,
} from './models/onboardingUpdate';
import type { OnboardingStep } from './models/onboardingStep';
import type { DiscoveryPreferencesInput } from './models/discoveryPreferencesInput';

const steps: OnboardingStep[] = ['STATE', 'CHILDREN', 'DISCOVERY', 'FINISH'];
export function OnboardingScreen({ redirectTo }: { redirectTo?: string }) {
  const query = useFamilyPreferences();
  return (
    <main className="gp-onboarding" id="main-content">
      <OnboardingHeader />
      <div className="gp-onboarding-shell">
        <FamilyPreferencesBoundary query={query}>
          {(settings) => (
            <OnboardingForm settings={settings} redirectTo={redirectTo} />
          )}
        </FamilyPreferencesBoundary>
      </div>
    </main>
  );
}
function OnboardingForm({
  settings,
  redirectTo,
}: {
  settings: FamilyPreferences;
  redirectTo?: string;
}) {
  const router = useRouter();
  const children = useChildren();
  const mutation = useSaveOnboardingStep();
  const [completed, setCompleted] = useState(
    Boolean(settings.onboarding_completed_at),
  );
  const [celebrationSequence, setCelebrationSequence] = useState(0);
  const [celebrating, setCelebrating] = useState(false);
  const [welcomeReady, setWelcomeReady] = useState(false);
  const markWelcomeReady = useCallback(() => setWelcomeReady(true), []);
  const finishCelebration = useCallback(() => setCelebrating(false), []);
  const [step, setStep] = useState<OnboardingStep>(
    settings.onboarding_step === 'COMPLETE'
      ? 'FINISH'
      : settings.onboarding_step,
  );
  const [state, setState] = useState(settings.state_code ?? '');
  const [discovery, setDiscovery] = useState<DiscoveryPreferencesInput>({
    approaches: settings.discovery_approaches,
    no_preference:
      settings.discovery_preferences_answered &&
      settings.discovery_approaches.length === 0,
  });
  const [editor, setEditor] = useState(false);
  const [validation, setValidation] = useState<string | null>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const form = useRef<HTMLFormElement>(null);
  useEffect(() => {
    heading.current?.focus();
  }, [step]);
  const dirty = useRef(false);
  const busy = useRef(false);
  useUnsavedFormGuard(dirty, busy);
  async function save(input: OnboardingUpdate) {
    if (busy.current) return;
    const parsed = OnboardingUpdateSchema.safeParse(input);
    if (!parsed.success) {
      setValidation(copy.invalidSelection);
      form.current
        ?.querySelector<HTMLInputElement>('input[type=checkbox]')
        ?.focus();
      return;
    }
    busy.current = true;
    setValidation(null);
    try {
      await mutation.mutateAsync(parsed.data);
      dirty.current = false;
      if (input.step === 'FINISH') {
        setCompleted(true);
        setCelebrating(true);
        setCelebrationSequence((sequence) => sequence + 1);
      } else {
        setStep(steps[steps.indexOf(input.step) + 1]);
      }
    } catch {
      /* The form keeps its draft and shows the mutation error. */
    } finally {
      busy.current = false;
    }
  }
  function submit(event: FormEvent) {
    event.preventDefault();
    if (step === 'STATE') {
      const parsed = OnboardingUpdateSchema.safeParse({
        step,
        state_code: state,
      });
      if (!parsed.success) {
        setValidation(copy.chooseState);
        form.current
          ?.querySelector<HTMLButtonElement>('[data-state-field] button')
          ?.focus();
        return;
      }
      void save(parsed.data);
    } else if (step === 'DISCOVERY') {
      void save({ step, discovery });
    } else if (step === 'FINISH') {
      void save({ step });
    }
  }
  const index = steps.indexOf(step);
  const stateName =
    addressRegions('US').find((item) => item.code === state)?.name ?? state;
  const preferencesSummary = discovery.no_preference
    ? copy.noPreference
    : discovery.approaches
        .map((approach) => copy.approachLabels[approach])
        .join(', ');
  return (
    <div className="gp-onboarding-content">
      <SuccessCelebration
        variant="onboarding"
        sequence={celebrationSequence}
        active={celebrating}
        ready={welcomeReady}
        onComplete={finishCelebration}
      />
      {completed ? (
        <OnboardingWelcome
          celebrating={celebrating}
          onReady={markWelcomeReady}
          onCelebrationChange={() => {
            if (celebrating) finishCelebration();
            else {
              setCelebrating(true);
              setCelebrationSequence((sequence) => sequence + 1);
            }
          }}
          onContinue={() => {
            router.replace(resolveAuthRedirect(redirectTo));
            router.refresh();
          }}
        />
      ) : (
        <>
          <div className="gp-onboarding-progress">
            <Stepper
              label={copy.title}
              steps={steps.map((item, position) => ({
                key: item,
                label: copy.steps[item],
                state:
                  position < index
                    ? 'complete'
                    : position === index
                      ? 'current'
                      : 'upcoming',
                stateLabel:
                  position < index
                    ? copy.progressStates.complete
                    : position === index
                      ? copy.progressStates.current
                      : copy.progressStates.upcoming,
                disabled: position > index,
              }))}
              disabled={mutation.isPending}
              onSelect={(next) => {
                setValidation(null);
                setStep(next);
              }}
            />
          </div>
          <div className="gp-onboarding-stage" data-step={step}>
            <OnboardingStory step={step} />
            <section
              className="gp-onboarding-form-card"
              aria-labelledby="onboarding-step-heading"
            >
              <header className="gp-onboarding-form-heading">
                <p className="gp-onboarding-eyebrow">
                  {copy.progress(index + 1, steps.length)}
                </p>
                <h2 ref={heading} id="onboarding-step-heading" tabIndex={-1}>
                  {copy.formTitles[step]}
                </h2>
                <p>
                  {step === 'STATE'
                    ? copy.stateHint
                    : step === 'CHILDREN'
                      ? copy.childrenHint
                      : step === 'DISCOVERY'
                        ? copy.discoveryHint
                        : copy.finishHint}
                </p>
              </header>
              <form
                ref={form}
                noValidate
                onSubmit={submit}
                className="gp-onboarding-form"
                aria-busy={mutation.isPending}
              >
                {step === 'STATE' && (
                  <div className="gp-onboarding-state-fields">
                    <StateField
                      errorId={validation ? 'onboarding-validation' : undefined}
                      value={state}
                      onChange={(value) => {
                        dirty.current = true;
                        setState(value);
                      }}
                      disabled={mutation.isPending}
                    />
                    <p className="gp-onboarding-field-note">
                      <UiIcon name="layers" className="size-4" />
                      {copy.stateNote}
                    </p>
                  </div>
                )}
                {step === 'CHILDREN' && (
                  <QueryBoundary query={children}>
                    {(items) => (
                      <div className="gp-onboarding-children">
                        {items.length > 0 ? (
                          <ul className="gp-onboarding-child-list">
                            {items.map((child) => (
                              <li key={child.id}>
                                <InitialsAvatar name={child.name} />
                                <div>
                                  <span className="gp-onboarding-child-name">
                                    {child.name}
                                  </span>
                                  <time dateTime={child.dateOfBirth}>
                                    {formatChildBirthDate(child.dateOfBirth)}
                                  </time>
                                </div>
                                <UiIcon name="check" className="size-5" />
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <div className="gp-onboarding-child-empty">
                            <span>
                              <UiIcon name="user" className="size-6" />
                            </span>
                            <p>{copy.childEmptyHint}</p>
                          </div>
                        )}
                        <Button
                          type="button"
                          variant="secondary"
                          className="gp-onboarding-add-child"
                          disabled={mutation.isPending}
                          onClick={() => setEditor(true)}
                        >
                          <UiIcon name="plus" className="size-4" />
                          {portalCopy.family.create}
                        </Button>
                        <p className="gp-onboarding-field-note">
                          {copy.childrenNote}
                        </p>
                      </div>
                    )}
                  </QueryBoundary>
                )}
                {step === 'DISCOVERY' && (
                  <DiscoveryPreferencesFields
                    showIntroduction={false}
                    value={discovery}
                    onChange={(value) => {
                      dirty.current = true;
                      setDiscovery(value);
                    }}
                    disabled={mutation.isPending}
                  />
                )}
                {step === 'FINISH' && (
                  <div className="gp-onboarding-review">
                    <dl>
                      <div>
                        <dt>
                          <UiIcon name="layers" className="size-4" />
                          {copy.state}
                        </dt>
                        <dd>{stateName}</dd>
                      </div>
                      <div>
                        <dt>
                          <UiIcon name="user" className="size-4" />
                          {copy.steps.CHILDREN}
                        </dt>
                        <dd>
                          {settings.onboarding_children_response === 'LATER'
                            ? copy.addChildrenLater
                            : children.data
                              ? copy.childSummary(children.data.length)
                              : copy.steps.CHILDREN}
                        </dd>
                      </div>
                      <div>
                        <dt>
                          <UiIcon name="leaf" className="size-4" />
                          {copy.steps.DISCOVERY}
                        </dt>
                        <dd>{preferencesSummary}</dd>
                      </div>
                    </dl>
                    <p className="gp-onboarding-review-note">
                      <UiIcon name="check" className="size-4" />
                      {copy.reviewNote}
                    </p>
                  </div>
                )}
                {validation && (
                  <p
                    id="onboarding-validation"
                    role="alert"
                    className="text-sm text-error-primary"
                  >
                    {validation}
                  </p>
                )}
                <MutationError error={mutation.error} />
                <footer className="gp-onboarding-form-actions">
                  {index > 0 && (
                    <Button
                      type="button"
                      variant="ghost"
                      disabled={mutation.isPending}
                      onClick={() => {
                        setValidation(null);
                        setStep(steps[index - 1]);
                      }}
                    >
                      <UiIcon name="chevronLeft" className="size-4" />
                      {copy.back}
                    </Button>
                  )}
                  {step === 'CHILDREN' ? (
                    <Button
                      type="button"
                      loading={mutation.isPending}
                      disabled={children.isPending || children.isError}
                      onClick={() =>
                        void save({
                          step: 'CHILDREN',
                          response: children.data?.length ? 'ADDED' : 'LATER',
                        })
                      }
                    >
                      {children.data?.length
                        ? copy.childrenAdded
                        : copy.addChildrenLater}
                      <UiIcon name="arrowRight" className="size-4" />
                    </Button>
                  ) : (
                    <Button type="submit" loading={mutation.isPending}>
                      {step === 'FINISH' ? copy.finish : copy.continue}
                      <UiIcon name="arrowRight" className="size-4" />
                    </Button>
                  )}
                </footer>
              </form>
            </section>
          </div>
          <p className="gp-onboarding-footer">
            <UiIcon name="leaf" className="size-4" />
            {copy.footerHint}
          </p>
          {editor && <ChildProfileEditor onClose={() => setEditor(false)} />}
        </>
      )}
    </div>
  );
}
