'use client';

import { strings } from '@/strings';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui';
import { usePresentationService } from '@/presentation/PresentationProvider';

const sections = [
  { id: 'hero', label: strings.ui.experienceScreen.overview },
  { id: 'solutions', label: strings.ui.experienceScreen.system },
  { id: 'workflow', label: strings.ui.experienceScreen.workflow },
  { id: 'gallery', label: strings.ui.experienceScreen.showcase },
  { id: 'motion', label: strings.ui.experienceScreen.motion },
  { id: 'contact', label: strings.ui.experienceScreen.contact },
  { id: 'faq', label: strings.ui.experienceScreen.faq },
] as const;

const solutions = [
  {
    title: strings.ui.experienceScreen.dashboardFirstSurfaces,
    description:
      strings.ui.experienceScreen.cardsListsFormsAndSideNavigationAllUseThe,
  },
  {
    title: strings.ui.experienceScreen.accentColorAsSupport,
    description:
      strings.ui.experienceScreen
        .selectedThemeColorsHighlightActiveStatesPillsAndKey,
  },
  {
    title: strings.ui.experienceScreen.darkModeThatStaysReadable,
    description:
      strings.ui.experienceScreen
        .theDarkThemeUsesLayeredSlatePanelsAndRestrained,
  },
  {
    title: strings.ui.experienceScreen.overlayControlsPreserved,
    description:
      strings.ui.experienceScreen
        .toastsAlertsAndSheetsStillRunThroughOnePresentation,
  },
] as const;

const showcaseStats = [
  {
    label: strings.ui.experienceScreen.selectedTheme,
    value: strings.ui.experienceScreen.accentAware,
  },
  {
    label: strings.ui.experienceScreen.surfaceLanguage,
    value: strings.ui.experienceScreen.flatPanels,
  },
  {
    label: strings.ui.experienceScreen.navigationStyle,
    value: strings.ui.experienceScreen.dashboardShell,
  },
] as const;

const faqItems = [
  {
    question: strings.ui.experienceScreen.canWeStillLaunchHeroOnly,
    answer:
      strings.ui.experienceScreen.yesThisShowcaseRouteIsOptionalAndCanStay,
  },
  {
    question: strings.ui.experienceScreen.canWeKeepAuthOptional,
    answer:
      strings.ui.experienceScreen.yesTheVisualRestyleDoesNotChangeTheScaffold,
  },
  {
    question: strings.ui.experienceScreen.canTheSelectedAccentStaySubtle,
    answer:
      strings.ui.experienceScreen
        .yesTheNewSystemDeliberatelyLimitsAccentUsageTo,
  },
  {
    question: strings.ui.experienceScreen.areTheChartsRealYet,
    answer:
      strings.ui.experienceScreen
        .theAnalyticsWidgetsInTheRedesignedDashboardUseMock,
  },
  {
    question: strings.ui.experienceScreen.doesDarkModeKeepTheSameStructure,
    answer:
      strings.ui.experienceScreen.yesTheSameCardAndShellHierarchyCarriesThrough,
  },
  {
    question: strings.ui.experienceScreen.canWeSwapTheAccentThemePerUser,
    answer:
      strings.ui.experienceScreen
        .yesAccentChoiceStillLivesInAppearancePreferencesAnd,
  },
  {
    question: strings.ui.experienceScreen.willFormControlsMatchTheDashboard,
    answer:
      strings.ui.experienceScreen.yesInputsButtonsTabsAndOverlaysNowInheritThe,
  },
  {
    question: strings.ui.experienceScreen.areTheSideNavigationItemsReusable,
    answer: strings.ui.experienceScreen.yesTheSidebarIsStillDrivenFromOneShared,
  },
  {
    question: strings.ui.experienceScreen.canWeAddMoreDashboardWidgetsLater,
    answer:
      strings.ui.experienceScreen
        .yesTheCurrentMockedCardsAreIntentionallyBuiltFrom,
  },
  {
    question:
      strings.ui.experienceScreen.willRecordsAndRegistryStayInTheDashboard,
    answer:
      strings.ui.experienceScreen
        .yesThoseExistingOperationalPanelsRemainInPlaceAnd,
  },
  {
    question: strings.ui.experienceScreen.doOverlayAnimationsStillWork,
    answer:
      strings.ui.experienceScreen
        .yesAlertToastAndSheetTimingControlsAreUntouched,
  },
  {
    question: strings.ui.experienceScreen.canTheFooterBeBrandSpecific,
    answer: strings.ui.experienceScreen.yesTheFullWidthFooterIsJustContentAnd,
  },
  {
    question: strings.ui.experienceScreen.willTheAuthPagesKeepThisStyle,
    answer: strings.ui.experienceScreen.yesLoginAndSignupNowUseTheSameFlatter,
  },
  {
    question: strings.ui.experienceScreen.canWeTurnSomeSectionsOff,
    answer:
      strings.ui.experienceScreen.yesTheShowcaseRouteIsModularAndSectionsCan,
  },
  {
    question: strings.ui.experienceScreen.isThisMeantToReplaceTheOldGlossyLook,
    answer: strings.ui.experienceScreen.yesTheGoalOfThisPassIsToMove,
  },
] as const;

