import type { BlogContent } from '../models/blogContent';

export function blogContentText(content: BlogContent[]): string {
  return content
    .map((block) => {
      switch (block.contentType) {
        case 'header':
        case 'footer':
          return block.metaData.text;
        case 'section':
          return `${block.metaData.title} ${block.metaData.body}`;
        case 'quote':
          return `${block.metaData.text} ${block.metaData.attribution}`;
        case 'bullet':
          return block.metaData.items.join(' ');
        case 'callout':
          return `${block.metaData.title} ${block.metaData.text}`;
        case 'link':
          return block.metaData.text;
        case 'embed':
          return `${block.metaData.title} ${block.metaData.caption}`;
        case 'image':
          return `${block.metaData.alt} ${block.metaData.caption}`;
        case 'gallery2':
        case 'gallery3':
        case 'gallery4':
          return `${block.metaData.caption} ${block.metaData.images.map((image) => `${image.alt} ${image.caption}`).join(' ')}`;
        case 'divider':
          return '';
      }
    })
    .join(' ');
}
