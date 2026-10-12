import type { Route } from 'next';
import Link from 'next/link';
import styles from './DataTable.module.css';

// The visible record link owns keyboard focus and its accessible name. This
// sibling link extends the same destination across otherwise passive content.
export function TableRowLink({
  href,
  onNavigate,
}: {
  href: string;
  onNavigate?: (href: string) => void;
}) {
  return (
    <Link
      href={href as Route}
      onNavigate={
        onNavigate
          ? (event) => {
              event.preventDefault();
              onNavigate(href);
            }
          : undefined
      }
      aria-hidden="true"
      tabIndex={-1}
      prefetch={false}
      className={styles.link}
    />
  );
}
