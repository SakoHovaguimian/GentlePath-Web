import type { BlogReadableContent } from '../models/blogReadableContent';
import { isBlogImageUrl, isPublicHttpsUrl } from '../models/blogContentUrl';

export function canRenderBlogContent(block: BlogReadableContent): boolean {
  switch (block.contentType) {
    case 'link':
    case 'embed':
      return isPublicHttpsUrl(block.metaData.url);
    case 'image':
      return isBlogImageUrl(block.metaData.src);
    case 'gallery2':
    case 'gallery3':
    case 'gallery4':
      return block.metaData.images.every((image) => isBlogImageUrl(image.src));
    default:
      return true;
  }
}
