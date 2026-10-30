import type { SVGProps } from 'react';
import type { IconName } from '../models/iconName';
import { cn } from '../lib/cn';

const paths: Record<IconName, string> = {
  folder: 'M3 7V4h6l2 3h10v13H3V7Z',
  chat: 'M4 4h16v12H9l-5 4V4Zm4 5h8m-8 3h5',
  bell: 'M6 9a6 6 0 0 1 12 0v6l2 3H4l2-3V9Zm4 12h4M12 1v2',
  sun: 'M8 12a4 4 0 1 0 8 0 4 4 0 0 0-8 0ZM12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5',
  moon: 'M21 13A9 9 0 0 1 11 3a9 9 0 1 0 10 10Z',
  calendar: 'M4 5h16v16H4V5ZM8 3v4m8-4v4M4 10h16M8 14h2m4 0h2m-8 3h2',
  heart: 'M20 5a5 5 0 0 0-8 1 5 5 0 0 0-8-1c-3 3-1 7 8 14 9-7 11-11 8-14Z',
  star: 'm12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.3l-5.6 2.9 1.1-6.2L3 9.6l6.2-.9L12 3Z',
  image: 'M3 3h18v18H3V3Zm0 14 5-5 4 4 3-3 6 6M15 7h.01',
  upload: 'M12 16V3m-5 5 5-5 5 5M4 15v6h16v-6',
  download: 'M12 3v13m-5-5 5 5 5-5M4 15v6h16v-6',
  gift: 'M3 8h18v4H3V8Zm2 4v9h14v-9M12 8v13M12 8H7.5A2.5 2.5 0 1 1 10 5.5L12 8Zm0 0h4.5A2.5 2.5 0 1 0 14 5.5L12 8Z',
  pin: 'M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0ZM9 10a3 3 0 1 0 6 0 3 3 0 0 0-6 0Z',
  wifi: 'M3 8a14 14 0 0 1 18 0M6 12a9 9 0 0 1 12 0M9 16a4.5 4.5 0 0 1 6 0M12 20h.01',
  bold: 'M6 4h7a4 4 0 0 1 0 8H6V4Zm0 8h8a4 4 0 0 1 0 8H6v-8Z',
  italic: 'M11 4h9M4 20h9M15 4 9 20',
  strikethrough:
    'M18 6c-1-2-3-3-6-3-4 0-6 2-6 4 0 2 2 3 6 4M6 18c1 2 3 3 6 3 4 0 6-2 6-4 0-1-.5-2-2-3M3 12h18',
  link: 'M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-2 2M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l2-2',
  listBullet: 'M9 6h12M9 12h12M9 18h12M3 6h.01M3 12h.01M3 18h.01',
  listNumbered:
    'M10 6h11M10 12h11M10 18h11M3 4h1v5M3 9h2M2 14a2 2 0 0 1 4 0c0 2-4 3-4 5h4',
  checklist: 'm2 6 2 2 3-4M11 6h10m-19 7 2 2 3-4M11 13h10M3 20h3m5 0h10',
  quote:
    'M3 5h7v7H5c0 3 2 5 5 5v2c-5 0-7-4-7-7V5Zm11 0h7v7h-5c0 3 2 5 5 5v2c-5 0-7-4-7-7V5Z',
  inlineCode: 'm8 8-4 4 4 4m8-8 4 4-4 4M14 5l-4 14',
  codeBlock:
    'M3 3h18v18H3V3Zm0 5h18m-11 3-3 3 3 3m4-6 3 3-3 3M6 5.5h.01M9 5.5h.01',
  table: 'M3 4h18v16H3V4Zm0 5h18M3 14h18M9 4v16m6-16v16',
  divider: 'M3 12h18M9 5h6M9 19h6',
  footnote: 'M3 17h9M6 17V6h9M16 3h2v7m-2 0h4',
  undo: 'M9 5 4 10l5 5M4 10h10a6 6 0 0 1 6 6v3',
  redo: 'm15 5 5 5-5 5M20 10H10a6 6 0 0 0-6 6v3',
  heading1: 'M3 5v14M11 5v14M3 12h8M16 8l3-2v13M16 19h6',
  heading2: 'M3 5v14M11 5v14M3 12h8M16 9a3 3 0 0 1 6 0c0 3-6 5-6 10h6',
  heading3:
    'M3 5v14M11 5v14M3 12h8M16 6h3a3 3 0 0 1 0 6h-2m2 0a3.5 3.5 0 0 1 0 7h-3',
  grip: 'M9 5h.01M15 5h.01M9 12h.01M15 12h.01M9 19h.01M15 19h.01',
  leaf: 'M20 4c-9-1-16 3-16 9a6 6 0 0 0 6 6c6 0 10-7 10-15ZM4 21 16 9',
  home: 'm3 10 9-7 9 7M5 9v12h14V9M9 21v-7h6v7',
  store: 'M4 10v11h16V10M3 10l2-7h14l2 7H3Zm6 11v-7h6v7',
  grid: 'M3 3h7v7H3Zm11 0h7v7h-7ZM3 14h7v7H3Zm11 0h7v7h-7Z',
  settings:
    'm9 3-1 3-3 1-2 3 2 2v3l3 2 1 4h6l1-4 3-2v-3l2-2-2-3-3-1-1-3H9ZM9 12a3 3 0 1 0 6 0 3 3 0 0 0-6 0Z',
  user: 'M8 7a4 4 0 1 0 8 0 4 4 0 0 0-8 0ZM4 21v-2a8 8 0 0 1 16 0v2',
  search: 'M3 10a7 7 0 1 0 14 0 7 7 0 0 0-14 0Zm12 5 6 6',
  filter: 'M3 4h18l-7 8v8l-4-2v-6L3 4Z',
  plus: 'M12 5v14M5 12h14',
  close: 'm6 6 12 12M18 6 6 18',
  menu: 'M4 6h16M4 12h16M4 18h16',
  check: 'm5 12 4 4L19 6',
  chevronRight: 'm9 5 7 7-7 7',
  chevronDown: 'm5 9 7 7 7-7',
  trash: 'M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7m4-7v7',
  box: 'm3 7 9-4 9 4v10l-9 4-9-4V7Zm0 0 9 5 9-5M12 12v9M7 5l9 5',
  tag: 'M3 3h8l10 10-8 8L3 11V3Zm4 4h.01',
  bag: 'M4 7h16v14H4V7Zm4 3V6a4 4 0 0 1 8 0v4',
  flask: 'M9 3h6M10 3v7L4 20a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1l-6-10V3M8 14h8',
  cookie:
    'M20.5 14A9 9 0 1 1 10 3a5 5 0 0 0 6 5 4 4 0 0 0 4.5 6ZM8 8h.01M7 14h.01M12 17h.01M13 11h.01',
  cannabis:
    'M12 22v-9M12 17C9 12 9 7 12 2c3 5 3 10 0 15Zm0 0C6 17 3 13 2 8c5 1 9 4 10 9Zm0 0c6 0 9-4 10-9-5 1-9 4-10 9ZM12 17c-3-1-6 0-8 3 4 1 7 0 8-3Zm0 0c3-1 6 0 8 3-4 1-7 0-8-3Z',
  bong: 'M8 3h5M9 3v11l-4 5v2h13v-2l-6-5V3M13 15l5-5m-2-2 4 4M7 18h9',
  vape: 'm7 18 8-13 4 3-8 13-4-3Zm8-13 1-2 4 3-1 2M9 15l4 3',
  candy: 'm8 7 9 2-2 9-9-2 2-9Zm0 0L4 3 2 9l4 4m11-4 5-1-2 6-5 4M10 11l3 3',
  jelly:
    'M5 20 7 6c3-3 7-3 10 0l2 14H5Zm2-14c3 3 7 3 10 0M9 9l-1 8m4-7v7m3-8 1 8M3 21h18',
  drop: 'M12 3C9 7 5 11 5 15a7 7 0 0 0 14 0c0-4-4-8-7-12Zm-3 12a3 3 0 0 0 3 3',
  file: 'M5 3h9l5 5v13H5V3Zm9 0v5h5M9 12h6m-6 4h6',
  card: 'M3 5h18v14H3V5Zm0 5h18M7 15h4',
  dollar: 'M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6',
  chart: 'M5 20v-7m7 7V8m7 12V3',
  arrowUp: 'M12 20V4m-6 6 6-6 6 6',
  info: 'M3 12a9 9 0 1 0 18 0 9 9 0 0 0-18 0Zm9-1v6m0-10h.01',
  warning: 'm12 3 10 18H2L12 3Zm0 6v5m0 3h.01',
  mail: 'M3 5h18v14H3V5Zm0 0 9 8 9-8',
  lock: 'M5 10h14v11H5V10Zm3 0V7a4 4 0 0 1 8 0v3M12 14v3',
  code: 'm8 6-6 6 6 6m8-12 6 6-6 6M14 3l-4 18',
  refresh:
    'M20 11a8 8 0 0 0-14.9-3.9M4 4v4h4m-4 5a8 8 0 0 0 14.9 3.9M20 20v-4h-4',
  clock: 'M3 12a9 9 0 1 0 18 0 9 9 0 0 0-18 0Zm9-5v5l3 2',
  chevronLeft: 'm15 5-7 7 7 7',
  arrowRight: 'M4 12h16m-6-6 6 6-6 6',
  layers: 'm12 3 9 5-9 5-9-5 9-5Zm-9 9 9 5 9-5M3 16l9 5 9-5',
  phone:
    'M5 3h4l2 5-2.5 1.5a11 11 0 0 0 6 6L16 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 5a2 2 0 0 1 2-2Z',
  globe:
    'M3 12a9 9 0 1 0 18 0 9 9 0 0 0-18 0Zm0 0h18M12 3c2.5 2.5 3.5 5.5 3.5 9s-1 6.5-3.5 9c-2.5-2.5-3.5-5.5-3.5-9s1-6.5 3.5-9Z',
  sparkles:
    'm10 3 1.9 5.1L17 10l-5.1 1.9L10 17l-1.9-5.1L3 10l5.1-1.9L10 3Zm8 11 .9 2.1L21 17l-2.1.9L18 20l-.9-2.1L15 17l2.1-.9L18 14ZM18 3v4m-2-2h4',
};

export function UiIcon({
  name,
  className,
  ...props
}: SVGProps<SVGSVGElement> & { name: IconName }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={cn('inline-block size-5 shrink-0 align-middle', className)}
      {...props}
    >
      <path d={paths[name]} />
    </svg>
  );
}