export function ExperienceScreen() {
  const presentation = usePresentationService();
  const [scrollY, setScrollY] = useState(0);
  const [activeSection, setActiveSection] =
    useState<(typeof sections)[number]['id']>('hero');
  const [revealedSections, setRevealedSections] = useState<
    Record<string, boolean>
  >({ hero: true });
  const [expandedFaq, setExpandedFaq] = useState<
    (typeof faqItems)[number]['question'] | null
  >(faqItems[0].question);

  useEffect(() => {
    let frame = 0;

    const onScroll = () => {
      if (frame) {
        return;
      }

      frame = window.requestAnimationFrame(() => {
        setScrollY(window.scrollY);
        frame = 0;
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (frame) {
        window.cancelAnimationFrame(frame);
      }
    };
  }, []);

  useEffect(() => {
    const nodes = sections
      .map((section) => ({
        id: section.id,
        node: document.getElementById(section.id),
      }))
      .filter(
        (
          entry,
        ): entry is {
          id: (typeof sections)[number]['id'];
          node: HTMLElement;
        } => entry.node instanceof HTMLElement,
      );

    if (nodes.length === 0) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }

          const id = entry.target.id as (typeof sections)[number]['id'];
          setRevealedSections((current) =>
            current[id] ? current : { ...current, [id]: true },
          );
        });
      },
      { threshold: [0.05, 0.2, 0.45], rootMargin: '-8% 0px -22% 0px' },
    );

    nodes.forEach((entry) => observer.observe(entry.node));
    return () => observer.disconnect();
  }, []);

  const heroParallax = useMemo(() => Math.min(scrollY * 0.1, 30), [scrollY]);
  const visibleState = (id: (typeof sections)[number]['id']) =>
    (revealedSections[id] ? 'true' : 'false') as 'true' | 'false';

  useEffect(() => {
    const header = document.querySelector('[data-showcase-header="true"]');
    const headerHeight =
      header instanceof HTMLElement ? header.offsetHeight : 72;
    const activationOffset = headerHeight + 24;

    let nextActiveSection: (typeof sections)[number]['id'] = sections[0].id;

    for (const section of sections) {
      const node = document.getElementById(section.id);
      if (!(node instanceof HTMLElement)) {
        continue;
      }

      if (node.getBoundingClientRect().top <= activationOffset) {
        nextActiveSection = section.id;
      }
    }

    const frame = requestAnimationFrame(() =>
      setActiveSection((current) =>
        current === nextActiveSection ? current : nextActiveSection,
      ),
    );
    return () => cancelAnimationFrame(frame);
  }, [scrollY]);

  async function handleSolutionPresentation(index: number) {
    if (index === 0) {
      await presentation.showAlert({
        title: strings.ui.experienceScreen.dashboardSurfacePreset,
        description:
          strings.ui.experienceScreen
            .primaryCardsMutedPanelsAndFlatterDataRowsStay,
        tone: 'info',
        confirmLabel: strings.ui.experienceScreen.looksGood,
        cancelLabel: strings.ui.experienceScreen.close,
      });
      return;
    }

    if (index === 1) {
      await presentation.showSheet({
        title: strings.ui.experienceScreen.accentUsageGuardrails,
        description:
          strings.ui.experienceScreen
            .useTheSelectedAccentForActiveStatesChipsAnd,
        tone: 'success',
        side: 'right',
        details: (
          <div className="grid gap-1.5">
            <p className="m-0 text-sm text-secondary">
              {strings.ui.experienceScreen.keepLargeBackgroundsMostlyNeutral}
            </p>
            <p className="m-0 text-sm text-secondary">
              {
                strings.ui.experienceScreen
                  .letBrandColorShowUpInNavigationStateTags
              }
            </p>
          </div>
        ),
      });
      return;
    }

    if (index === 2) {
      await presentation.showSheet({
        title: strings.ui.experienceScreen.darkModeNotes,
        description:
          strings.ui.experienceScreen
            .layeredSlateSurfacesReplaceThePreviousGlossyLook,
        tone: 'warning',
        side: 'bottom',
        size: 'lg',
        details: (
          <div className="grid gap-1.5">
            <p className="m-0 text-sm text-secondary">
              {
                strings.ui.experienceScreen
                  .cardsStayLiftedThroughBordersAndPanelContrastNot
              }
            </p>
            <p className="m-0 text-sm text-secondary">
              {
                strings.ui.experienceScreen
                  .textHierarchyStaysConsistentBetweenLightAndDarkThemes
              }
            </p>
          </div>
        ),
      });
      return;
    }

    await presentation.showAlert({
      title: strings.ui.experienceScreen.presentationStylingUpdated,
      description:
        strings.ui.experienceScreen
          .toastsAlertsAndSheetsNowInheritTheSameFlatter,
      tone: 'success',
      alignment: 'top',
      confirmLabel: strings.ui.experienceScreen.great,
      cancelLabel: strings.ui.experienceScreen.close,
    });
  }

  function scrollToSection(id: (typeof sections)[number]['id']) {
    const node = document.getElementById(id);
    if (!node) {
      return;
    }

    setActiveSection(id);
    const header = document.querySelector('[data-showcase-header="true"]');
    const headerHeight =
      header instanceof HTMLElement ? header.offsetHeight : 72;
    const top =
      window.scrollY + node.getBoundingClientRect().top - headerHeight - 16;
    window.scrollTo({ top: Math.max(top, 0), behavior: 'smooth' });
  }

  return (
    <div
      className="min-h-screen text-primary"
      style={{
        backgroundImage:
          'linear-gradient(180deg, var(--dashboard-shell-bg), var(--dashboard-shell-bg-emphasis))',
      }}
    >
      <div
        data-showcase-header="true"
        className="sticky top-0 z-40 border-b border-secondary bg-(--dashboard-shell-topbar) backdrop-blur"
      >
        <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-10">
          <div>
            <p className="m-0 text-xs font-semibold uppercase tracking-[0.16em] text-brand-secondary">
              {strings.ui.experienceScreen.showcase}
            </p>
            <h1 className="mt-1 font-display text-xl font-semibold tracking-tight text-primary">
              {strings.ui.experienceScreen.dashboardStylingPreview}
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {sections.map((section) => (
              <Button
                variant="ghost"
                key={section.id}
                type="button"
                onClick={() => scrollToSection(section.id)}
                className={`bouncy-button rounded-lg border px-4 py-2 text-sm font-medium transition ${
                  activeSection === section.id
                    ? 'border-brand/60 bg-brand-primary text-primary shadow-(--dashboard-shell-shadow)'
                    : 'border-secondary bg-primary text-secondary hover:border-primary hover:text-primary'
                }`}
              >
                {section.label}
              </Button>
            ))}
            <Link
              href={'/dashboard' as never}
              className="bouncy-button rounded-lg bg-brand-solid px-4 py-2 text-sm font-semibold text-(--color-text-primary_on-brand) shadow-(--dashboard-shell-shadow) transition hover:bg-brand-solid_hover"
            >
              {strings.ui.experienceScreen.backToDashboard}
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto grid w-full max-w-7xl gap-20 px-4 py-10 sm:px-6 lg:px-10 lg:py-16">
        <section
          id="hero"
          className="experience-reveal grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]"
          data-visible={visibleState('hero')}
        >
          <article className="rounded-3xl border border-secondary bg-primary p-6 shadow-(--dashboard-shell-shadow-lg) sm:p-8 lg:p-10">
            <p className="m-0 text-xs font-semibold uppercase tracking-[0.18em] text-brand-secondary">
              {strings.ui.experienceScreen.restyledSystem}
            </p>
            <h2 className="mt-4 font-display text-[clamp(2.75rem,6vw,4.5rem)] font-semibold leading-none tracking-[-0.04em] text-primary">
              {
                strings.ui.experienceScreen
                  .fromGlossyPrototypeToACalmerDashboardProductSurface
              }
            </h2>
            <p className="mt-5 max-w-3xl text-base leading-7 text-secondary sm:text-lg">
              {
                strings.ui.experienceScreen
                  .thisRouteShowsTheNewDirectionAcrossHeroContent
              }
            </p>
            <div className="mt-7 flex flex-wrap gap-2">
              {[
                strings.ui.experienceScreen.flatCardLanguage,
                strings.ui.experienceScreen.accentAwareStates,
                strings.ui.experienceScreen.layeredDarkMode,
                strings.ui.experienceScreen.sharedSystemTokens,
              ].map((chip) => (
                <span
                  key={chip}
                  className="inline-flex rounded-full border border-secondary bg-secondary_subtle px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-secondary"
                >
                  {chip}
                </span>
              ))}
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href={'/dashboard' as never}
                className="bouncy-button rounded-lg bg-brand-solid px-5 py-3 text-sm font-semibold text-(--color-text-primary_on-brand) shadow-(--dashboard-shell-shadow) transition hover:bg-brand-solid_hover"
              >
                {strings.ui.experienceScreen.enterPortal}
              </Link>
              <Button
                variant="ghost"
                type="button"
                onClick={() => scrollToSection('solutions')}
                className="bouncy-button rounded-lg border border-secondary bg-primary px-5 py-3 text-sm font-semibold text-primary transition hover:bg-secondary_subtle"
              >
                {strings.ui.experienceScreen.exploreTheSystem}
              </Button>
            </div>
          </article>

          <div
            className="grid gap-4"
            style={{ transform: `translate3d(0, ${-heroParallax}px, 0)` }}
          >
            <article className="rounded-3xl border border-secondary bg-primary p-5 shadow-(--dashboard-shell-shadow)">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="m-0 text-xs font-semibold uppercase tracking-[0.16em] text-tertiary">
                    {strings.ui.experienceScreen.previewSurface}
                  </p>
                  <h3 className="mt-2 text-xl font-semibold text-primary">
                    {strings.ui.experienceScreen.liveDashboardMock}
                  </h3>
                </div>
                <span className="inline-flex rounded-full bg-brand-primary px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-brand-secondary">
                  {strings.ui.experienceScreen.active}
                </span>
              </div>
              <div className="mt-5 grid gap-4 rounded-2xl border border-secondary bg-secondary_subtle p-4">
                <div className="grid gap-3 sm:grid-cols-3">
                  {[
                    strings.ui.experienceScreen.conversion,
                    strings.ui.experienceScreen.tickets,
                    strings.ui.experienceScreen.retention,
                  ].map((label, index) => (
                    <div
                      key={label}
                      className="rounded-xl border border-secondary bg-primary p-4"
                    >
                      <p className="m-0 text-xs font-semibold uppercase tracking-[0.16em] text-tertiary">
                        {label}
                      </p>
                      <p className="mt-3 text-2xl font-semibold text-primary">
                        {['24.8%', '134', '92%'][index]}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="rounded-xl border border-secondary bg-primary p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="m-0 text-sm font-semibold text-primary">
                      {strings.ui.experienceScreen.trafficOverview}
                    </p>
                    <span className="text-xs font-semibold uppercase tracking-[0.14em] text-tertiary">
                      {strings.ui.experienceScreen.last7Days}
                    </span>
                  </div>
                  <div className="mt-4 flex h-32 items-end gap-2">
                    {[38, 52, 44, 70, 58, 66, 82, 74, 88, 80].map(
                      (height, index) => (
                        <span
                          key={index}
                          className={`w-full rounded-t-md ${index > 6 ? 'bg-brand-solid/80' : 'bg-secondary'}`}
                          style={{ height: `${height}%` }}
                        />
                      ),
                    )}
                  </div>
                </div>
              </div>
            </article>

            <div className="grid gap-4 md:grid-cols-3">
              {showcaseStats.map((item) => (
                <article
                  key={item.label}
                  className="rounded-2xl border border-secondary bg-primary p-4 shadow-(--dashboard-shell-shadow)"
                >
                  <p className="m-0 text-xs font-semibold uppercase tracking-[0.16em] text-tertiary">
                    {item.label}
                  </p>
                  <p className="mt-2 text-sm font-semibold text-primary">
                    {item.value}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section
          id="solutions"
          className="experience-reveal grid gap-8"
          data-visible={visibleState('solutions')}
        >
          <div className="grid gap-3 lg:max-w-3xl">
            <p className="m-0 text-xs font-semibold uppercase tracking-[0.2em] text-brand-secondary">
              {strings.ui.experienceScreen.systemDirection}
            </p>
            <h2 className="font-display text-4xl font-semibold tracking-tight text-primary sm:text-5xl">
              {
                strings.ui.experienceScreen
                  .aFlatDashboardLanguageLayeredOnTopOfArchitecture
              }
            </h2>
            <p className="text-base leading-7 text-secondary">
              {
                strings.ui.experienceScreen
                  .theRestyleKeepsYourAppStructureDataContractsAnd
              }
            </p>
          </div>
          <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
            {solutions.map((solution, index) => (
              <Button
                variant="ghost"
                key={solution.title}
                type="button"
                onClick={() => void handleSolutionPresentation(index)}
                className="bouncy-button group grid min-h-60 gap-4 rounded-[24px] border border-secondary bg-primary p-6 text-left shadow-(--dashboard-shell-shadow) transition duration-200 hover:border-primary"
              >
                <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-brand-primary text-sm font-semibold uppercase tracking-[0.16em] text-brand-secondary">
                  {strings.ui.experienceScreen.value0}
                  {index + 1}
                </div>
                <div>
                  <h3 className="text-xl font-semibold tracking-tight text-primary">
                    {solution.title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-secondary">
                    {solution.description}
                  </p>
                  <p className="mt-4 text-xs font-semibold uppercase tracking-[0.16em] text-brand-secondary">
                    {strings.ui.experienceScreen.openPreview}
                  </p>
                </div>
              </Button>
            ))}
          </div>
        </section>

        <section
          id="workflow"
          className="experience-reveal grid gap-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]"
          data-visible={visibleState('workflow')}
        >
          <article className="grid gap-5 rounded-3xl border border-secondary bg-primary p-6 shadow-(--dashboard-shell-shadow) sm:p-8">
            <div className="grid gap-3">
              <p className="m-0 text-xs font-semibold uppercase tracking-[0.18em] text-brand-secondary">
                {strings.ui.experienceScreen.workflow}
              </p>
              <h2 className="font-display text-4xl font-semibold tracking-tight text-primary sm:text-5xl">
                {
                  strings.ui.experienceScreen
                    .theVisualUpdateStillRespectsTheSystemUnderneath
                }
              </h2>
              <p className="text-base leading-7 text-secondary">
                {
                  strings.ui.experienceScreen
                    .routesStayThinServicesKeepOrchestrationAndPresentationFlows
                }
              </p>
            </div>
            <div className="grid gap-4">
              {[
                strings.ui.experienceScreen
                  .promptFirstSetupStillDrivesShellAndRouteDecisions,
                strings.ui.experienceScreen
                  .themeChoicePropagatesThroughOneSemanticTokenLayer,
                strings.ui.experienceScreen
                  .sharedUiPrimitivesKeepDetailPagesAlignedAutomatically,
              ].map((item, index) => (
                <div
                  key={item}
                  className="flex gap-4 rounded-2xl border border-secondary bg-secondary_subtle p-4"
                >
                  <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-primary text-sm font-semibold text-brand-secondary">
                    {index + 1}
                  </span>
                  <p className="m-0 text-sm leading-7 text-secondary">{item}</p>
                </div>
              ))}
            </div>
          </article>

          <div className="grid gap-4">
            <article className="rounded-3xl border border-secondary bg-primary p-6 shadow-(--dashboard-shell-shadow)">
              <p className="m-0 text-xs font-semibold uppercase tracking-[0.18em] text-brand-secondary">
                {strings.ui.experienceScreen.whatChanged}
              </p>
              <div className="mt-4 space-y-4">
                {[
                  [
                    strings.ui.experienceScreen.surfaces,
                    strings.ui.experienceScreen
                      .reducedBlurRemovedGlossyCardsAndStandardizedWhiteOr,
                  ],
                  [
                    strings.ui.experienceScreen.navigation,
                    strings.ui.experienceScreen
                      .sidebarAndTopChromeNowMatchTheFlatterDashboard,
                  ],
                  [
                    strings.ui.experienceScreen.darkMode,
                    strings.ui.experienceScreen
                      .panelsStayDistinctThroughLayeringBordersAndShadowRestraint,
                  ],
                ].map(([title, description]) => (
                  <div
                    key={title}
                    className="rounded-2xl border border-secondary bg-secondary_subtle p-4"
                  >
                    <h3 className="m-0 text-base font-semibold text-primary">
                      {title}
                    </h3>
                    <p className="mt-2 m-0 text-sm leading-6 text-secondary">
                      {description}
                    </p>
                  </div>
                ))}
              </div>
            </article>
          </div>
        </section>

        <section
          id="gallery"
          className="experience-reveal grid gap-6 rounded-3xl border border-secondary bg-primary p-6 shadow-(--dashboard-shell-shadow)"
          data-visible={visibleState('gallery')}
        >
          <div className="grid gap-2">
            <p className="m-0 text-xs font-semibold uppercase tracking-[0.18em] text-brand-secondary">
              {strings.ui.experienceScreen.showcase}
            </p>
            <h2 className="m-0 font-display text-3xl font-semibold tracking-tight text-primary sm:text-4xl">
              {
                strings.ui.experienceScreen
                  .theSameDesignLanguageScalesFromHeroSectionsTo
              }
            </h2>
          </div>
          <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
            <article className="rounded-[24px] border border-secondary bg-secondary_subtle p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="m-0 text-xs font-semibold uppercase tracking-[0.16em] text-tertiary">
                    {strings.ui.experienceScreen.dashboardPreview}
                  </p>
                  <h3 className="mt-2 text-2xl font-semibold text-primary">
                    {strings.ui.experienceScreen.neutralCanvasSelectiveAccent}
                  </h3>
                </div>
                <span className="inline-flex rounded-full bg-brand-primary px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-brand-secondary">
                  {strings.ui.experienceScreen.preview}
                </span>
              </div>
              <div className="mt-5 grid gap-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-xl border border-secondary bg-primary p-4">
                    <p className="m-0 text-sm font-semibold text-primary">
                      {strings.ui.experienceScreen.revenueMix}
                    </p>
                    <div
                      className="mt-4 h-36 rounded-lg"
                      style={{
                        backgroundImage:
                          'linear-gradient(180deg, color-mix(in srgb, var(--color-brand-500) 14%, transparent), transparent), linear-gradient(180deg, var(--color-bg-secondary_subtle), var(--color-bg-primary))',
                      }}
                    />
                  </div>
                  <div className="rounded-xl border border-secondary bg-primary p-4">
                    <p className="m-0 text-sm font-semibold text-primary">
                      {strings.ui.experienceScreen.topChannels}
                    </p>
                    <div className="mt-4 space-y-3">
                      {[
                        strings.ui.experienceScreen.product,
                        strings.ui.experienceScreen.support,
                        strings.ui.experienceScreen.growth,
                      ].map((item, index) => (
                        <div key={item}>
                          <div className="flex items-center justify-between gap-3 text-sm text-secondary">
                            <span>{item}</span>
                            <span>
                              {[42, 33, 25][index]}
                              {strings.ui.experienceScreen.text}
                            </span>
                          </div>
                          <div className="mt-2 h-2 rounded-full bg-secondary">
                            <div
                              className="h-2 rounded-full bg-brand-solid"
                              style={{ width: `${[42, 33, 25][index]}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="rounded-xl border border-secondary bg-primary p-4">
                  <p className="m-0 text-sm font-semibold text-primary">
                    {strings.ui.experienceScreen.recentActivity}
                  </p>
                  <div className="mt-4 space-y-3">
                    {[
                      strings.ui.experienceScreen
                        .sidebarChromeUpdatedToFlatterCardTreatment,
                      strings.ui.experienceScreen
                        .tablesNowUseSofterRowHoverAndCleanerSeparators,
                      strings.ui.experienceScreen
                        .themeAccentsDriveSelectedStateWithoutFloodingSurfaces,
                    ].map((item) => (
                      <div
                        key={item}
                        className="flex items-start gap-3 text-sm text-secondary"
                      >
                        <span className="mt-1 h-2.5 w-2.5 rounded-full bg-brand-solid" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </article>
            <div className="grid gap-4">
              {[
                strings.ui.experienceScreen
                  .activeStateNowLivesInNavigationPillsAndPrimary,
                strings.ui.experienceScreen
                  .cardsRelyOnBorderContrastAndSpacingMoreThan,
                strings.ui.experienceScreen
                  .theDarkPaletteUsesSlateLayersInsteadOfGlossy,
                strings.ui.experienceScreen
                  .featurePagesInheritTheNewSystemThroughSharedPrimitives,
              ].map((item, index) => (
                <article
                  key={item}
                  className="rounded-2xl border border-secondary bg-secondary_subtle p-4"
                >
                  <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-brand-secondary">
                    {strings.ui.experienceScreen.value0}
                    {index + 1}
                  </p>
                  <p className="mt-2 m-0 text-sm leading-6 text-secondary">
                    {item}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section
          id="motion"
          className="experience-reveal grid gap-6 rounded-3xl border border-secondary bg-primary p-6 shadow-(--dashboard-shell-shadow)"
          data-visible={visibleState('motion')}
        >
          <div className="grid gap-2">
            <p className="m-0 text-xs font-semibold uppercase tracking-[0.18em] text-brand-secondary">
              {strings.ui.experienceScreen.presentationMotion}
            </p>
            <h2 className="m-0 font-display text-3xl font-semibold tracking-tight text-primary sm:text-4xl">
              {
                strings.ui.experienceScreen
                  .motionIsStillConfigurableButTheChromeAroundIt
              }
            </h2>
            <p className="m-0 max-w-3xl text-sm leading-7 text-secondary">
              {
                strings.ui.experienceScreen
                  .useTheSameControlsAsBeforeToChangeToast
              }
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button
              variant="secondary"
              onClick={async () => {
                presentation.setMotionConfig({
                  enabled: true,
                  toastDurationMs: 170,
                  alertDurationMs: 180,
                  sheetDurationMs: 190,
                });
                await presentation.showToast({
                  title: strings.ui.experienceScreen.fastMotionPreset,
                  description:
                    strings.ui.experienceScreen
                      .presentationOverlaysNowAnimateAtASnappierPace,
                  intent: 'success',
                });
              }}
            >
              {strings.ui.experienceScreen.fast}
            </Button>
            <Button
              variant="secondary"
              onClick={async () => {
                presentation.setMotionConfig({
                  enabled: true,
                  toastDurationMs: 280,
                  alertDurationMs: 300,
                  sheetDurationMs: 320,
                });
                await presentation.showToast({
                  title: strings.ui.experienceScreen.relaxedMotionPreset,
                  description:
                    strings.ui.experienceScreen
                      .transitionsNowRunWithSlowerTimingForACalmer,
                  intent: 'info',
                });
              }}
            >
              {strings.ui.experienceScreen.relaxed}
            </Button>
            <Button
              variant="ghost"
              onClick={async () => {
                presentation.setMotionConfig({ enabled: false });
                await presentation.showToast({
                  title: strings.ui.experienceScreen.motionDisabled,
                  description:
                    strings.ui.experienceScreen
                      .allPresentationAnimationsAreNowTurnedOff,
                  intent: 'warning',
                  motion: { enabled: false },
                });
              }}
            >
              {strings.ui.experienceScreen.disableMotion}
            </Button>
            <Button
              onClick={async () => {
                presentation.setMotionConfig({
                  enabled: true,
                  toastDurationMs: 220,
                  alertDurationMs: 240,
                  sheetDurationMs: 260,
                });
                await presentation.showAlert({
                  title: strings.ui.experienceScreen.defaultMotionRestored,
                  description:
                    strings.ui.experienceScreen
                      .toastAlertAndSheetTimingsAreBackToDefault,
                  tone: 'info',
                  confirmLabel: strings.ui.experienceScreen.done,
                  cancelLabel: strings.ui.experienceScreen.dismiss,
                });
              }}
            >
              {strings.ui.experienceScreen.resetDefaults}
            </Button>
          </div>
        </section>

        <section
          id="contact"
          className="experience-reveal grid gap-8"
          data-visible={visibleState('contact')}
        >
          <div className="grid gap-3 lg:max-w-3xl">
            <p className="m-0 text-xs font-semibold uppercase tracking-[0.2em] text-brand-secondary">
              {strings.ui.experienceScreen.contact}
            </p>
            <h2 className="font-display text-4xl font-semibold tracking-tight text-primary sm:text-5xl">
              {
                strings.ui.experienceScreen
                  .mockHandoffDetailsInTheSameDashboardVisualSystem
              }
            </h2>
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            <article className="rounded-[24px] border border-secondary bg-primary p-6 shadow-(--dashboard-shell-shadow)">
              <h3 className="text-xl font-semibold text-primary">
                {strings.ui.experienceScreen.contactDetails}
              </h3>
              <div className="mt-4 grid gap-1 text-sm leading-7 text-secondary">
                <p className="m-0">{strings.ui.experienceScreen.ariBennett}</p>
                <p className="m-0">
                  {strings.ui.experienceScreen.founderSemanticStudio}
                </p>
                <p className="m-0">
                  {strings.ui.experienceScreen.supportSemanticstudioDev}
                </p>
                <p className="m-0">
                  {strings.ui.experienceScreen.value14155550199}
                </p>
              </div>
            </article>
            <article className="rounded-[24px] border border-secondary bg-primary p-6 shadow-(--dashboard-shell-shadow)">
              <h3 className="text-xl font-semibold text-primary">
                {strings.ui.experienceScreen.officeHours}
              </h3>
              <div className="mt-4 grid gap-1 text-sm leading-7 text-secondary">
                <p className="m-0">
                  {strings.ui.experienceScreen.monThu900Am600PmPt}
                </p>
                <p className="m-0">
                  {strings.ui.experienceScreen.fri900Am300PmPt}
                </p>
                <p className="m-0">
                  {strings.ui.experienceScreen.responseSlaUnder1BusinessDay}
                </p>
              </div>
            </article>
            <article className="rounded-[24px] border border-secondary bg-primary p-6 shadow-(--dashboard-shell-shadow)">
              <h3 className="text-xl font-semibold text-primary">
                {strings.ui.experienceScreen.mockAddress}
              </h3>
              <div className="mt-4 grid gap-1 text-sm leading-7 text-secondary">
                <p className="m-0">
                  {strings.ui.experienceScreen.value410MarketStreet}
                </p>
                <p className="m-0">
                  {strings.ui.experienceScreen.sanFranciscoCa}
                </p>
                <p className="m-0">
                  {
                    strings.ui.experienceScreen
                      .builtForFrontendBackendSemanticParity
                  }
                </p>
              </div>
            </article>
          </div>
        </section>

        <section
          id="faq"
          className="experience-reveal grid gap-4"
          data-visible={visibleState('faq')}
        >
          <p className="m-0 text-xs font-semibold uppercase tracking-[0.18em] text-brand-secondary">
            {strings.ui.experienceScreen.faq}
          </p>
          <div className="grid gap-3">
            {faqItems.map((faq) => {
              const isOpen = expandedFaq === faq.question;

              return (
                <article
                  key={faq.question}
                  className="rounded-2xl border border-secondary bg-primary shadow-(--dashboard-shell-shadow)"
                >
                  <Button
                    variant="ghost"
                    type="button"
                    onClick={() =>
                      setExpandedFaq((current) =>
                        current === faq.question ? null : faq.question,
                      )
                    }
                    aria-expanded={isOpen}
                    className="flex w-full items-center justify-between gap-4 px-4 py-4 text-left"
                  >
                    <h3 className="m-0 text-base font-semibold text-primary">
                      {faq.question}
                    </h3>
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-secondary_subtle text-primary transition-transform duration-300 ease-out">
                      {isOpen ? '−' : '+'}
                    </span>
                  </Button>
                  <div
                    className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${
                      isOpen
                        ? 'grid-rows-[1fr] opacity-100'
                        : 'grid-rows-[0fr] opacity-0'
                    }`}
                  >
                    <div className="min-h-0 overflow-hidden">
                      <div className="border-t border-secondary px-4 py-4">
                        <p className="m-0 text-sm leading-6 text-secondary">
                          {faq.answer}
                        </p>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </div>

      <footer
        className="experience-reveal relative left-1/2 w-screen -translate-x-1/2 border-t border-secondary bg-primary"
        data-visible={visibleState('faq')}
      >
        <div className="mx-auto grid w-full max-w-7xl gap-8 px-6 py-10 text-center sm:px-8 lg:px-10">
          <div className="grid justify-items-center gap-3">
            <strong className="text-lg text-primary">
              {strings.ui.experienceScreen.portalTemplate}
            </strong>
            <p className="max-w-2xl text-sm leading-7 text-secondary">
              {
                strings.ui.experienceScreen
                  .operationalSoftwareImmersiveRoutesAndFrontendArchitectureThatStay
              }
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-4">
            <div className="grid gap-2">
              <p className="m-0 text-xs font-semibold uppercase tracking-[0.16em] text-brand-secondary">
                {strings.ui.experienceScreen.product}
              </p>
              <p className="m-0 text-sm text-secondary">
                {strings.ui.experienceScreen.overview}
              </p>
              <p className="m-0 text-sm text-secondary">
                {strings.ui.experienceScreen.pricing}
              </p>
              <p className="m-0 text-sm text-secondary">
                {strings.ui.experienceScreen.roadmap}
              </p>
              <p className="m-0 text-sm text-secondary">
                {strings.ui.experienceScreen.changelog}
              </p>
            </div>
            <div className="grid gap-2">
              <p className="m-0 text-xs font-semibold uppercase tracking-[0.16em] text-brand-secondary">
                {strings.ui.experienceScreen.solutions}
              </p>
              <p className="m-0 text-sm text-secondary">
                {strings.ui.experienceScreen.clinicSites}
              </p>
              <p className="m-0 text-sm text-secondary">
                {strings.ui.experienceScreen.providerPortals}
              </p>
              <p className="m-0 text-sm text-secondary">
                {strings.ui.experienceScreen.operationsHub}
              </p>
              <p className="m-0 text-sm text-secondary">
                {strings.ui.experienceScreen.educationPages}
              </p>
            </div>
            <div className="grid gap-2">
              <p className="m-0 text-xs font-semibold uppercase tracking-[0.16em] text-brand-secondary">
                {strings.ui.experienceScreen.resources}
              </p>
              <p className="m-0 text-sm text-secondary">
                {strings.ui.experienceScreen.guides}
              </p>
              <p className="m-0 text-sm text-secondary">
                {strings.ui.experienceScreen.apiDocs}
              </p>
              <p className="m-0 text-sm text-secondary">
                {strings.ui.experienceScreen.playbooks}
              </p>
              <p className="m-0 text-sm text-secondary">
                {strings.ui.experienceScreen.support}
              </p>
            </div>
            <div className="grid gap-2">
              <p className="m-0 text-xs font-semibold uppercase tracking-[0.16em] text-brand-secondary">
                {strings.ui.experienceScreen.company}
              </p>
              <p className="m-0 text-sm text-secondary">
                {strings.ui.experienceScreen.about}
              </p>
              <p className="m-0 text-sm text-secondary">
                {strings.ui.experienceScreen.careers}
              </p>
              <p className="m-0 text-sm text-secondary">
                {strings.ui.experienceScreen.terms}
              </p>
              <p className="m-0 text-sm text-secondary">
                {strings.ui.experienceScreen.privacy}
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
