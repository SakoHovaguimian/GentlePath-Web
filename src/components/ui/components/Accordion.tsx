'use client';

import {
  Button as AriaButton,
  Disclosure,
  DisclosureGroup,
  DisclosurePanel,
} from 'react-aria-components';
import { cn } from '../lib/cn';
import type { AccordionItem } from '../models/accordionItem';
import { UiIcon } from './UiIcon';
import styles from './Accordion.module.css';

/** React Aria owns keyboard interaction, expanded state, labels, and panel lifecycle. */
export function Accordion({
  items,
  className,
  itemClassName,
  headingLevel = 'h3',
  allowsMultipleExpanded = true,
}: {
  items: readonly AccordionItem[];
  className?: string;
  itemClassName?: string;
  headingLevel?: 'h2' | 'h3' | 'h4';
  allowsMultipleExpanded?: boolean;
}) {
  const Heading = headingLevel;
  return (
    <DisclosureGroup
      allowsMultipleExpanded={allowsMultipleExpanded}
      className={cn('ui-accordion grid min-w-0 gap-3', className)}
    >
      {items.map((item) => (
        <Disclosure
          key={item.id}
          id={item.id}
          className={cn(
            'ui-accordion-item min-w-0 rounded-xl border border-secondary bg-primary',
            styles.item,
            itemClassName,
          )}
        >
          <Heading className="m-0">
            <AriaButton
              slot="trigger"
              className={cn(
                'ui-accordion-trigger flex min-h-16 w-full min-w-0 cursor-pointer items-center justify-between gap-5 rounded-xl border-0 bg-transparent px-5 py-4 text-left font-body text-base font-medium text-primary hover:text-brand-secondary',
                styles.trigger,
              )}
            >
              <span className="min-w-0 wrap-anywhere">{item.title}</span>
              <UiIcon
                name="plus"
                className={cn('size-5 shrink-0', styles.icon)}
              />
            </AriaButton>
          </Heading>
          <DisclosurePanel
            className={cn('ui-accordion-panel min-w-0', styles.panel)}
          >
            <div className="ui-accordion-panel-content px-5 pb-5 text-sm text-secondary">
              {item.content}
            </div>
          </DisclosurePanel>
        </Disclosure>
      ))}
    </DisclosureGroup>
  );
}
