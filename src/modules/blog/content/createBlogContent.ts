import type { BlogContent } from '../models/blogContent';
import type { BlogContentType } from '../models/blogContentType';

const empty = '';

export function createBlogContent(contentType: BlogContentType): BlogContent {
  const id = crypto.randomUUID();
  switch (contentType) {
    case 'header':
    case 'footer':
      return { id, contentType, metaData: { text: empty } };
    case 'section':
      return {
        id,
        contentType,
        metaData: { title: empty, body: empty, format: 'plain' },
      };
    case 'quote':
      return { id, contentType, metaData: { text: empty, attribution: empty } };
    case 'bullet':
      return { id, contentType, metaData: { items: [''] } };
    case 'divider':
      return { id, contentType, metaData: {} };
    case 'embed':
      return {
        id,
        contentType,
        metaData: { url: empty, title: empty, caption: empty },
      };
    case 'image':
      return {
        id,
        contentType,
        metaData: { src: empty, alt: empty, caption: empty },
      };
    case 'gallery2':
    case 'gallery3':
    case 'gallery4':
      return {
        id,
        contentType,
        metaData: {
          images: Array.from({ length: Number(contentType.slice(-1)) }, () => ({
            src: empty,
            alt: empty,
            caption: empty,
          })),
          caption: empty,
        },
      };
    case 'callout':
      return { id, contentType, metaData: { title: empty, text: empty } };
    case 'link':
      return { id, contentType, metaData: { url: empty, text: empty } };
  }
}
