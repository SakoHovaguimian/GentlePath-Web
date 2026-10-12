'use client';

import { useEffect, useState } from 'react';
import { Badge, Button, Message, Page, PageHeader } from '@/components/ui';
import { strings } from '@/strings';
import { FoundationsShowcase } from './components/FoundationsShowcase';
import { PatternsShowcase } from './components/PatternsShowcase';
import { ButtonsShowcase } from './components/ButtonsShowcase';
import { InputsShowcase } from './components/InputsShowcase';
import { SelectionShowcase } from './components/SelectionShowcase';
import { TilesShowcase } from './components/TilesShowcase';
import { CardsShowcase } from './components/CardsShowcase';
import { SectionsShowcase } from './components/SectionsShowcase';
import { FeedbackShowcase } from './components/FeedbackShowcase';
import { EmptyStatesShowcase } from './components/EmptyStatesShowcase';
import { TableShowcase } from './components/TableShowcase';
import { ThemeControls } from '@/modules/settings/components/ThemeControls';
import { MotionShowcase } from './components/MotionShowcase';
import { EditingShowcase } from './components/EditingShowcase';
import { CollectionShowcase } from './components/CollectionShowcase';
import { MediaShowcase } from './components/MediaShowcase';
const copy = strings.componentLibrary;

const sections = [
  ['theme', strings.designSystem.theme],
  ['foundations', copy.foundations],
  ['motion', strings.designSystem.motion],
  ['patterns', copy.patterns],
  ['buttons', copy.buttons],
  ['inputs', copy.inputs],
  ['selection', copy.selection],
  ['tiles', copy.tiles],
  ['cards', copy.cards],
  ['sections', copy.formSections],
  ['feedback', copy.feedback],
  ['empty-states', copy.emptyStates],
  ['table', copy.table],
  ['collections', strings.designSystem.reorder],
  ['editing', strings.designSystem.advanced],
  ['media', strings.designSystem.media],
] as const;

// Tracks the reading position, including sections too short to reach the top.
function useActiveSection() {
  const [active, setActive] = useState<string>(sections[0][0]);
  useEffect(() => {
    const elements = sections.flatMap(([id]) => {
      const element = document.getElementById(id);
      return element ? [element] : [];
    });
    let frame: number | undefined;
    const update = () => {
      frame = undefined;
      const root = document.scrollingElement;
      const last = elements.at(-1);
      if (!root || !last) return;

      if (root.scrollTop + root.clientHeight >= root.scrollHeight - 2) {
        setActive(last.id);
        return;
      }

      const readingLine = window.innerHeight * 0.2;
      let current = elements[0];
      for (const element of elements) {
        if (element.getBoundingClientRect().top > readingLine) break;
        current = element;
      }
      if (current) setActive(current.id);
    };
    const scheduleUpdate = () => {
      if (frame === undefined) frame = window.requestAnimationFrame(update);
    };
    const observer = new ResizeObserver(scheduleUpdate);
    elements.forEach((element) => observer.observe(element));
    window.addEventListener('scroll', scheduleUpdate, { passive: true });
    window.addEventListener('resize', scheduleUpdate);
    scheduleUpdate();
    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', scheduleUpdate);
      window.removeEventListener('resize', scheduleUpdate);
      if (frame !== undefined) window.cancelAnimationFrame(frame);
    };
  }, []);
  return active;
}

export function ComponentLibraryScreen() {
  const active = useActiveSection();
  return (
    <Page>
      <PageHeader
        title={copy.title}
        description={copy.description}
        meta={
          <>
            <Badge intent="brand">{copy.version}</Badge>
            <span>{copy.system}</span>
          </>
        }
      />
      <div className="grid min-w-0 items-start gap-8 xl:grid-cols-[13rem_minmax(0,1fr)] xl:gap-10">
        <div className="min-w-0 xl:sticky xl:top-24">
          <nav
            aria-label={copy.navigation}
            className="min-w-0 xl:max-h-[calc(100dvh-7rem)] xl:overflow-y-auto xl:pr-2"
          >
            <p className="m-0 mb-2 hidden px-3 text-xs font-semibold text-tertiary xl:block">
              {copy.onThisPage}
            </p>
            <ul className="m-0 flex list-none flex-wrap gap-1 p-0 xl:grid">
              {sections.map(([id, label]) => (
                <li key={id}>
                  <Button
                    variant="ghost"
                    asChild
                    className="min-h-10 w-full justify-start px-3 py-2 text-left data-active:bg-brand-primary data-active:text-brand-secondary"
                  >
                    <a
                      href={`#${id}`}
                      data-active={active === id || undefined}
                      aria-current={active === id ? 'location' : undefined}
                    >
                      {label}
                    </a>
                  </Button>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <div className="grid min-w-0 gap-12">
          <Message
            intent="neutral"
            title={copy.localPreview}
            description={copy.localPreviewHint}
            role="note"
          />
          <section
            id="theme"
            aria-label={strings.designSystem.theme}
            className="rounded-xl border border-secondary bg-primary p-4 sm:p-6"
          >
            <ThemeControls />
          </section>
          <FoundationsShowcase />
          <MotionShowcase />
          <PatternsShowcase />
          <ButtonsShowcase />
          <InputsShowcase />
          <SelectionShowcase />
          <TilesShowcase />
          <CardsShowcase />
          <SectionsShowcase />
          <FeedbackShowcase />
          <EmptyStatesShowcase />
          <TableShowcase />
          <CollectionShowcase />
          <EditingShowcase />
          <MediaShowcase />
        </div>
      </div>
    </Page>
  );
}
