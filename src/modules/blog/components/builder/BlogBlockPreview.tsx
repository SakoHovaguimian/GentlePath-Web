import type { BlogContentType } from '../../models/blogContentType';
import styles from '../../Blog.module.css';

export function BlogBlockPreview({ type }: { type: BlogContentType }) {
  const lines = (
    <>
      <path d="M10 22h44M10 29h44M10 36h30" />
    </>
  );
  let content;
  switch (type) {
    case 'header':
      content = (
        <>
          <path d="M10 17h34" strokeWidth="4" />
          <path d="M10 29h44M10 36h28" />
        </>
      );
      break;
    case 'section':
      content = lines;
      break;
    case 'footer':
      content = (
        <>
          <path d="M10 13h44" opacity=".4" />
          {lines}
        </>
      );
      break;
    case 'quote':
      content = (
        <>
          <path
            d="M11 15h9v9h-5c0 4 2 6 5 7M27 15h9v9h-5c0 4 2 6 5 7"
            strokeWidth="2.5"
          />
          <path d="M11 40h34" opacity=".4" />
        </>
      );
      break;
    case 'bullet':
      content = (
        <>
          {[17, 27, 37].map((y) => (
            <g key={y}>
              <circle cx="11" cy={y} r="1.5" fill="currentColor" />
              <path d={`M18 ${y}h35`} />
            </g>
          ))}
        </>
      );
      break;
    case 'divider':
      content = <path d="M9 27h46" />;
      break;
    case 'embed':
      content = (
        <>
          <rect x="8" y="9" width="48" height="34" rx="4" />
          <path d="m27 19 12 7-12 7Z" fill="currentColor" stroke="none" />
        </>
      );
      break;
    case 'image':
      content = (
        <>
          <rect x="8" y="9" width="48" height="34" rx="4" />
          <circle cx="43" cy="19" r="3" />
          <path d="m9 36 13-13 14 14 8-7 11 11" />
        </>
      );
      break;
    case 'gallery2':
    case 'gallery3':
    case 'gallery4': {
      const count = Number(type.slice(-1));
      content = (
        <>
          {Array.from({ length: count }, (_, i) => {
            const cols = count === 4 ? 2 : count;
            const w = (48 - (cols - 1) * 4) / cols;
            const x = 8 + (i % cols) * (w + 4);
            const h = count === 4 ? 15 : 34;
            const y = 9 + Math.floor(i / cols) * (h + 4);
            return (
              <g key={i}>
                <rect x={x} y={y} width={w} height={h} rx="2" />
                <path
                  d={`M${x + 3} ${y + h - 4}l${w / 3} -${h / 3} ${w / 3} ${h / 3}`}
                />
              </g>
            );
          })}
        </>
      );
      break;
    }
    case 'callout':
      content = (
        <>
          <rect x="7" y="9" width="50" height="34" rx="4" />
          <path d="M14 17v18" strokeWidth="3" />
          <path d="M23 18h25M23 26h25M23 34h17" />
        </>
      );
      break;
    case 'link':
      content = (
        <>
          <path d="m26 29 12-12m-9 1 5-5a7 7 0 0 1 10 10l-5 5m-4 4-5 5a7 7 0 0 1-10-10l5-5" />
          <path d="M14 44h36" opacity=".4" />
        </>
      );
      break;
  }
  return (
    <span className={styles.blockPreview} aria-hidden="true">
      <svg
        viewBox="0 0 64 52"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {content}
      </svg>
    </span>
  );
}
