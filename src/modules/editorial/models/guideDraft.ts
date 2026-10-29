import type { Guide } from './guide';
import type { ContentMetadata } from './contentMetadata';

const empty = '';

export interface GuideDraftItem {
  id: string;
  persistedId?: string;
  title: string;
  description: string;
  imageUrl: string;
  sourceName: string;
  sourceUrl: string;
  sourceDate: string;
  metadataText: string;
}
export interface GuideDraft {
  title: string;
  description: string;
  imageUrl: string;
  items: GuideDraftItem[];
}
export function emptyGuideItem(id = crypto.randomUUID()): GuideDraftItem {
  return {
    id,
    title: empty,
    description: empty,
    imageUrl: empty,
    sourceName: empty,
    sourceUrl: empty,
    sourceDate: empty,
    metadataText: '{}',
  };
}
export function createGuideDraft(guide?: Guide): GuideDraft {
  if (!guide)
    return {
      title: empty,
      description: empty,
      imageUrl: empty,
      items: [emptyGuideItem('draft-step-1')],
    };
  return {
    title: guide.title,
    description: guide.description,
    imageUrl: guide.image_url ?? '',
    items: [...guide.items]
      .sort((a, b) => a.position - b.position)
      .map((item) => {
        const extra: ContentMetadata = { ...item.additional_properties };
        for (const key of ['source_name', 'source_url', 'source_published_at'])
          delete extra[key];
        const text = (key: string) =>
          typeof item.additional_properties[key] === 'string'
            ? (item.additional_properties[key] as string)
            : '';
        return {
          id: item.id,
          persistedId: item.id,
          title: item.title ?? '',
          description: item.description,
          imageUrl: item.image_url ?? '',
          sourceName: text('source_name'),
          sourceUrl: text('source_url'),
          sourceDate: text('source_published_at'),
          metadataText: JSON.stringify(extra, null, 2),
        };
      }),
  };
}
